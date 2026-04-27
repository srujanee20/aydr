const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Booking must be associated with a Customer']
    },
    providerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Provider',
        required: [true, 'Booking must be associated with a Provider']
    },
    serviceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service',
        required: [true, 'Booking must be associated with a Service']
    },
    status: {
        type: String,
        enum: {
            values: ['REQUESTED', 'ACCEPTED', 'REJECTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
            message: '{VALUE} is not a valid booking status'
        },
        default: 'REQUESTED'
    },
    scheduledAt: {
        type: Date,
        required: [true, 'Scheduled time is required'],
        validate: {
            validator: function(v) {
                // Ensure the booking isn't scheduled for the past (only validated upon creation)
                return this.isNew ? v > Date.now() : true;
            },
            message: 'Scheduled date must be in the future'
        }
    },
    completedAt: {
        type: Date
    },
    priceAtBooking: {
        type: Number,
        required: [true, 'Price at booking is required to freeze the cost'],
        min: [0, 'Price cannot be negative']
    },
    address: {
        type: String,
        required: [true, 'Service delivery address is required'],
        trim: true
    },
    notes: {
        type: String,
        trim: true,
        maxlength: [500, 'Notes cannot exceed 500 characters']
    },
    customerImages: [{
        type: String,
        match: [/^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/, 'Please provide a valid URL for the image']
    }],
    providerNotes: {
        type: String,
        trim: true,
        maxlength: [1000, 'Provider notes cannot exceed 1000 characters']
    },
    providerImages: {
        before: [{
            type: String,
            match: [/^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/, 'Please provide a valid URL for the image']
        }],
        after: [{
            type: String,
            match: [/^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/, 'Please provide a valid URL for the image']
        }]
    },
    paymentStatus: {
        type: String,
        enum: ['PENDING', 'PAID', 'REFUNDED'],
        default: 'PENDING'
    }
}, {
    timestamps: true
});

// Automatically set completedAt when status is changed to COMPLETED
bookingSchema.pre('save', async function() {
    if (this.isModified('status') && this.status === 'COMPLETED' && !this.completedAt) {
        this.completedAt = Date.now();
    }
});

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;
