const express = require('express');
const router = express.Router();
const { getBookingFromQR } = require('../controllers/qrController');

router.get('/booking/:qrCode', getBookingFromQR);

module.exports = router;