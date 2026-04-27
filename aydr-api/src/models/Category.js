const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Category name is required'],
        unique: true,
        trim: true,
        maxlength: [50, 'Category name cannot exceed 50 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [200, 'Description cannot exceed 200 characters']
    },
    iconUrl: {
        type: String,
        trim: true,
        match: [/^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/, 'Please provide a valid URL for the icon']
    },
    isActive: {
        type: Boolean,
        default: true
    },
    status: {
        type: String,
        enum: ['PENDING', 'APPROVED', 'REJECTED'],
        default: 'APPROVED'
    },
    submittedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Provider'
    }
}, {
    timestamps: true
});

const Category = mongoose.model('Category', categorySchema);
module.exports = Category;
