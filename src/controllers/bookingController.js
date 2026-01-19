const Booking = require('../models/Booking');
const Hoarding = require('../models/Hoarding');
const { generateBookingId } = require('../utils/generateId');
const { generateQRCode } = require('../utils/qrCodeGenerator');

// @desc    Create booking
// @route   POST /api/bookings
// @access  Private/PrintingPress
exports.createBooking = async (req, res) => {
    try {
        const {
            hoardingId,
            displayName,
            contactNumber,        // ✅ NEW
            customerName,         // ✅ NEW
            customerMobile,       // ✅ NEW
            hoardingType,         // ✅ NEW
            duration,             // Duration in months from frontend
            startDate,
            endDate,
            bannerImage
        } = req.body;

        // Check if hoarding exists and is available
        const hoarding = await Hoarding.findById(hoardingId);

        if (!hoarding) {
            return res.status(404).json({
                success: false,
                message: 'Hoarding not found'
            });
        }

        if (hoarding.status !== 'available') {
            return res.status(400).json({
                success: false,
                message: 'Hoarding is not available'
            });
        }

        // Calculate duration in days and rent
        const start = new Date(startDate);
        const end = new Date(endDate);
        const durationInDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

        // Calculate total rent (duration is in months from frontend)
        const totalRent = hoarding.baseRent * parseInt(duration);

        // Generate booking ID
        const bookingId = generateBookingId();

        // Create booking with ALL fields
        const booking = await Booking.create({
            bookingId,
            printingPress: req.user._id,
            hoarding: hoardingId,
            displayName,
            contactNumber,        // ✅ NEW
            customerName,         // ✅ NEW
            customerMobile,       // ✅ NEW
            hoardingType,         // ✅ NEW
            startDate: start,
            endDate: end,
            duration: durationInDays,
            totalRent,
            bannerImage,
            status: 'pending'
        });

        // Generate QR Code with booking details
        const qrCodeData = {
            bookingId: booking.bookingId,
            hoardingId: hoarding.hoardingId,
            location: hoarding.location,
            displayName: booking.displayName,
            customerName: booking.customerName,     // ✅ NEW
            customerMobile: booking.customerMobile, // ✅ NEW
            hoardingType: booking.hoardingType,     // ✅ NEW
            duration: duration,
            startDate: booking.startDate,
            endDate: booking.endDate,
            size: hoarding.size,
            rent: hoarding.baseRent
        };

        const qrCodeUrl = await generateQRCode(qrCodeData);
        booking.qrCode = qrCodeUrl;
        await booking.save();

        res.status(201).json({
            success: true,
            message: 'Booking created successfully. Awaiting PMC approval.',
            booking
        });
    } catch (error) {
        console.error('Create booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating booking',
            error: error.message
        });
    }
};

// @desc    Get my bookings
// @route   GET /api/bookings/my-bookings
// @access  Private/PrintingPress
exports.getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ printingPress: req.user._id })
            .populate('hoarding')
            .populate('reviewedBy', 'name email')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: bookings.length,
            bookings
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching bookings',
            error: error.message
        });
    }
};

// @desc    Get booking by ID
// @route   GET /api/bookings/:id
// @access  Private
exports.getBookingById = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('hoarding')
            .populate('printingPress', 'name email companyName')
            .populate('reviewedBy', 'name email');

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Check authorization
        if (booking.printingPress._id.toString() !== req.user._id.toString() &&
            req.user.userType !== 'pmc') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this booking'
            });
        }

        res.json({
            success: true,
            booking
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching booking',
            error: error.message
        });
    }
};

// @desc    Get QR code for booking
// @route   GET /api/bookings/:id/qr-code
// @access  Private/PrintingPress
exports.getQRCode = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        if (!booking.qrCode) {
            return res.status(404).json({
                success: false,
                message: 'QR code not generated yet'
            });
        }

        res.json({
            success: true,
            qrCode: booking.qrCode,
            bookingId: booking.bookingId
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching QR code',
            error: error.message
        });
    }
};

// @desc    Cancel booking
// @route   DELETE /api/bookings/:id
// @access  Private/PrintingPress
exports.cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Check if user owns this booking
        if (booking.printingPress.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        // Can only cancel pending bookings
        if (booking.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Can only cancel pending bookings'
            });
        }

        await booking.deleteOne();

        res.json({
            success: true,
            message: 'Booking cancelled successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error cancelling booking',
            error: error.message
        });
    }
};