const pool = require('../config/db');
const { validationResult } = require('express-validator');

// Get all movies
exports.getAllMovies = async (req, res) => {
  try {
    // Handle query parameters
    const searchQuery = req.query.search ? `%${req.query.search}%` : '%';
    const genre = req.query.genre;
    
    let query = 'SELECT * FROM movies WHERE title LIKE ?';
    let queryParams = [searchQuery];
    
    if (genre) {
      query += ' AND genre = ?';
      queryParams.push(genre);
    }

    const [movies] = await pool.query(query, queryParams);
    
    res.json({
      status: 'success',
      results: movies.length,
      data: movies
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
};

// Get movie by ID
exports.getMovieById = async (req, res) => {
  try {
    const [movies] = await pool.query('SELECT * FROM movies WHERE id = ?', [req.params.id]);
    
    if (movies.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: 'Movie not found'
      });
    }

    res.json({
      status: 'success',
      data: movies[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
};

// Create a new movie
exports.createMovie = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: 'fail', errors: errors.array() });
  }

  const { title, description, genre, duration, poster_url, release_date } = req.body;

  try {
    const [result] = await pool.query(
      'INSERT INTO movies (title, description, genre, duration, poster_url, release_date) VALUES (?, ?, ?, ?, ?, ?)',
      [title, description, genre, duration, poster_url, release_date]
    );

    const [newMovie] = await pool.query('SELECT * FROM movies WHERE id = ?', [result.insertId]);

    res.status(201).json({
      status: 'success',
      data: newMovie[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
};

// Update a movie
exports.updateMovie = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: 'fail', errors: errors.array() });
  }

  const { title, description, genre, duration, poster_url, release_date } = req.body;

  try {
    const [existingMovie] = await pool.query('SELECT * FROM movies WHERE id = ?', [req.params.id]);
    
    if (existingMovie.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: 'Movie not found'
      });
    }

    await pool.query(
      'UPDATE movies SET title = ?, description = ?, genre = ?, duration = ?, poster_url = ?, release_date = ? WHERE id = ?',
      [title, description, genre, duration, poster_url, release_date, req.params.id]
    );

    const [updatedMovie] = await pool.query('SELECT * FROM movies WHERE id = ?', [req.params.id]);

    res.json({
      status: 'success',
      data: updatedMovie[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
};

// Delete a movie
exports.deleteMovie = async (req, res) => {
  try {
    const [existingMovie] = await pool.query('SELECT * FROM movies WHERE id = ?', [req.params.id]);
    
    if (existingMovie.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: 'Movie not found'
      });
    }

    await pool.query('DELETE FROM movies WHERE id = ?', [req.params.id]);

    res.json({
      status: 'success',
      message: 'Movie deleted successfully'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
};