const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    bookingId: {
        type: String,
        unique: true,
        required: true,
    },
    hoardingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hoarding',
        required: true,
    },
    printingPressId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },

    // Booking Details
    displayName: {
        type: String,
        required: true,
    },
    contactNumber: {
        type: String,
        required: true,
    },
    customerName: {
        type: String,
        required: true,
    },
    customerMobile: {
        type: String,
        required: true,
    },
    hoardingType: {
        type: String,
        required: true,
    },
    duration: {
        type: Number,
        required: true,
    },
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
        required: true,
    },

    // Financial
    requestedAmount: {
        type: Number,
        required: true,
    },
    approvedAmount: Number,
    depositAmount: Number,
    depositStatus: {
        type: String,
        enum: ['pending', 'paid', 'refunded'],
        default: 'pending',
    },

    // Banner
    bannerImage: {
        type: String,
        required: true,
    },

    // Approval Flow
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'active', 'expired'],
        default: 'pending',
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    approvalDate: Date,
    rejectionReason: String,

    // QR Code
    qrCodeData: String,

}, {
    timestamps: true,
});

// Generate booking ID
bookingSchema.pre('save', async function (next) {
    if (!this.bookingId) {
        const timestamp = Date.now().toString().slice(-7);
        this.bookingId = `BK${timestamp}`;
    }
    next();
});

// Index for queries
bookingSchema.index({ printingPressId: 1, status: 1 });
bookingSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Booking', bookingSchema);