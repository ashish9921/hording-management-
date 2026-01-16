const Booking = require('../models/Booking');
const Complaint = require('../models/Complaint');
const Collection = require('../models/Collection');
const Hoarding = require('../models/Hoarding');

// @desc    Get PMC dashboard stats
// @route   GET /api/pmc/stats/overview
// @access  Private/PMC
exports.getOverviewStats = async (req, res) => {
    try {
        const [
            totalBookings,
            pendingBookings,
            activeBookings,
            totalComplaints,
            pendingComplaints,
            totalHoardings,
            occupiedHoardings,
            pendingCollections
        ] = await Promise.all([
            Booking.countDocuments(),
            Booking.countDocuments({ status: 'pending' }),
            Booking.countDocuments({ status: 'active' }),
            Complaint.countDocuments(),
            Complaint.countDocuments({ status: 'pending' }),
            Hoarding.countDocuments(),
            Hoarding.countDocuments({ status: 'occupied' }),
            Collection.countDocuments({ status: 'pending' })
        ]);

        // Calculate revenue
        const bookings = await Booking.find({ status: { $in: ['active', 'expired', 'collected'] } });
        const totalRevenue = bookings.reduce((sum, b) => sum + b.totalRent, 0);

        res.json({
            success: true,
            stats: {
                totalBookings,
                pendingBookings,
                activeBookings,
                totalRevenue,
                totalComplaints,
                pendingComplaints,
                totalHoardings,
                occupiedHoardings,
                availableHoardings: totalHoardings - occupiedHoardings,
                pendingCollections
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching stats',
            error: error.message
        });
    }
};

// @desc    Get pending bookings for review
// @route   GET /api/pmc/bookings/pending
// @access  Private/PMC
exports.getPendingBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ status: 'pending' })
            .populate('hoarding')
            .populate('printingPress', 'name email companyName')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: bookings.length,
            bookings
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching pending bookings',
            error: error.message
        });
    }
};

// @desc    Approve booking
// @route   PUT /api/pmc/bookings/:id/approve
// @access  Private/PMC
exports.approveBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        booking.status = 'approved';
        booking.reviewedBy = req.user._id;
        booking.reviewedAt = new Date();
        booking.approvedAt = new Date();
        await booking.save();

        // Update hoarding status
        await Hoarding.findByIdAndUpdate(booking.hoarding, {
            status: 'occupied',
            currentBooking: booking._id
        });

        res.json({
            success: true,
            message: 'Booking approved successfully',
            booking
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error approving booking',
            error: error.message
        });
    }
};

// @desc    Reject booking
// @route   PUT /api/pmc/bookings/:id/reject
// @access  Private/PMC
exports.rejectBooking = async (req, res) => {
    try {
        const { reason } = req.body;

        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        booking.status = 'rejected';
        booking.reviewedBy = req.user._id;
        booking.reviewedAt = new Date();
        booking.rejectionReason = reason;
        await booking.save();

        res.json({
            success: true,
            message: 'Booking rejected',
            booking
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error rejecting booking',
            error: error.message
        });
    }
};

// @desc    Verify collection
// @route   PUT /api/pmc/collections/:id/verify
// @access  Private/PMC
exports.verifyCollection = async (req, res) => {
    try {
        const collection = await Collection.findById(req.params.id);

        if (!collection) {
            return res.status(404).json({
                success: false,
                message: 'Collection not found'
            });
        }

        collection.status = 'verified';
        collection.verifiedBy = req.user._id;
        collection.verifiedAt = new Date();
        await collection.save();

        res.json({
            success: true,
            message: 'Collection verified successfully',
            collection
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error verifying collection',
            error: error.message
        });
    }
};