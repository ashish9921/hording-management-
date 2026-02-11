const mongoose = require('mongoose');

const ComplaintSchema = new mongoose.Schema({
    complaintId: {
        type: String,
        unique: true,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    complaintType: {
        type: String,
        required: [true, 'Complaint type is required'],
        enum: ['illegal', 'damaged', 'expired', 'unsafe', 'other']
    },
    description: {
        type: String,
        required: [true, 'Description is required']
    },
    location: {
        type: String,
        required: [true, 'Location is required']
    },

    // GPS Location from photo
    coordinates: {
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

    photo: String,
    photoTimestamp: Date,

    // ✅ NEW FIELDS - From Frontend Form
    contactName: {
        type: String,
        trim: true
    },
    contactPhone: {
        type: String,
        trim: true
    },

    status: {
        type: String,
        enum: ['pending', 'in-progress', 'resolved', 'rejected'],
        default: 'pending'
    },

    // PMC Response
    resolvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    resolvedAt: Date,
    resolution: String,

    // Rewards
    rewardPoints: {
        type: Number,
        default: 0
    },

    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Geospatial index
ComplaintSchema.index({ coordinates: '2dsphere' });

module.exports = mongoose.model('Complaint', ComplaintSchema);