const express = require('express');
const router = express.Router();
const {
    createBooking,
    getMyBookings,
    getBookingById,
    getQRCode,
    cancelBooking
} = require('../controllers/bookingController');
const { protect, isPrintingPress } = require('../middleware/auth');

router.use(protect);
router.use(isPrintingPress);

router.post('/', createBooking);
router.get('/my-bookings', getMyBookings);
router.get('/:id', getBookingById);
router.get('/:id/qr-code', getQRCode);
router.delete('/:id', cancelBooking);

module.exports = router;