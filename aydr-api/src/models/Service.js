const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    providerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Provider',
        required: [true, 'Service must belong to a Provider']
    },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'Service must belong to a Category']
    },
    name: {
        type: String,
        required: [true, 'Service name is required'],
        trim: true,
        maxlength: [100, 'Service name cannot exceed 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Service description is required'],
        trim: true,
        maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    price: {
        type: Number,
        required: [true, 'Service price is required'],
        min: [0, 'Price cannot be negative']
    },
    duration: {
        type: Number, // duration in minutes
        min: [1, 'Duration must be at least 1 minute']
    },
    primaryImage: {
        type: String,
        match: [/^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/, 'Please provide a valid URL for the primary image']
    },
    isActive: {
        type: Boolean,
        default: true
    },
    images: [{
        type: String,
        match: [/^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/, 'Please provide valid URLs for images']
    }],
    availability: {
        is24x7: {
            type: Boolean,
            default: false
        },
        schedule: [{
            days: [{
                type: String,
                enum: {
                    values: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY', 'ALL_DAYS'],
                    message: '{VALUE} is not a valid day'
                },
                required: true
            }],
            isAllDay: {
                type: Boolean,
                default: false
            },
            startTime: {
                type: String,
                match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Time must be in 24-hour HH:MM format (e.g., 09:00, 17:30)'],
                required: function() {
                    return !this.isAllDay;
                }
            },
            endTime: {
                type: String,
                match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Time must be in 24-hour HH:MM format (e.g., 09:00, 17:30)'],
                required: function() {
                    return !this.isAllDay;
                }
            }
        }]
    }
}, {
    timestamps: true
});

const Service = mongoose.model('Service', serviceSchema);
module.exports = Service;
