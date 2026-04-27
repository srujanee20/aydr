const Joi = require('joi');

const createServiceSchema = Joi.object({
    providerId: Joi.string().hex().length(24).required(),
    categoryId: Joi.string().hex().length(24).required(),
    name: Joi.string().max(100).required(),
    description: Joi.string().max(1000).required(),
    price: Joi.number().min(0).required(),
    duration: Joi.number().min(1).optional(),
    primaryImage: Joi.string().allow('', null).optional(),
    images: Joi.array().items(Joi.string()).optional(),
    availability: Joi.object({
        is24x7: Joi.boolean().default(false),
        schedule: Joi.array().items(Joi.object({
            days: Joi.array().items(Joi.string().valid('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY', 'ALL_DAYS')).min(1).required(),
            isAllDay: Joi.boolean().default(false),
            startTime: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).when('isAllDay', { is: false, then: Joi.required() }),
            endTime: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).when('isAllDay', { is: false, then: Joi.required() })
        })).optional()
    }).optional()
});

module.exports = {
    createServiceSchema
};
