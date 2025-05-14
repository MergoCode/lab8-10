const express = require('express');
const { check } = require('express-validator');
const bookingController = require('../controllers/bookingController');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/bookings
// @desc    Get all bookings for a user
// @access  Private
router.get('/', auth, bookingController.getUserBookings);

// @route   GET /api/bookings/:id
// @desc    Get booking by ID
// @access  Private
router.get('/:id', auth, bookingController.getBookingById);

// @route   POST /api/bookings
// @desc    Create a new booking
// @access  Private
router.post(
  '/',
  [
    auth,
    check('session_id', 'Session ID is required').isInt({ min: 1 }),
    check('seat_ids', 'Seat IDs must be an array with at least one seat').isArray({ min: 1 })
  ],
  bookingController.createBooking
);

// @route   PUT /api/bookings/:id/cancel
// @desc    Cancel a booking
// @access  Private
router.put('/:id/cancel', auth, bookingController.cancelBooking);

// @route   GET /api/bookings/stats
// @desc    Get bookings statistics (admin only)
// @access  Private/Admin
router.get('/stats', auth, bookingController.getBookingsStats);

module.exports = router;