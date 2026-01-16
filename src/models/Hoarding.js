const mongoose = require('mongoose');

const HoardingSchema = new mongoose.Schema({
    hoardingId: {
        type: String,
        unique: true,
        required: true
    },
    location: {
        type: String,
        required: [true, 'Location is required']
    },
    address: {
        type: String,
        required: [true, 'Address is required']
    },
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
    size: {
        type: String,
        required: [true, 'Size is required']
    },
    baseRent: {
        type: Number,
        required: [true, 'Base rent is required']
    },
    status: {
        type: String,
        enum: ['available', 'occupied', 'maintenance'],
        default: 'available'
    },
    images: [String],
    currentBooking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Geospatial index for location queries
HoardingSchema.index({ coordinates: '2dsphere' });

module.exports = mongoose.model('Hoarding', HoardingSchema);

