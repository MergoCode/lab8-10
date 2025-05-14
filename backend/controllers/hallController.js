const pool = require('../config/db');
const { validationResult } = require('express-validator');

// Get all halls
exports.getAllHalls = async (req, res) => {
  try {
    const [halls] = await pool.query('SELECT * FROM halls');
    
    res.json({
      status: 'success',
      results: halls.length,
      data: halls
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
};

// Get hall by ID
exports.getHallById = async (req, res) => {
  try {
    const [halls] = await pool.query('SELECT * FROM halls WHERE id = ?', [req.params.id]);
    
    if (halls.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: 'Hall not found'
      });
    }

    // Get all seats in the hall
    const [seats] = await pool.query(
      'SELECT * FROM seats WHERE hall_id = ? ORDER BY `row`, seat_number',
      [req.params.id]
    );

    res.json({
      status: 'success',
      data: {
        hall: halls[0],
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

// Create a new hall
exports.createHall = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: 'fail', errors: errors.array() });
  }

  const { name, capacity, rows, seats_per_row } = req.body;

  try {
    // Start transaction
    await pool.query('START TRANSACTION');

    // Create hall
    const [hallResult] = await pool.query(
      'INSERT INTO `halls` (name, capacity) VALUES (?, ?)',
      [name, capacity]
    );

    const hallId = hallResult.insertId;

    // Create seats for the hall
    const seatPromises = [];
    for (let row = 1; row <= rows; row++) {
      for (let seatNumber = 1; seatNumber <= seats_per_row; seatNumber++) {
        seatPromises.push(
          pool.query(
            'INSERT INTO seats (hall_id, row, seat_number) VALUES (?, ?, ?)',
            [hallId, row, seatNumber]
          )
        );
      }
    }

    await Promise.all(seatPromises);
    await pool.query('COMMIT');

    // Get the created hall with seats
    const [newHall] = await pool.query('SELECT * FROM halls WHERE id = ?', [hallId]);
    const [seats] = await pool.query(
      'SELECT * FROM seats WHERE hall_id = ? ORDER BY row, seat_number',
      [hallId]
    );

    res.status(201).json({
      status: 'success',
      data: {
        hall: newHall[0],
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

// Update a hall
exports.updateHall = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: 'fail', errors: errors.array() });
  }

  const { name, capacity } = req.body;

  try {
    const [existingHall] = await pool.query('SELECT * FROM halls WHERE id = ?', [req.params.id]);
    
    if (existingHall.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: 'Hall not found'
      });
    }

    // Update hall
    await pool.query(
      'UPDATE halls SET name = ?, capacity = ? WHERE id = ?',
      [name, capacity, req.params.id]
    );

    const [updatedHall] = await pool.query('SELECT * FROM halls WHERE id = ?', [req.params.id]);

    res.json({
      status: 'success',
      data: updatedHall[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
};

// Delete a hall
exports.deleteHall = async (req, res) => {
  try {
    const [existingHall] = await pool.query('SELECT * FROM halls WHERE id = ?', [req.params.id]);
    
    if (existingHall.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: 'Hall not found'
      });
    }

    // Check if hall has sessions
    const [sessions] = await pool.query('SELECT * FROM sessions WHERE hall_id = ?', [req.params.id]);
    
    if (sessions.length > 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'Cannot delete hall with existing sessions'
      });
    }

    // Start transaction
    await pool.query('START TRANSACTION');
    
    // Delete seats
    await pool.query('DELETE FROM seats WHERE hall_id = ?', [req.params.id]);
    
    // Delete hall
    await pool.query('DELETE FROM halls WHERE id = ?', [req.params.id]);
    
    await pool.query('COMMIT');

    res.json({
      status: 'success',
      message: 'Hall deleted successfully'
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