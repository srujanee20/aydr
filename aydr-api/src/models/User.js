const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
    role: {
        type: String,
        enum: ['CUSTOMER', 'PROVIDER', 'ADMIN'],
        default: 'CUSTOMER'
    },
    name: {
        type: String,
        required: function() {
            return this.role !== 'ADMIN';
        },
        trim: true,
        maxlength: [50, 'Name cannot be more than 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please add a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters']
    },
    phone: {
        type: String,
        trim: true,
        validate: {
            validator: function(phone) {
                return !phone || (phone.length >= 10 && phone.length <= 15);
            },
            message: 'Phone number must be between 10 and 15 digits'
        }
    },
    profilePic: {
        type: String,
        default: null
    },
    isActive: {
        type: Boolean,
        default: true
    },
    providerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Provider',
        default: null
    }
}, {
    timestamps: true
});

userSchema.methods.checkPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
}

userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model("User", userSchema);
module.exports = User;