const express = require('express');
const router = express.Router();
const pmcController = require('../controllers/pmcController');
const complaintController = require('../controllers/complaintController');
const hoardingController = require('../controllers/hoardingController');
const { protect, isPMC } = require('../middleware/auth');

router.use(protect);
router.use(isPMC);

// Stats
router.get('/stats/overview', pmcController.getOverviewStats);

// Bookings
router.get('/bookings/pending', pmcController.getPendingBookings);
router.get('/bookings/all-booking', pmcController.getAllBookings);
router.put('/bookings/:id/approve', pmcController.approveBooking);
router.put('/bookings/:id/reject', pmcController.rejectBooking);

// Complaints
router.get('/complaints', complaintController.getAllComplaints);
router.put('/complaints/:id/resolve', complaintController.resolveComplaint);
router.put('/complaints/:id/reject', complaintController.rejectComplaint);

// Hoardings
router.post('/hoardings', hoardingController.createHoarding);
router.put('/hoardings/:id', hoardingController.updateHoarding);
router.delete('/hoardings/:id', hoardingController.deleteHoarding);

// Collections
router.put('/collections/:id/verify', pmcController.verifyCollection);

module.exports = router;