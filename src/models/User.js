const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: 6,
        select: false, // Don't return password by default
    },
    userType: {
        type: String,
        required: true,
        enum: ['printing_press', 'public', 'pmc', 'recycler'],
    },

    // Common fields
    name: {
        type: String,
        required: [true, 'Name is required'],
    },
    phoneNo: {
        type: String,
        required: [true, 'Phone number is required'],
    },

    // Printing Press specific
    shopLocation: String,
    licenseNo: String,
    noOfMachines: String,

    // PMC specific
    employeeId: String,
    department: String,
    designation: String,
    officeAddress: String,
    verificationStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    documents: {
        idCard: String,
        authorizationLetter: String,
        employmentProof: String,
    },

    // Recycler specific
    businessName: String,
    ownerName: String,
    serviceArea: String,
    registrationNo: String,
    vehicleDetails: String,
    businessLicense: String,
    vehicleProof: String,

    isActive: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);