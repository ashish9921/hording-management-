const express = require('express');
const router = express.Router();
const {
    getAllHoardings,
    getAvailableHoardings,
    getHoardingById,
    getNearbyHoardings
} = require('../controllers/hoardingController');

router.get('/', getAllHoardings);
router.get('/available', getAvailableHoardings);
router.get('/nearby', getNearbyHoardings);
router.get('/:id', getHoardingById);

module.exports = router;