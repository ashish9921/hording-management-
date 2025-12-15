const Booking = require('../models/Booking');
const Hoarding = require('../models/Hoarding');
const generateQRCodeUtil = require('../utils/qrCodeGenerator');

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private (Printing Press)
exports.createBooking = async (req, res) => {
    try {
        const {
            hoardingId,
            displayName,
            contactNumber,
            customerName,
            customerMobile,
            hoardingType,
            duration,
            startDate,
            endDate,
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
                message: 'Hoarding is not available for booking'
            });
        }

        // Calculate requested amount based on duration and rent
        const requestedAmount = hoarding.baseRent * parseInt(duration);

        // Handle uploaded banner image
        const bannerImage = req.file ? `/uploads/${req.file.filename}` : null;

        // Create booking
        const booking = await Booking.create({
            hoardingId,
            printingPressId: req.user._id,
            displayName,
            contactNumber,
            customerName,
            customerMobile,
            hoardingType,
            duration: parseInt(duration),
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            requestedAmount,
            bannerImage,
            status: 'pending'
        });

        // Generate QR code data
        const qrData = {
            bookingId: booking.bookingId,
            location: hoarding.location,
            displayName,
            customerName,
            customerMobile,
            hoardingType,
            duration,
            startDate,
            endDate,
            size: hoarding.size,
            rent: hoarding.baseRent,
        };

        booking.qrCodeData = JSON.stringify(qrData);
        await booking.save();

        // Populate hoarding details
        await booking.populate('hoardingId');

        res.status(201).json({
            success: true,
            message: 'Booking created successfully. Pending PMC approval.',
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

// @desc    Get all bookings for printing press
// @route   GET /api/bookings/my-bookings
// @access  Private (Printing Press)
exports.getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ printingPressId: req.user._id })
            .populate('hoardingId')
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
// @access  Private (Printing Press)
exports.getBookingById = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('hoardingId')
            .populate('printingPressId', 'name email phoneNo');

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Check if booking belongs to user
        if (booking.printingPressId._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to access this booking'
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

// @desc    Generate QR code for booking
// @route   GET /api/bookings/:id/qr-code
// @access  Private (Printing Press)
exports.generateQRCode = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id).populate('hoardingId');

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Check if booking belongs to user
        if (booking.printingPressId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to access this booking'
            });
        }

        // Generate QR code
        const qrCodeDataURL = await generateQRCodeUtil(booking.qrCodeData);

        res.json({
            success: true,
            qrCode: qrCodeDataURL,
            bookingId: booking.bookingId
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error generating QR code',
            error: error.message
        });
    }
};