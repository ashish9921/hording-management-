const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
    complaintId: {
        type: String,
        unique: true,
        required: true,
    },
    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
    },
    reportedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },

    location: {
        type: String,
        required: true,
    },
    scannedQRCode: String,
    description: {
        type: String,
        required: true,
    },
    complaintImage: {
        type: String,
        required: true,
    },

    status: {
        type: String,
        enum: ['submitted', 'under_review', 'resolved', 'rejected'],
        default: 'submitted',
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    resolution: String,
    resolvedAt: Date,
}, {
    timestamps: true,
});

// Generate complaint ID
complaintSchema.pre('save', async function (next) {
    if (!this.complaintId) {
        const timestamp = Date.now().toString().slice(-7);
        this.complaintId = `CMP${timestamp}`;
    }
    next();
});

module.exports = mongoose.model('Complaint', complaintSchema);