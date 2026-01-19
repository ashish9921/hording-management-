const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: 6,
        select: false
    },
    phone: {
        type: String,
        trim: true
    },
    userType: {
        type: String,
        required: true,
        enum: ['public', 'printing-press', 'pmc', 'recycler']
    },

    // Printing Press specific
    companyName: String,
    gstNumber: String,
    shopLocation: String,      // ✅ NEW - From frontend signup form
    licenseNo: String,        // ✅ NEW - From frontend signup form  
    noOfMachines: String,     // ✅ NEW - From frontend signup form

    // PMC specific
    employeeId: String,
    department: String,
    designation: String,      // ✅ ADDED - Good to have

    // Recycler specific
    vehicleNumber: String,
    licenseNumber: String,
    businessName: String,     // ✅ ADDED - From your mock data
    ownerName: String,        // ✅ ADDED - Good to have
    serviceArea: String,      // ✅ ADDED - Good to have
    registrationNo: String,   // ✅ ADDED - Good to have

    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Hash password before saving
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);