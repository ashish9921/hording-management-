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

    // Disp ay Information
    displayName: {
        type: String,
        required: [true, 'Display name is required']
    },

    // ✅ NEW FIELDS - From Frontend Form
    contactNumber: {
        type: String,
        required: [true, 'Contact number is required'],
        trim: true
    },
    customerName: {
        type: String,
        required: [true, 'Customer name is required'],
        trim: true
    },
    customerMobile: {
        type: String,
        required: [true, 'Customer mobile is required'],
        trim: true
    },
    hoardingType: {
        type: String,
        required: [true, 'Hoarding type is required'],
        enum: ['Backlit', 'Front Lit', 'Non-Lit', 'Digital LED', 'Vinyl Banner']
    },

    // Dates
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

    // Financial
    totalRent: {
        type: Number,
        required: true
    },

    // Media
    bannerImage: String,
    qrCode: String,

    // Status
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