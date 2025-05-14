const pool = require('../config/db');
const { validationResult } = require('express-validator');

// Get all sessions
exports.getAllSessions = async (req, res) => {
  try {
    // Handle query parameters
    const movieId = req.query.movie_id;
    const date = req.query.date;
    
    let query = `
      SELECT s.*, m.title as movie_title, h.name as hall_name
      FROM sessions s
      JOIN movies m ON s.movie_id = m.id
      JOIN halls h ON s.hall_id = h.id
    `;
    
    let queryParams = [];
    
    if (movieId) {
      query += ' WHERE s.movie_id = ?';
      queryParams.push(movieId);
      
      if (date) {
        query += ' AND DATE(s.start_time) = ?';
        queryParams.push(date);
      }
    } else if (date) {
      query += ' WHERE DATE(s.start_time) = ?';
      queryParams.push(date);
    }
    
    query += ' ORDER BY s.start_time';
    
    const [sessions] = await pool.query(query, queryParams);
    
    res.json({
      status: 'success',
      results: sessions.length,
      data: sessions
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
};

// Get session by ID
exports.getSessionById = async (req, res) => {
  try {
    const [sessions] = await pool.query(
      `SELECT s.*, m.title as movie_title, h.name as hall_name
       FROM sessions s
       JOIN movies m ON s.movie_id = m.id
       JOIN halls h ON s.hall_id = h.id
       WHERE s.id = ?`,
      [req.params.id]
    );
    
    if (sessions.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: 'Session not found'
      });
    }

    // Get available seats
    const [allSeats] = await pool.query(
      `SELECT s.id, s.row, s.seat_number, 
  CASE WHEN bs.seat_id IS NULL THEN 'available' ELSE 'booked' END as status
FROM seats s
LEFT JOIN (
  SELECT bs.seat_id
  FROM booking_seats bs
  JOIN bookings b ON bs.booking_id = b.id
  WHERE b.session_id = ? AND b.status != 'cancelled'
) bs ON s.id = bs.seat_id
`,
      [req.params.id, sessions[0].hall_id]
    );

    res.json({
      status: 'success',
      data: {
        session: sessions[0],
        seats: allSeats
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

// Create a new session
exports.createSession = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: 'fail', errors: errors.array() });
  }

  const { movie_id, hall_id, start_time, price } = req.body;

  try {
    // Check if movie exists
    const [movies] = await pool.query('SELECT * FROM movies WHERE id = ?', [movie_id]);
    if (movies.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: 'Movie not found'
      });
    }

    // Check if hall exists
    const [halls] = await pool.query('SELECT * FROM halls WHERE id = ?', [hall_id]);
    if (halls.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: 'Hall not found'
      });
    }

    // Check for time conflicts
    const [conflictingSessions] = await pool.query(
      `SELECT * FROM sessions 
       WHERE hall_id = ? 
       AND (
         (? BETWEEN start_time AND DATE_ADD(start_time, INTERVAL ? MINUTE)) OR
         (DATE_ADD(?, INTERVAL ? MINUTE) BETWEEN start_time AND DATE_ADD(start_time, INTERVAL ? MINUTE))
       )`,
      [hall_id, start_time, movies[0].duration, start_time, movies[0].duration, movies[0].duration]
    );

    if (conflictingSessions.length > 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'Time conflict with another session in this hall'
      });
    }

    const [result] = await pool.query(
      'INSERT INTO sessions (movie_id, hall_id, start_time, price) VALUES (?, ?, ?, ?)',
      [movie_id, hall_id, start_time, price]
    );

    const [newSession] = await pool.query(
      `SELECT s.*, m.title as movie_title, h.name as hall_name
       FROM sessions s
       JOIN movies m ON s.movie_id = m.id
       JOIN halls h ON s.hall_id = h.id
       WHERE s.id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      status: 'success',
      data: newSession[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
};

// Update a session
exports.updateSession = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: 'fail', errors: errors.array() });
  }

  const { movie_id, hall_id, start_time, price } = req.body;

  try {
    // Check if session exists
    const [existingSession] = await pool.query('SELECT * FROM sessions WHERE id = ?', [req.params.id]);
    if (existingSession.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: 'Session not found'
      });
    }

    // Check if movie exists
    const [movies] = await pool.query('SELECT * FROM movies WHERE id = ?', [movie_id]);
    if (movies.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: 'Movie not found'
      });
    }

    // Check if hall exists
    const [halls] = await pool.query('SELECT * FROM halls WHERE id = ?', [hall_id]);
    if (halls.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: 'Hall not found'
      });
    }

    // Check for time conflicts
    const [conflictingSessions] = await pool.query(
      `SELECT * FROM sessions 
       WHERE hall_id = ? 
       AND id != ?
       AND (
         (? BETWEEN start_time AND DATE_ADD(start_time, INTERVAL ? MINUTE)) OR
         (DATE_ADD(?, INTERVAL ? MINUTE) BETWEEN start_time AND DATE_ADD(start_time, INTERVAL ? MINUTE))
       )`,
      [hall_id, req.params.id, start_time, movies[0].duration, start_time, movies[0].duration, movies[0].duration]
    );

    if (conflictingSessions.length > 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'Time conflict with another session in this hall'
      });
    }

    await pool.query(
      'UPDATE sessions SET movie_id = ?, hall_id = ?, start_time = ?, price = ? WHERE id = ?',
      [movie_id, hall_id, start_time, price, req.params.id]
    );

    const [updatedSession] = await pool.query(
      `SELECT s.*, m.title as movie_title, h.name as hall_name
       FROM sessions s
       JOIN movies m ON s.movie_id = m.id
       JOIN halls h ON s.hall_id = h.id
       WHERE s.id = ?`,
      [req.params.id]
    );

    res.json({
      status: 'success',
      data: updatedSession[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
};

// Delete a session
exports.deleteSession = async (req, res) => {
  try {
    const [existingSession] = await pool.query('SELECT * FROM sessions WHERE id = ?', [req.params.id]);
    
    if (existingSession.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: 'Session not found'
      });
    }

    // Check if session has bookings
    const [bookings] = await pool.query('SELECT * FROM bookings WHERE session_id = ?', [req.params.id]);
    
    if (bookings.length > 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'Cannot delete session with existing bookings'
      });
    }

    await pool.query('DELETE FROM sessions WHERE id = ?', [req.params.id]);

    res.json({
      status: 'success',
      message: 'Session deleted successfully'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
};