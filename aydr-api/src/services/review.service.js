const Review = require('../models/Review');

const createReview = async (reviewData) => {
    const review = new Review(reviewData);
    return await review.save();
};

const getProviderReviews = async (providerId) => {
    return await Review.find({ providerId }).populate('customerId', 'name').sort({ createdAt: -1 });
};

const getMyReviews = async (customerId) => {
    return await Review.find({ customerId }).populate('providerId', 'providerName').sort({ createdAt: -1 });
};

module.exports = { createReview, getProviderReviews, getMyReviews };
