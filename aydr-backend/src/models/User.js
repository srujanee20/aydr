const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const progressConstraints = {
    status: {
        type: String,
        enum: ['INCOMPLETE', 'PENDING', 'APPROVED', 'REJECTED'],
        default: 'INCOMPLETE'
    },
    adminMessage: String
};

const providerDetailsSchema = new mongoose.Schema({
    serviceCategory: String,
    businessName: String,
    bio: String,
    logoUrl: String,
    baseprice: Number,
    isAvailable: {
        type: Boolean,
        default: false
    },
    location: {
        type: { 
            type: String, 
            default: 'Point' 
        },
        coordinates: { 
            type: [Number], 
            index: '2dsphere' 
        },
        address: String
    },
    profileSetup: {
        branding: progressConstraints,
        location: progressConstraints,
        pricing: progressConstraints,
        category: progressConstraints
    }
}, { 
    _id: false 
});

const userSchema = new mongoose.Schema({
    role: {
        type: String,
        enum: ['CUSTOMER', 'PROVIDER', 'ADMIN'],
        default: 'CUSTOMER'
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    providerDetails: {
        type: providerDetailsSchema,
        default: undefined
    }
}, {
    timestamps: true
});

userSchema.methods.matchPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

// Hooks
userSchema.pre('save', async function (next) {
    if (!this.isModified('password'))
        return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);

module.exports = User;