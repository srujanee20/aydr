const reviewService = require('../../services/review.service');

const createReview = async (req, res, next) => {
    try {
        const reviewData = { ...req.body, customerId: req.user._id };
        const review = await reviewService.createReview(reviewData);
        res.status(201).json({ message: 'Review submitted', review });
    } catch (error) {
        next(error);
    }
};

const getReviewsByProvider = async (req, res, next) => {
    try {
        const reviews = await reviewService.getProviderReviews(req.params.providerId);
        res.status(200).json({ reviews });
    } catch (error) {
        next(error);
    }
};

const getMyReviews = async (req, res, next) => {
    try {
        const reviews = await reviewService.getMyReviews(req.user._id);
        res.status(200).json({ reviews });
    } catch (error) {
        next(error);
    }
};

module.exports = { createReview, getReviewsByProvider, getMyReviews };
