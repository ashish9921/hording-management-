const Booking = require('../models/Booking');
const Hoarding = require('../models/Hoarding');
const Complaint = require('../models/Complaint');

// @desc    Get all hoardings for map view
// @route   GET /api/public/hoardings
// @access  Private (Public)
exports.getHoardingsMap = async (req, res) => {
    try {
        const hoardings = await Hoarding.find({ status: { $ne: 'maintenance' } })
            .select('location coordinates size status');

        // Get bookings for each hoarding to show verified status
        const hoardingsWithStatus = await Promise.all(
            hoardings.map(async (hoarding) => {
                const activeBooking = await Booking.findOne({
                    hoardingId: hoarding._id,
                    status: { $in: ['approved', 'active'] },
                    endDate: { $gte: new Date() }
                });

                return {
                    id: hoarding._id,
                    latitude: hoarding.coordinates.latitude,
                    longitude: hoarding.coordinates.longitude,
                    title: hoarding.location,
                    status: activeBooking ? 'verified' : 'available',
                    size: hoarding.size
                };
            })
        );

        res.json({
            success: true,
            count: hoardingsWithStatus.length,
            hoardings: hoardingsWithStatus
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching hoardings',
            error: error.message
        });
    }
};

// @desc    Get hoarding by location
// @route   GET /api/public/hoardings/location
// @access  Private (Public)
exports.getHoardingByLocation = async (req, res) => {
    try {
        const { latitude, longitude, radius = 1 } = req.query;

        if (!latitude || !longitude) {
            return res.status(400).json({
                success: false,
                message: 'Latitude and longitude are required'
            });
        }

        // Find hoardings within radius (simple calculation)
        const hoardings = await Hoarding.find();

        const nearbyHoardings = hoardings.filter(hoarding => {
            const distance = Math.sqrt(
                Math.pow(hoarding.coordinates.latitude - parseFloat(latitude), 2) +
                Math.pow(hoarding.coordinates.longitude - parseFloat(longitude), 2)
            );
            return distance <= parseFloat(radius);
        });

        res.json({
            success: true,
            count: nearbyHoardings.length,
            hoardings: nearbyHoardings
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching hoardings',
            error: error.message
        });
    }
};

// @desc    Scan and verify QR code
// @route   POST /api/public/scan-qr
// @access  Private (Public)
exports.scanQRCode = async (req, res) => {
    try {
        const { qrData } = req.body;

        if (!qrData) {
            return res.status(400).json({
                success: false,
                message: 'QR data is required'
            });
        }

        // Parse QR data
        let parsedData;
        try {
            parsedData = JSON.parse(qrData);
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: 'Invalid QR code format'
            });
        }

        // Find booking by bookingId
        const booking = await Booking.findOne({ bookingId: parsedData.bookingId })
            .populate('hoardingId')
            .populate('printingPressId', 'name email phoneNo');

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        res.json({
            success: true,
            message: 'QR code verified successfully',
            booking: {
                bookingId: booking.bookingId,
                location: booking.hoardingId?.location,
                displayName: booking.displayName,
                customerName: booking.customerName,
                customerMobile: booking.customerMobile,
                hoardingType: booking.hoardingType,
                duration: booking.duration,
                startDate: booking.startDate,
                endDate: booking.endDate,
                size: booking.hoardingId?.size,
                rent: booking.hoardingId?.baseRent,
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

// @desc    File a complaint
// @route   POST /api/public/complaints
// @access  Private (Public)
exports.fileComplaint = async (req, res) => {
    try {
        const { location, bookingId, scannedQRCode, description } = req.body;

        if (!location || !description) {
            return res.status(400).json({
                success: false,
                message: 'Location and description are required'
            });
        }

        // Handle uploaded image
        const complaintImage = req.file ? `/uploads/${req.file.filename}` : null;

        if (!complaintImage) {
            return res.status(400).json({
                success: false,
                message: 'Complaint image is required'
            });
        }

        // Create complaint
        const complaint = await Complaint.create({
            reportedBy: req.user._id,
            location,
            bookingId: bookingId || null,
            scannedQRCode: scannedQRCode || null,
            description,
            complaintImage,
            status: 'submitted'
        });

        res.status(201).json({
            success: true,
            message: 'Complaint filed successfully',
            complaint
        });
    } catch (error) {
        console.error('File complaint error:', error);
        res.status(500).json({
            success: false,
            message: 'Error filing complaint',
            error: error.message
        });
    }
};

// @desc    Get all complaints filed by user
// @route   GET /api/public/complaints/my-complaints
// @access  Private (Public)
exports.getMyComplaints = async (req, res) => {
    try {
        const complaints = await Complaint.find({ reportedBy: req.user._id })
            .populate('bookingId')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: complaints.length,
            complaints
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching complaints',
            error: error.message
        });
    }
};

// @desc    Get complaint details
// @route   GET /api/public/complaints/:id
// @access  Private (Public)
exports.getComplaintById = async (req, res) => {
    try {
        const complaint = await Complaint.findById(req.params.id)
            .populate('bookingId')
            .populate('reportedBy', 'name email phoneNo');

        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: 'Complaint not found'
            });
        }

        // Check if complaint belongs to user
        if (complaint.reportedBy._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to access this complaint'
            });
        }

        res.json({
            success: true,
            complaint
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching complaint',
            error: error.message
        });
    }
};