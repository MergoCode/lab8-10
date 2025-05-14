const express = require('express');
const { check } = require('express-validator');
const hallController = require('../controllers/hallController');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/halls
// @desc    Get all halls
// @access  Public
router.get('/', hallController.getAllHalls);

// @route   GET /api/halls/:id
// @desc    Get hall by ID
// @access  Public
router.get('/:id', hallController.getHallById);

// @route   POST /api/halls
// @desc    Create a new hall
// @access  Private
router.post(
  '/',
  [
    auth,
    check('name', 'Name is required').not().isEmpty(),
    check('capacity', 'Capacity must be a positive number').isInt({ min: 1 }),
    check('rows', 'Number of rows must be a positive number').isInt({ min: 1 }),
    check('seats_per_row', 'Number of seats per row must be a positive number').isInt({ min: 1 })
  ],
  hallController.createHall
);

// @route   PUT /api/halls/:id
// @desc    Update a hall
// @access  Private
router.put(
  '/:id',
  [
    auth,
    check('name', 'Name is required').not().isEmpty(),
    check('capacity', 'Capacity must be a positive number').isInt({ min: 1 })
  ],
  hallController.updateHall
);

// @route   DELETE /api/halls/:id
// @desc    Delete a hall
// @access  Private
router.delete('/:id', auth, hallController.deleteHall);

module.exports = router;