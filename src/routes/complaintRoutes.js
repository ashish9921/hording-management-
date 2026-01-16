const express = require('express');
const router = express.Router();
const {
    createComplaint,
    getMyComplaints,
    getComplaintById
} = require('../controllers/complaintController');
const { protect, isPublic } = require('../middleware/auth');

router.use(protect);
router.use(isPublic);

router.post('/', createComplaint);
router.get('/my', getMyComplaints);
router.get('/:id', getComplaintById);

module.exports = router;