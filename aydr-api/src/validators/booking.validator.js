const Joi = require('joi');

const createBookingSchema = Joi.object({
    providerId: Joi.string().hex().length(24).required(),
    serviceId: Joi.string().hex().length(24).required(),
    scheduledAt: Joi.date().greater('now').required(),
    priceAtBooking: Joi.number().min(0).required(),
    address: Joi.string().required(),
    notes: Joi.string().max(500).allow('').optional(),
    customerImages: Joi.array().items(Joi.string().uri()).optional()
});

const updateBookingStatusSchema = Joi.object({
    status: Joi.string().valid('REQUESTED', 'ACCEPTED', 'REJECTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED').optional(),
    providerNotes: Joi.string().max(1000).allow('').optional(),
    providerImages: Joi.object({
        before: Joi.array().items(Joi.string().uri()).optional(),
        after: Joi.array().items(Joi.string().uri()).optional()
    }).optional()
});

const rescheduleBookingSchema = Joi.object({
    scheduledAt: Joi.date().greater('now').required()
});

module.exports = {
    createBookingSchema,
    updateBookingStatusSchema,
    rescheduleBookingSchema
};
