const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const setupProgress = {
    status: {
        type: String,
        enum: ['INCOMPLETE', 'PENDING', 'APPROVED', 'REJECTED'],
        default: 'INCOMPLETE'
    },
    adminMessage: {
        type: String
    }
};

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    passsword: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['CUSTOMER', 'PROVIDER', 'ADMIN'],
        default: 'CUSTOMER'
    },
    providerDetails: {
        businessName: {
            type: String
        },
        bio: {
            type: String
        },
        logoUrl: {
            type: String
        },
        serviceCategory: {
            type: String
        },
        baseprice: {
            type: Number
        },
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
            address: {
                type: String
            }
        },
        profileSetup: {
            branding: setupProgress,
            location: setupProgress,
            pricing: setupProgress,
            category: setupProgress
        }
    }
}, {
    timestamps: true
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.passsword);
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