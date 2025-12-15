const Booking = require('../models/Booking');
const RecyclerCollection = require('../models/RecyclerCollection');

// @desc    Get all expired bookings available for collection
// @route   GET /api/recycler/expired-bookings
// @access  Private (Recycler)
exports.getExpiredBookings = async (req, res) => {
    try {
        // Find bookings that have expired
        const expiredBookings = await Booking.find({
            status: { $in: ['active', 'approved'] },
            endDate: { $lt: new Date() }
        })
            .populate('hoardingId')
            .populate('printingPressId', 'name email phoneNo')
            .sort({ endDate: -1 });

        // Check which ones haven't been collected yet
        const availableForCollection = await Promise.all(
            expiredBookings.map(async (booking) => {
                const collection = await RecyclerCollection.findOne({ bookingId: booking._id });
                if (!collection) {
                    return booking;
                }
                return null;
            })
        );

        const filteredBookings = availableForCollection.filter(b => b !== null);

        res.json({
            success: true,
            count: filteredBookings.length,
            bookings: filteredBookings
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching expired bookings',
            error: error.message
        });
    }
};

// @desc    Get booking details for collection
// @route   GET /api/recycler/bookings/:id
// @access  Private (Recycler)
exports.getBookingForCollection = async (req, res) => {
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

        // Check if already collected
        const existingCollection = await RecyclerCollection.findOne({ bookingId: booking._id });
        if (existingCollection) {
            return res.status(400).json({
                success: false,
                message: 'This booking has already been collected'
            });
        }

        res.json({
            success: true,
            booking: {
                id: booking._id,
                bookingId: booking.bookingId,
                location: booking.hoardingId?.location,
                displayName: booking.displayName,
                size: booking.hoardingId?.size,
                estimatedWeight: '15 kg', // You can calculate this based on size
                startDate: booking.startDate,
                endDate: booking.endDate,
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching booking details',
            error: error.message
        });
    }
};

// @desc    Submit collection report
// @route   POST /api/recycler/collections
// @access  Private (Recycler)
exports.submitCollection = async (req, res) => {
    try {
        const { bookingId, actualWeight, vehicleNumber, notes } = req.body;

        if (!bookingId || !actualWeight || !vehicleNumber) {
            return res.status(400).json({
                success: false,
                message: 'Booking ID, actual weight, and vehicle number are required'
            });
        }

        // Check if booking exists
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Check if already collected
        const existingCollection = await RecyclerCollection.findOne({ bookingId });
        if (existingCollection) {
            return res.status(400).json({
                success: false,
                message: 'This booking has already been collected'
            });
        }

        // Handle uploaded photos
        const beforeRemovalPhoto = req.files?.beforeRemovalPhoto?.[0]
            ? `/uploads/${req.files.beforeRemovalPhoto[0].filename}`
            : null;
        const afterRemovalPhoto = req.files?.afterRemovalPhoto?.[0]
            ? `/uploads/${req.files.afterRemovalPhoto[0].filename}`
            : null;
        const weightProofPhoto = req.files?.weightProofPhoto?.[0]
            ? `/uploads/${req.files.weightProofPhoto[0].filename}`
            : null;

        if (!beforeRemovalPhoto || !afterRemovalPhoto || !weightProofPhoto) {
            return res.status(400).json({
                success: false,
                message: 'All three photos (before, after, weight proof) are required'
            });
        }

        // Create collection record
        const collection = await RecyclerCollection.create({
            bookingId,
            recyclerId: req.user._id,
            actualWeight: parseFloat(actualWeight),
            vehicleNumber,
            notes,
            beforeRemovalPhoto,
            afterRemovalPhoto,
            weightProofPhoto,
            verificationStatus: 'pending'
        });

        // Update booking status
        booking.status = 'expired';
        await booking.save();

        res.status(201).json({
            success: true,
            message: 'Collection submitted successfully. Pending PMC verification.',
            collection
        });
    } catch (error) {
        console.error('Submit collection error:', error);
        res.status(500).json({
            success: false,
            message: 'Error submitting collection',
            error: error.message
        });
    }
};

// @desc    Get all collections by recycler
// @route   GET /api/recycler/collections/my-collections
// @access  Private (Recycler)
exports.getMyCollections = async (req, res) => {
    try {
        const collections = await RecyclerCollection.find({ recyclerId: req.user._id })
            .populate({
                path: 'bookingId',
                populate: {
                    path: 'hoardingId'
                }
            })
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: collections.length,
            collections
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching collections',
            error: error.message
        });
    }
};

// @desc    Get collection details
// @route   GET /api/recycler/collections/:id
// @access  Private (Recycler)
exports.getCollectionById = async (req, res) => {
    try {
        const collection = await RecyclerCollection.findById(req.params.id)
            .populate({
                path: 'bookingId',
                populate: {
                    path: 'hoardingId'
                }
            })
            .populate('recyclerId', 'name email phoneNo businessName');

        if (!collection) {
            return res.status(404).json({
                success: false,
                message: 'Collection not found'
            });
        }

        // Check if collection belongs to user
        if (collection.recyclerId._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to access this collection'
            });
        }

        res.json({
            success: true,
            collection
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching collection',
            error: error.message
        });
    }
};