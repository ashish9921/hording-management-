const Booking = require('../models/Booking');

// @desc    Get booking from QR code
// @route   GET /api/qr/booking/:qrCode
// @access  Public
exports.getBookingFromQR = async (req, res) => {
    try {
        const { qrCode } = req.params;

        // Extract booking ID from QR code
        // Assuming QR code contains booking ID in some format
        const bookingId = qrCode;

        const booking = await Booking.findOne({ bookingId })
            .populate('hoarding')
            .populate('printingPress', 'name companyName');

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        res.json({
            success: true,
            booking: {
                bookingId: booking.bookingId,
                location: booking.hoarding.location,
                address: booking.hoarding.address,
                displayName: booking.displayName,
                size: booking.hoarding.size,
                startDate: booking.startDate,
                endDate: booking.endDate,
                status: booking.status
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error verifying QR code',
            error: error.message
        });
    }
};