const mongoose = require('mongoose');

const CollectionSchema = new mongoose.Schema({
    collectionId: {
        type: String,
        unique: true,
        required: true
    },
    booking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: true
    },
    recycler: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // Collection Details
    actualWeight: {
        type: Number,
        required: [true, 'Weight is required']
    },
    notes: String,

    // Photo Evidence
    photo: {
        type: String,
        required: [true, 'Photo is required']
    },

    // GPS Location from photo
    collectionLocation: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: true
        }
    },
    address: String,
    accuracy: Number,

    collectionTimestamp: {
        type: Date,
        required: true
    },

    // Verification
    status: {
        type: String,
        enum: ['pending', 'verified', 'rejected'],
        default: 'pending'
    },
    verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    verifiedAt: Date,
    rejectionReason: String,

    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Geospatial index
CollectionSchema.index({ collectionLocation: '2dsphere' });

module.exports = mongoose.model('Collection', CollectionSchema);
