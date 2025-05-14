const pool = require('../config/db');
const { validationResult } = require('express-validator');

// Get all bookings for a user
exports.getUserBookings = async (req, res) => {
  try {
    const [bookings] = await pool.query(
      `SELECT b.id, b.booking_date, b.total_price, b.status,
        s.start_time, m.title as movie_title, h.name as hall_name
       FROM bookings b
       JOIN sessions s ON b.session_id = s.id
       JOIN movies m ON s.movie_id = m.id
       JOIN halls h ON s.hall_id = h.id
       WHERE b.user_id = ?
       ORDER BY b.booking_date DESC`,
      [req.user.id]
    );

    // Get seats for each booking
    for (let booking of bookings) {
      const [seats] = await pool.query(
        `SELECT s.row, s.seat_number
         FROM booking_seats bs
         JOIN seats s ON bs.seat_id = s.id
         WHERE bs.booking_id = ?
         ORDER BY s.row, s.seat_number`,
        [booking.id]
      );
      booking.seats = seats;
    }

    res.json({
      status: 'success',
      results: bookings.length,
      data: bookings
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
};

// Get booking by ID
exports.getBookingById = async (req, res) => {
  try {
    const [bookings] = await pool.query(
      `SELECT b.id, b.booking_date, b.total_price, b.status,
        s.id as session_id, s.start_time, s.price,
        m.id as movie_id, m.title as movie_title, m.poster_url,
        h.id as hall_id, h.name as hall_name
       FROM bookings b
       JOIN sessions s ON b.session_id = s.id
       JOIN movies m ON s.movie_id = m.id
       JOIN halls h ON s.hall_id = h.id
       WHERE b.id = ? AND b.user_id = ?`,
      [req.params.id, req.user.id]
    );
    
    if (bookings.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: 'Booking not found or not authorized'
      });
    }

    // Get seats for this booking
    const [seats] = await pool.query(
      `SELECT s.id, s.row, s.seat_number
       FROM booking_seats bs
       JOIN seats s ON bs.seat_id = s.id
       WHERE bs.booking_id = ?
       ORDER BY s.row, s.seat_number`,
      [req.params.id]
    );

    res.json({
      status: 'success',
      data: {
        ...bookings[0],
        seats: seats
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
};

// Create a new booking
exports.createBooking = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: 'fail', errors: errors.array() });
  }

  const { session_id, seat_ids } = req.body;

  try {
    // Check if session exists
    const [sessions] = await pool.query('SELECT * FROM sessions WHERE id = ?', [session_id]);
    
    if (sessions.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: 'Session not found'
      });
    }

    const session = sessions[0];

    // Check if all seats exist and belong to the correct hall
    const hallId = session.hall_id;

// Validate seats belong to that hall
    const [validSeats] = await pool.query(
      `SELECT id FROM seats WHERE hall_id = ? AND id IN (${seat_ids.map(() => '?').join(',')})`,
      [hallId, ...seat_ids]
    );
    
    console.log(validSeats, seat_ids);
    if (validSeats.length !== seat_ids.length) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid seat IDs provided'
      });
    }

    // Check if any of the seats are already booked
    const [bookedSeats] = await pool.query(
      `SELECT s.id, s.row, s.seat_number FROM seats s
       JOIN booking_seats bs ON s.id = bs.seat_id
       JOIN bookings b ON bs.booking_id = b.id
       WHERE b.session_id = ? AND s.id IN (${seat_ids.map(() => '?').join(',')}) AND b.status != 'cancelled'`,
      [session_id, ...seat_ids]
    );

    if (bookedSeats.length > 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'Some seats are already booked',
        bookedSeats: bookedSeats
      });
    }

    // Calculate total price
    const totalPrice = session.price * seat_ids.length;

    // Start transaction
    await pool.query('START TRANSACTION');

    // Create booking
    const [bookingResult] = await pool.query(
      'INSERT INTO bookings (session_id, user_id, total_price, status) VALUES (?, ?, ?, ?)',
      [session_id, req.user.id, totalPrice, 'confirmed']
    );

    const bookingId = bookingResult.insertId;

    // Create booking_seats entries
    const bookingSeatPromises = seat_ids.map(seatId => 
      pool.query(
        'INSERT INTO booking_seats (booking_id, seat_id) VALUES (?, ?)',
        [bookingId, seatId]
      )
    );

    await Promise.all(bookingSeatPromises);
    await pool.query('COMMIT');

    // Get the complete booking info
    const [newBooking] = await pool.query(
      `SELECT b.id, b.booking_date, b.total_price, b.status,
        s.start_time, m.title as movie_title, h.name as hall_name
       FROM bookings b
       JOIN sessions s ON b.session_id = s.id
       JOIN movies m ON s.movie_id = m.id
       JOIN halls h ON s.hall_id = h.id
       WHERE b.id = ?`,
      [bookingId]
    );

    const [seats] = await pool.query(
      `SELECT s.row, s.seat_number
       FROM booking_seats bs
       JOIN seats s ON bs.seat_id = s.id
       WHERE bs.booking_id = ?
       ORDER BY s.row, s.seat_number`,
      [bookingId]
    );

    res.status(201).json({
      status: 'success',
      data: {
        ...newBooking[0],
        seats: seats
      }
    });
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error(err);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
};

// Cancel a booking
exports.cancelBooking = async (req, res) => {
  try {
    // Check if booking exists and belongs to the user
    const [bookings] = await pool.query(
      'SELECT * FROM bookings WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    
    if (bookings.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: 'Booking not found or not authorized'
      });
    }

    const booking = bookings[0];

    // Check if the booking is not already cancelled
    if (booking.status === 'cancelled') {
      return res.status(400).json({
        status: 'fail',
        message: 'Booking is already cancelled'
      });
    }

    // Get session details to check the start time
    const [sessions] = await pool.query(
      'SELECT * FROM sessions WHERE id = ?',
      [booking.session_id]
    );

    if (sessions.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: 'Session not found'
      });
    }

    const session = sessions[0];
    const sessionStartTime = new Date(session.start_time);
    const currentTime = new Date();

    // Check if cancellation is allowed (e.g., at least 1 hour before the session)
    const hourBeforeSession = new Date(sessionStartTime);
    hourBeforeSession.setHours(hourBeforeSession.getHours() - 1);

    if (currentTime > hourBeforeSession) {
      return res.status(400).json({
        status: 'fail',
        message: 'Cannot cancel booking less than 1 hour before the session'
      });
    }

    // Update booking status
    await pool.query(
      'UPDATE bookings SET status = ? WHERE id = ?',
      ['cancelled', req.params.id]
    );

    res.json({
      status: 'success',
      message: 'Booking cancelled successfully'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
};

// Get bookings statistics (admin only)
exports.getBookingsStats = async (req, res) => {
  try {
    // Total bookings by movie
    const [movieStats] = await pool.query(
      `SELECT m.id, m.title, COUNT(b.id) as booking_count, SUM(b.total_price) as total_revenue
       FROM bookings b
       JOIN sessions s ON b.session_id = s.id
       JOIN movies m ON s.movie_id = m.id
       WHERE b.status = 'confirmed'
       GROUP BY m.id
       ORDER BY booking_count DESC`
    );

    // Total bookings by day
    const [dailyStats] = await pool.query(
      `SELECT DATE(b.booking_date) as day, COUNT(b.id) as booking_count, SUM(b.total_price) as total_revenue
       FROM bookings b
       WHERE b.status = 'confirmed'
       GROUP BY DATE(b.booking_date)
       ORDER BY day DESC
       LIMIT 30`
    );

    res.json({
      status: 'success',
      data: {
        movieStats,
        dailyStats
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
};