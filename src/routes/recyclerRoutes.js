const express = require('express');
const router = express.Router();
const {
    submitCollection,
    getMyCollections,
    getExpiredBookings
} = require('../controllers/collectionController');
const { protect, isRecycler } = require('../middleware/auth');

router.use(protect);
router.use(isRecycler);

router.post('/collections', submitCollection);
router.get('/collections/my', getMyCollections);
router.get('/bookings/expired', getExpiredBookings);

module.exports = router;