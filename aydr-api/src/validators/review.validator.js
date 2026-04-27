const Joi = require('joi');

const createReviewSchema = Joi.object({
    bookingId: Joi.string().hex().length(24).required(),
    providerId: Joi.string().hex().length(24).required(),
    serviceId: Joi.string().hex().length(24).required(),
    rating: Joi.number().min(1).max(5).required(),
    comment: Joi.string().max(1000).allow('').optional()
});

module.exports = {
    createReviewSchema
};
