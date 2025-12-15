const express = require('express');
const router = express.Router();
const { protect, isPublic } = require('../middleware/auth');
const upload = require('../middleware/upload');

const {
    getHoardingsMap,
    getHoardingByLocation,
    scanQRCode,
    fileComplaint,
    getMyComplaints,
    getComplaintById
} = require('../controllers/publicController');

// All routes require authentication and public user type
router.use(protect);
router.use(isPublic);

// @route   GET /api/public/hoardings
// @desc    Get all hoardings for map view
// @access  Private (Public)
router.get('/hoardings', getHoardingsMap);

// @route   GET /api/public/hoardings/location
// @desc    Get hoarding by location
// @access  Private (Public)
router.get('/hoardings/location', getHoardingByLocation);

// @route   POST /api/public/scan-qr
// @desc    Scan and verify QR code
// @access  Private (Public)
router.post('/scan-qr', scanQRCode);

// @route   POST /api/public/complaints
// @desc    File a complaint
// @access  Private (Public)
router.post('/complaints', upload.single('complaintImage'), fileComplaint);

// @route   GET /api/public/complaints/my-complaints
// @desc    Get all complaints filed by user
// @access  Private (Public)
router.get('/complaints/my-complaints', getMyComplaints);

// @route   GET /api/public/complaints/:id
// @desc    Get complaint details
// @access  Private (Public)
router.get('/complaints/:id', getComplaintById);

module.exports = router;