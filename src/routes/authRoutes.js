const express = require('express');
const router = express.Router();
const { signup, login, getMe, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/save-token', protect, async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({ success: false, message: 'Token is required' });
        }

        await User.findByIdAndUpdate(req.user._id, { fcmToken: token });

        res.json({ success: true, message: 'Token saved successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error saving token', error: error.message });
    }
});

// ✅ NEW ROUTE — Clear token on logout
// POST /api/users/clear-token
router.post('/clear-token', protect, async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.user._id, { fcmToken: null });
        res.json({ success: true, message: 'Token cleared' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error clearing token' });
    }
});

module.exports = router;
