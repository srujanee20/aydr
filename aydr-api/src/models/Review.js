const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: [true, 'Review must be associated with a Booking'],
        unique: true // A booking can only have one review
    },
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Review must be written by a Customer']
    },
    providerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Provider',
        required: [true, 'Review must be for a Provider']
    },
    serviceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service',
        required: [true, 'Review must be for a specific Service']
    },
    rating: {
        type: Number,
        required: [true, 'Rating is required'],
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot exceed 5']
    },
    comment: {
        type: String,
        trim: true,
        maxlength: [1000, 'Comment cannot exceed 1000 characters']
    }
}, {
    timestamps: true
});

// Automatically update Provider's average rating when a new review is added
reviewSchema.post('save', async function(doc) {
    const Provider = mongoose.model('Provider');
    const Review = mongoose.model('Review');

    const stats = await Review.aggregate([
        { $match: { providerId: doc.providerId } },
        { 
            $group: {
                _id: '$providerId',
                avgRating: { $avg: '$rating' },
                numReviews: { $sum: 1 }
            }
        }
    ]);

    if (stats.length > 0) {
        await Provider.findByIdAndUpdate(doc.providerId, {
            rating: Math.round(stats[0].avgRating * 10) / 10, // Round to 1 decimal place
            reviewCount: stats[0].numReviews
        });
    }
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
