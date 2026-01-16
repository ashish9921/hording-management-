const mongoose = require('mongoose');

const RewardTransactionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['earned', 'redeemed', 'bonus'],
        required: true
    },
    points: {
        type: Number,
        required: true
    },
    reason: String,
    relatedTo: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'relatedModel'
    },
    relatedModel: {
        type: String,
        enum: ['Complaint', 'Booking', null]
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const UserRewardsSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    totalPoints: {
        type: Number,
        default: 0
    },
    totalEarned: {
        type: Number,
        default: 0
    },
    totalRedeemed: {
        type: Number,
        default: 0
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

const RewardTransaction = mongoose.model('RewardTransaction', RewardTransactionSchema);
const UserRewards = mongoose.model('UserRewards', UserRewardsSchema);

module.exports = { RewardTransaction, UserRewards };