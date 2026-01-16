const Booking = require('../models/Booking');

// Run this daily via cron job or scheduler
const checkAndExpireBookings = async () => {
    try {
        const now = new Date();

        // Find all active bookings past end date
        const expiredBookings = await Booking.find({
            status: 'active',
            endDate: { $lt: now },
            expiryDate: null  // Not already marked as expired
        });

        // Update each to expired
        for (const booking of expiredBookings) {
            booking.status = 'expired';
            booking.expiryDate = booking.endDate;  // ← ADD THIS
            await booking.save();
        }

        console.log(`Expired ${expiredBookings.length} bookings`);
    } catch (error) {
        console.error('Error checking expired bookings:', error);
    }
};

module.exports = { checkAndExpireBookings };