const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
    bookingId: {
        type: String,
        unique: true,
        required: true
    },
    printingPress: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    hoarding: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hoarding',
        required: true
    },
    displayName: {
        type: String,
        required: [true, 'Display name is required']
    },
    startDate: {
        type: Date,
        required: [true, 'Start date is required']
    },
    endDate: {
        type: Date,
        required: [true, 'End date is required']
    },
    duration: {
        type: Number, // in days
        required: true
    },
    totalRent: {
        type: Number,
        required: true
    },
    bannerImage: String,
    qrCode: String,
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'active', 'expired', 'collected'],
        default: 'pending'
    },

    // PMC Review
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    reviewedAt: Date,
    rejectionReason: String,

    // Approval date
    approvedAt: Date,

    // Collection
    collectionDate: Date,

    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update status based on dates
BookingSchema.pre('save', function (next) {
    const now = new Date();

    if (this.status === 'approved' && this.startDate <= now && this.endDate >= now) {
        this.status = 'active';
    } else if (this.status === 'active' && this.endDate < now) {
        this.status = 'expired';
    }

    this.updatedAt = now;
    next();
});

module.exports = mongoose.model('Booking', BookingSchema);
