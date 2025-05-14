const express = require('express');
const { check } = require('express-validator');
const sessionController = require('../controllers/sessionController');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/sessions
// @desc    Get all sessions
// @access  Public
router.get('/', sessionController.getAllSessions);

// @route   GET /api/sessions/:id
// @desc    Get session by ID
// @access  Public
router.get('/:id', sessionController.getSessionById);

// @route   POST /api/sessions
// @desc    Create a new session
// @access  Private
router.post(
  '/',
  [
    auth,
    check('movie_id', 'Movie ID is required').isInt({ min: 1 }),
    check('hall_id', 'Hall ID is required').isInt({ min: 1 }),
    check('start_time', 'Start time is required').not().isEmpty(),
    check('price', 'Price must be a positive number').isFloat({ min: 0.01 })
  ],
  sessionController.createSession
);

// @route   PUT /api/sessions/:id
// @desc    Update a session
// @access  Private
router.put(
  '/:id',
  [
    auth,
    check('movie_id', 'Movie ID is required').isInt({ min: 1 }),
    check('hall_id', 'Hall ID is required').isInt({ min: 1 }),
    check('start_time', 'Start time is required').not().isEmpty(),
    check('price', 'Price must be a positive number').isFloat({ min: 0.01 })
  ],
  sessionController.updateSession
);

// @route   DELETE /api/sessions/:id
// @desc    Delete a session
// @access  Private
router.delete('/:id', auth, sessionController.deleteSession);

module.exports = router;