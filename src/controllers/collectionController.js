const Collection = require('../models/Collection');
const Booking = require('../models/Booking');
const { generateCollectionId } = require('../utils/generateId');

// @desc    Submit collection
// @route   POST /api/recycler/collections
// @access  Private/Recycler
exports.submitCollection = async (req, res) => {
    try {
        const {
            bookingId,
            actualWeight,
            notes,
            photo,
            collectionLocation,
            collectionTimestamp
        } = req.body;

        // Check booking exists
        const booking = await Booking.findOne({ bookingId });

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        if (booking.status !== 'expired') {
            return res.status(400).json({
                success: false,
                message: 'Booking is not expired yet'
            });
        }

        const collectionId = generateCollectionId();

        const collection = await Collection.create({
            collectionId,
            booking: booking._id,
            recycler: req.user._id,
            actualWeight,
            notes,
            photo,
            collectionLocation: {
                type: 'Point',
                coordinates: [
                    parseFloat(collectionLocation.longitude),
                    parseFloat(collectionLocation.latitude)
                ]
            },
            address: collectionLocation.address,
            accuracy: collectionLocation.accuracy,
            collectionTimestamp,
            status: 'pending'
        });

        // Update booking
        booking.status = 'collected';
        booking.collectionDate = new Date();
        await booking.save();

        // Update hoarding status
        const Hoarding = require('../models/Hoarding');
        await Hoarding.findByIdAndUpdate(booking.hoarding, {
            status: 'available',
            currentBooking: null
        });

        res.status(201).json({
            success: true,
            message: 'Collection submitted successfully',
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

// @desc    Get my collections
// @route   GET /api/recycler/collections/my
// @access  Private/Recycler
exports.getMyCollections = async (req, res) => {
    try {
        const collections = await Collection.find({ recycler: req.user._id })
            .populate({
                path: 'booking',
                populate: { path: 'hoarding' }
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

// @desc    Get expired bookings for collection
// @route   GET /api/recycler/bookings/expired
// @access  Private/Recycler
exports.getExpiredBookings = async (req, res) => {
    try {
        const Booking = require('../models/Booking');

        const bookings = await Booking.find({ status: 'expired' })
            .populate('hoarding')
            .populate('printingPress', 'name companyName')
            .sort({ endDate: -1 });

        res.json({
            success: true,
            count: bookings.length,
            bookings
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching expired bookings',
            error: error.message
        });
    }
};