const mongoose = require("mongoose");

const progressConstraints = {
    status: {
        type: String,
        enum: ['INCOMPLETE', 'PENDING', 'APPROVED', 'REJECTED'],
        default: 'INCOMPLETE'
    },
    adminMessage: {
        type: String,
        trim: true,
        default: ''
    }
};

const providerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Provider name is required'],
        trim: true,
        maxlength: [100, 'Name cannot be more than 100 characters']
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'Provider category is required']
    },
    bio: {
        type: String,
        trim: true,
        maxlength: [500, 'Bio cannot exceed 500 characters']
    },
    email: {
        type: String,
        required: [true, 'Provider email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please add a valid email']
    },
    phone: {
        type: String,
        required: [true, 'Provider phone number is required'],
        trim: true,
        minlength: [10, 'Phone number must be at least 10 digits'],
        maxlength: [15, 'Phone number cannot exceed 15 digits']
    },
    logoUrl: {
        type: String,
        trim: true,
        match: [/^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/, 'Please provide a valid URL for the logo']
    },
    basePrice: {
        type: Number,
        min: [0, 'Base price cannot be negative'],
        default: 0
    },
    isAvailable: {
        type: Boolean,
        default: false
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            index: '2dsphere',
            validate: {
                validator: function(v) {
                    return v && v.length === 2; // [longitude, latitude]
                },
                message: 'Coordinates must contain exactly longitude and latitude'
            }
        },
        address: {
            type: String,
            required: [true, 'Address is required'],
            trim: true
        }
    },
    rating: {
        type: Number,
        min: [0, 'Rating cannot be less than 0'],
        max: [5, 'Rating cannot be more than 5'],
        default: 0
    },
    reviewCount: {
        type: Number,
        default: 0,
        min: 0
    },
    profileSetup: {
        branding: progressConstraints,
        location: progressConstraints,
        pricing: progressConstraints,
        category: progressConstraints
    },
    verification: {
        status: {
            type: String,
            enum: ['PENDING', 'APPROVED', 'REJECTED'],
            default: 'PENDING'
        },
        reviewedAt: Date,
        adminMessage: String
    }
}, {
    timestamps: true
});

const Provider = mongoose.model("Provider", providerSchema);
module.exports = Provider;
