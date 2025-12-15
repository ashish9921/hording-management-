const express = require('express');
const router = express.Router();
const { protect, isPMC } = require('../middleware/auth');

const {
    getDashboardStats,
    getPendingBookings,
    reviewBooking,
    approveBooking,
    rejectBooking,
    getAllBookings,
    getPricingSettings,
    updatePricingSettings,
    getComplaintsForReview
} = require('../controllers/pmcController');

// All routes require authentication and PMC user type
router.use(protect);
router.use(isPMC);

// @route   GET /api/pmc/dashboard
// @desc    Get PMC dashboard statistics
// @access  Private (PMC)
router.get('/dashboard', getDashboardStats);

// @route   GET /api/pmc/bookings/pending
// @desc    Get all pending approval bookings
// @access  Private (PMC)
router.get('/bookings/pending', getPendingBookings);

// @route   GET /api/pmc/bookings
// @desc    Get all bookings (with filters)
// @access  Private (PMC)
router.get('/bookings', getAllBookings);

// @route   GET /api/pmc/bookings/:id/review
// @desc    Get booking details for review
// @access  Private (PMC)
router.get('/bookings/:id/review', reviewBooking);

// @route   POST /api/pmc/bookings/:id/approve
// @desc    Approve a booking
// @access  Private (PMC)
router.post('/bookings/:id/approve', approveBooking);

// @route   POST /api/pmc/bookings/:id/reject
// @desc    Reject a booking
// @access  Private (PMC)
router.post('/bookings/:id/reject', rejectBooking);

// @route   GET /api/pmc/settings/pricing
// @desc    Get pricing settings
// @access  Private (PMC)
router.get('/settings/pricing', getPricingSettings);

// @route   PUT /api/pmc/settings/pricing
// @desc    Update pricing settings
// @access  Private (PMC)
router.put('/settings/pricing', updatePricingSettings);

// @route   GET /api/pmc/complaints
// @desc    Get all complaints for review
// @access  Private (PMC)
router.get('/complaints', getComplaintsForReview);

module.exports = router;