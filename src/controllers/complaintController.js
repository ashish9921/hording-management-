const Complaint = require('../models/Complaint');
const { RewardTransaction, UserRewards } = require('../models/Rewards');
const { generateComplaintId } = require('../utils/generateId');

// @desc    Create complaint
// @route   POST /api/public/complaints
// @access  Private/Public
exports.createComplaint = async (req, res) => {
    try {
        const {
            complaintType,
            description,
            location,
            latitude,
            longitude,
            address,
            accuracy,
            photo,
            photoTimestamp,
            contactName,        // ✅ NEW
            contactPhone        // ✅ NEW
        } = req.body;

        const complaintId = generateComplaintId();

        const complaint = await Complaint.create({
            complaintId,
            userId: req.user._id,
            complaintType,
            description,
            location,
            coordinates: {
                type: 'Point',
                coordinates: [parseFloat(longitude), parseFloat(latitude)]
            },
            address,
            accuracy,
            photo,
            photoTimestamp: photoTimestamp || new Date(),
            contactName,        // ✅ NEW
            contactPhone,       // ✅ NEW
            status: 'pending'
        });

        res.status(201).json({
            success: true,
            message: 'Complaint filed successfully',
            complaint: {
                _id: complaint._id,
                complaintId: complaint.complaintId,
                status: complaint.status,
                createdAt: complaint.createdAt
            }
        });
    } catch (error) {
        console.error('Create complaint error:', error);
        res.status(500).json({
            success: false,
            message: 'Error filing complaint',
            error: error.message
        });
    }
};

// @desc    Get my complaints
// @route   GET /api/public/complaints/my
// @access  Private/Public
exports.getMyComplaints = async (req, res) => {
    try {
        const complaints = await Complaint.find({ userId: req.user._id })
            .populate('resolvedBy', 'name')
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

// @desc    Get complaint by ID
// @route   GET /api/public/complaints/:id
// @access  Private
exports.getComplaintById = async (req, res) => {
    try {
        const complaint = await Complaint.findById(req.params.id)
            .populate('userId', 'name email phone')
            .populate('resolvedBy', 'name email');

        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: 'Complaint not found'
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

// @desc    Get all complaints (PMC)
// @route   GET /api/pmc/complaints
// @access  Private/PMC
exports.getAllComplaints = async (req, res) => {
    try {
        const { status } = req.query;

        const query = status ? { status } : {};

        const complaints = await Complaint.find(query)
            .populate('userId', 'name email phone')
            .populate('resolvedBy', 'name')
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

// @desc    Resolve complaint
// @route   PUT /api/pmc/complaints/:id/resolve
// @access  Private/PMC
exports.resolveComplaint = async (req, res) => {
    try {
        const { resolution, rewardPoints = 50 } = req.body;

        const complaint = await Complaint.findById(req.params.id);

        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: 'Complaint not found'
            });
        }

        // Update complaint
        complaint.status = 'resolved';
        complaint.resolution = resolution;
        complaint.resolvedBy = req.user._id;
        complaint.resolvedAt = new Date();
        complaint.rewardPoints = rewardPoints;
        await complaint.save();

        // Award points
        if (rewardPoints > 0) {
            await RewardTransaction.create({
                userId: complaint.userId,
                type: 'earned',
                points: rewardPoints,
                reason: 'Complaint resolved',
                relatedTo: complaint._id,
                relatedModel: 'Complaint'
            });

            await UserRewards.findOneAndUpdate(
                { userId: complaint.userId },
                {
                    $inc: {
                        totalPoints: rewardPoints,
                        totalEarned: rewardPoints
                    },
                    updatedAt: new Date()
                },
                { upsert: true }
            );
        }

        res.json({
            success: true,
            message: 'Complaint resolved successfully',
            complaint
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error resolving complaint',
            error: error.message
        });
    }
};

// @desc    Reject complaint
// @route   PUT /api/pmc/complaints/:id/reject
// @access  Private/PMC
exports.rejectComplaint = async (req, res) => {
    try {
        const { reason } = req.body;

        const complaint = await Complaint.findById(req.params.id);

        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: 'Complaint not found'
            });
        }

        complaint.status = 'rejected';
        complaint.resolution = reason;
        complaint.resolvedBy = req.user._id;
        complaint.resolvedAt = new Date();
        await complaint.save();

        res.json({
            success: true,
            message: 'Complaint rejected',
            complaint
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error rejecting complaint',
            error: error.message
        });
    }
};