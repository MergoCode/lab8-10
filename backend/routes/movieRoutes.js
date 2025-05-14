const express = require('express');
const { check } = require('express-validator');
const movieController = require('../controllers/movieController');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/movies
// @desc    Get all movies
// @access  Public
router.get('/', movieController.getAllMovies);

// @route   GET /api/movies/:id
// @desc    Get movie by ID
// @access  Public
router.get('/:id', movieController.getMovieById);

// @route   POST /api/movies
// @desc    Create a new movie
// @access  Private
router.post(
  '/',
  [
    auth,
    check('title', 'Title is required').not().isEmpty(),
    check('description', 'Description is required').not().isEmpty(),
    check('genre', 'Genre is required').not().isEmpty(),
    check('duration', 'Duration must be a positive number').isInt({ min: 1 }),
    check('poster_url', 'Poster URL is required').not().isEmpty(),
    check('release_date', 'Release date is required').isDate()
  ],
  movieController.createMovie
);

// @route   PUT /api/movies/:id
// @desc    Update a movie
// @access  Private
router.put(
  '/:id',
  [
    auth,
    check('title', 'Title is required').not().isEmpty(),
    check('description', 'Description is required').not().isEmpty(),
    check('genre', 'Genre is required').not().isEmpty(),
    check('duration', 'Duration must be a positive number').isInt({ min: 1 }),
    check('poster_url', 'Poster URL is required').not().isEmpty(),
    check('release_date', 'Release date is required').isDate()
  ],
  movieController.updateMovie
);

// @route   DELETE /api/movies/:id
// @desc    Delete a movie
// @access  Private
router.delete('/:id', auth, movieController.deleteMovie);

module.exports = router;