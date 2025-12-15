const express = require('express');
const router = express.Router();
const { protect, isRecycler } = require('../middleware/auth');
const upload = require('../middleware/upload');

const {
    getExpiredBookings,
    getBookingForCollection,
    submitCollection,
    getMyCollections,
    getCollectionById
} = require('../controllers/recyclerController');

// All routes require authentication and recycler user type
router.use(protect);
router.use(isRecycler);

// @route   GET /api/recycler/expired-bookings
// @desc    Get all expired bookings available for collection
// @access  Private (Recycler)
router.get('/expired-bookings', getExpiredBookings);

// @route   GET /api/recycler/bookings/:id
// @desc    Get booking details for collection
// @access  Private (Recycler)
router.get('/bookings/:id', getBookingForCollection);

// @route   POST /api/recycler/collections
// @desc    Submit collection report
// @access  Private (Recycler)
router.post('/collections', upload.fields([
    { name: 'beforeRemovalPhoto', maxCount: 1 },
    { name: 'afterRemovalPhoto', maxCount: 1 },
    { name: 'weightProofPhoto', maxCount: 1 }
]), submitCollection);

// @route   GET /api/recycler/collections/my-collections
// @desc    Get all collections by recycler
// @access  Private (Recycler)
router.get('/collections/my-collections', getMyCollections);

// @route   GET /api/recycler/collections/:id
// @desc    Get collection details
// @access  Private (Recycler)
router.get('/collections/:id', getCollectionById);

module.exports = router;