const Booking = require('../models/Booking');
const Hoarding = require('../models/Hoarding');
const Complaint = require('../models/Complaint');
const RecyclerCollection = require('../models/RecyclerCollection');

// @desc    Get PMC dashboard statistics
// @route   GET /api/pmc/dashboard
// @access  Private (PMC)
exports.getDashboardStats = async (req, res) => {
    try {
        const totalHoardings = await Hoarding.countDocuments();
        const activeBookings = await Booking.countDocuments({ status: 'active' });
        const pendingApprovals = await Booking.countDocuments({ status: 'pending' });
        const expiredBookings = await Booking.countDocuments({ status: 'expired' });

        // Calculate total revenue (sum of approved bookings)
        const revenueData = await Booking.aggregate([
            { $match: { status: { $in: ['active', 'approved'] } } },
            { $group: { _id: null, total: { $sum: '$approvedAmount' } } }
        ]);
        const totalRevenue = revenueData[0]?.total || 0;

        // Pending deposits
        const pendingDepositsData = await Booking.aggregate([
            { $match: { status: 'approved', depositStatus: 'pending' } },
            { $group: { _id: null, total: { $sum: '$depositAmount' } } }
        ]);
        const pendingDeposits = pendingDepositsData[0]?.total || 0;

        res.json({
            success: true,
            stats: {
                totalHoardings,
                activeBookings,
                pendingApprovals,
                expiredBookings,
                totalRevenue,
                pendingDeposits
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard stats',
            error: error.message
        });
    }
};

// @desc    Get all pending bookings
// @route   GET /api/pmc/bookings/pending
// @access  Private (PMC)
exports.getPendingBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ status: 'pending' })
            .populate('hoardingId')
            .populate('printingPressId', 'name email phoneNo shopLocation licenseNo')
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

// @desc    Get all bookings (with filters)
// @route   GET /api/pmc/bookings
// @access  Private (PMC)
exports.getAllBookings = async (req, res) => {
    try {
        const { status, startDate, endDate } = req.query;

        let query = {};
        if (status) query.status = status;
        if (startDate && endDate) {
            query.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const bookings = await Booking.find(query)
            .populate('hoardingId')
            .populate('printingPressId', 'name email phoneNo')
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

// @desc    Get booking details for review
// @route   GET /api/pmc/bookings/:id/review
// @access  Private (PMC)
exports.reviewBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('hoardingId')
            .populate('printingPressId', 'name email phoneNo shopLocation licenseNo noOfMachines');

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
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

// @desc    Approve a booking
// @route   POST /api/pmc/bookings/:id/approve
// @access  Private (PMC)
exports.approveBooking = async (req, res) => {
    try {
        const { approvedAmount, depositAmount } = req.body;

        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        if (booking.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Booking is not pending approval'
            });
        }

        // Update booking
        booking.status = 'approved';
        booking.approvedAmount = approvedAmount || booking.requestedAmount;
        booking.depositAmount = depositAmount || (booking.approvedAmount * 0.2); // 20% default
        booking.approvedBy = req.user._id;
        booking.approvalDate = new Date();

        await booking.save();

        // Update hoarding status
        await Hoarding.findByIdAndUpdate(booking.hoardingId, { status: 'booked' });

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

// @desc    Reject a booking
// @route   POST /api/pmc/bookings/:id/reject
// @access  Private (PMC)
exports.rejectBooking = async (req, res) => {
    try {
        const { rejectionReason } = req.body;

        if (!rejectionReason) {
            return res.status(400).json({
                success: false,
                message: 'Rejection reason is required'
            });
        }

        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        if (booking.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Booking is not pending approval'
            });
        }

        booking.status = 'rejected';
        booking.rejectionReason = rejectionReason;
        booking.approvedBy = req.user._id;
        booking.approvalDate = new Date();

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

// @desc    Get pricing settings
// @route   GET /api/pmc/settings/pricing
// @access  Private (PMC)
exports.getPricingSettings = async (req, res) => {
    try {
        // In a real app, you'd store this in a Settings model
        // For now, return mock data
        const pricing = [
            { id: 1, size: '10x10 ft', baseRate: 10000, location: 'Standard' },
            { id: 2, size: '20x10 ft', baseRate: 15000, location: 'Standard' },
            { id: 3, size: '20x15 ft', baseRate: 20000, location: 'Standard' },
            { id: 4, size: '10x10 ft', baseRate: 15000, location: 'Prime (High Traffic)' },
            { id: 5, size: '20x10 ft', baseRate: 25000, location: 'Prime (High Traffic)' },
        ];

        res.json({
            success: true,
            pricing,
            depositPercent: 20,
            lateFeePercent: 2
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching pricing settings',
            error: error.message
        });
    }
};

// @desc    Update pricing settings
// @route   PUT /api/pmc/settings/pricing
// @access  Private (PMC)
exports.updatePricingSettings = async (req, res) => {
    try {
        // In a real app, you'd save this to a Settings model
        const { pricing, depositPercent, lateFeePercent } = req.body;

        res.json({
            success: true,
            message: 'Pricing settings updated successfully',
            pricing,
            depositPercent,
            lateFeePercent
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating pricing settings',
            error: error.message
        });
    }
};

// @desc    Get all complaints for review
// @route   GET /api/pmc/complaints
// @access  Private (PMC)
exports.getComplaintsForReview = async (req, res) => {
    try {
        const complaints = await Complaint.find()
            .populate('reportedBy', 'name email phoneNo')
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