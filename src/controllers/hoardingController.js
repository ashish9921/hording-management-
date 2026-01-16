const Hoarding = require('../models/Hoarding');
const { generateHoardingId } = require('../utils/generateId');

// @desc    Get all hoardings
// @route   GET /api/hoardings
// @access  Public
exports.getAllHoardings = async (req, res) => {
    try {
        const hoardings = await Hoarding.find()
            .populate('currentBooking')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: hoardings.length,
            hoardings
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching hoardings',
            error: error.message
        });
    }
};

// @desc    Get available hoardings
// @route   GET /api/hoardings/available
// @access  Public
exports.getAvailableHoardings = async (req, res) => {
    try {
        const hoardings = await Hoarding.find({ status: 'available' })
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: hoardings.length,
            hoardings
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching available hoardings',
            error: error.message
        });
    }
};

// @desc    Get hoarding by ID
// @route   GET /api/hoardings/:id
// @access  Public
exports.getHoardingById = async (req, res) => {
    try {
        const hoarding = await Hoarding.findById(req.params.id)
            .populate('currentBooking');

        if (!hoarding) {
            return res.status(404).json({
                success: false,
                message: 'Hoarding not found'
            });
        }

        res.json({
            success: true,
            hoarding
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching hoarding',
            error: error.message
        });
    }
};

// @desc    Create hoarding (PMC only)
// @route   POST /api/pmc/hoardings
// @access  Private/PMC
exports.createHoarding = async (req, res) => {
    try {
        const { location, address, latitude, longitude, size, baseRent, images } = req.body;

        const hoardingId = generateHoardingId();

        const hoarding = await Hoarding.create({
            hoardingId,
            location,
            address,
            coordinates: {
                type: 'Point',
                coordinates: [parseFloat(longitude), parseFloat(latitude)]
            },
            size,
            baseRent,
            images: images || [],
            createdBy: req.user._id,
            status: 'available'
        });

        res.status(201).json({
            success: true,
            message: 'Hoarding created successfully',
            hoarding
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating hoarding',
            error: error.message
        });
    }
};

// @desc    Update hoarding
// @route   PUT /api/pmc/hoardings/:id
// @access  Private/PMC
exports.updateHoarding = async (req, res) => {
    try {
        const hoarding = await Hoarding.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!hoarding) {
            return res.status(404).json({
                success: false,
                message: 'Hoarding not found'
            });
        }

        res.json({
            success: true,
            message: 'Hoarding updated successfully',
            hoarding
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating hoarding',
            error: error.message
        });
    }
};

// @desc    Delete hoarding
// @route   DELETE /api/pmc/hoardings/:id
// @access  Private/PMC
exports.deleteHoarding = async (req, res) => {
    try {
        const hoarding = await Hoarding.findById(req.params.id);

        if (!hoarding) {
            return res.status(404).json({
                success: false,
                message: 'Hoarding not found'
            });
        }

        // Check if hoarding has active booking
        if (hoarding.status === 'occupied') {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete hoarding with active booking'
            });
        }

        await hoarding.deleteOne();

        res.json({
            success: true,
            message: 'Hoarding deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting hoarding',
            error: error.message
        });
    }
};

// @desc    Get nearby hoardings
// @route   GET /api/hoardings/nearby?lat=18.5074&lng=73.8077&distance=5000
// @access  Public
exports.getNearbyHoardings = async (req, res) => {
    try {
        const { lat, lng, distance = 5000 } = req.query; // distance in meters

        if (!lat || !lng) {
            return res.status(400).json({
                success: false,
                message: 'Latitude and longitude are required'
            });
        }

        const hoardings = await Hoarding.find({
            coordinates: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [parseFloat(lng), parseFloat(lat)]
                    },
                    $maxDistance: parseInt(distance)
                }
            }
        });

        res.json({
            success: true,
            count: hoardings.length,
            hoardings
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching nearby hoardings',
            error: error.message
        });
    }
};


