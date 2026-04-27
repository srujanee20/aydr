const Joi = require('joi');

const createProviderSchema = Joi.object({
    name: Joi.string().max(100).required(),
    category: Joi.string().hex().length(24).required(),
    bio: Joi.string().max(500).optional(),
    email: Joi.string().email().required(),
    phone: Joi.string().min(10).max(15).required(),
    logoUrl: Joi.string().uri().optional(),
    basePrice: Joi.number().min(0).optional(),
    isAvailable: Joi.boolean().optional(),
    location: Joi.object({
        type: Joi.string().valid('Point').default('Point'),
        coordinates: Joi.array().items(Joi.number()).length(2).required(),
        address: Joi.string().required()
    }).required()
});

const updateProviderSchema = Joi.object({
    name: Joi.string().max(100).optional(),
    bio: Joi.string().max(500).allow('', null).optional(),
    email: Joi.string().email().optional(),
    phone: Joi.string().min(10).max(15).optional(),
    logoUrl: Joi.string().allow('', null).optional(),
    basePrice: Joi.number().min(0).optional(),
    isAvailable: Joi.boolean().optional(),
    location: Joi.object({
        type: Joi.string().valid('Point').default('Point'),
        coordinates: Joi.array().items(Joi.number()).length(2).required(),
        address: Joi.string().required()
    }).optional()
});

module.exports = {
    createProviderSchema,
    updateProviderSchema
};
