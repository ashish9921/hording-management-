const mongoose = require('mongoose');

const recyclerCollectionSchema = new mongoose.Schema({
    collectionId: {
        type: String,
        unique: true,
        required: true,
    },
    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: true,
    },
    recyclerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },

    actualWeight: {
        type: Number,
        required: true,
    },
    vehicleNumber: {
        type: String,
        required: true,
    },
    notes: String,

    // Photos
    beforeRemovalPhoto: {
        type: String,
        required: true,
    },
    afterRemovalPhoto: {
        type: String,
        required: true,
    },
    weightProofPhoto: {
        type: String,
        required: true,
    },

    // Verification
    verificationStatus: {
        type: String,
        enum: ['pending', 'verified', 'rejected'],
        default: 'pending',
    },
    verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    verificationDate: Date,
    verificationNotes: String,

    collectionDate: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true,
});

// Generate collection ID
recyclerCollectionSchema.pre('save', async function (next) {
    if (!this.collectionId) {
        const timestamp = Date.now().toString().slice(-7);
        this.collectionId = `RC${timestamp}`;
    }
    next();
});

module.exports = mongoose.model('RecyclerCollection', recyclerCollectionSchema);