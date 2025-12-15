const express = require('express');
const router = express.Router();
const { protect, isPrintingPress } = require('../middleware/auth');
const upload = require('../middleware/upload');

const {
    createBooking,
    getMyBookings,
    getBookingById,
    generateQRCode,
    uploadBanner
} = require('../controllers/bookingController');

// All routes require authentication and printing press user type
router.use(protect);
router.use(isPrintingPress);

// @route   POST /api/bookings
// @desc    Create new hoarding booking
// @access  Private (Printing Press)
router.post('/', upload.single('bannerImage'), createBooking);

// @route   GET /api/bookings/my-bookings
// @desc    Get all bookings for logged-in printing press
// @access  Private (Printing Press)
router.get('/my-bookings', getMyBookings);

// @route   GET /api/bookings/:id
// @desc    Get booking by ID
// @access  Private (Printing Press)
router.get('/:id', getBookingById);

// @route   GET /api/bookings/:id/qr-code
// @desc    Generate QR code for booking
// @access  Private (Printing Press)
router.get('/:id/qr-code', generateQRCode);

module.exports = router;