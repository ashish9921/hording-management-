const mongoose = require('mongoose');

const hoardingSchema = new mongoose.Schema({
    location: {
        type: String,
        required: true,
    },
    coordinates: {
        latitude: {
            type: Number,
            required: true,
        },
        longitude: {
            type: Number,
            required: true,
        },
    },
    size: {
        type: String,
        required: true,
    },
    area: {
        type: String,
        required: true,
    },
    baseRent: {
        type: Number,
        required: true,
    },
    priceCategory: {
        type: String,
        enum: ['standard', 'prime'],
        default: 'standard',
    },
    status: {
        type: String,
        enum: ['available', 'booked', 'maintenance'],
        default: 'available',
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, {
    timestamps: true,
});

// Index for location-based queries
hoardingSchema.index({ 'coordinates.latitude': 1, 'coordinates.longitude': 1 });
hoardingSchema.index({ area: 1, status: 1 });

module.exports = mongoose.model('Hoarding', hoardingSchema);