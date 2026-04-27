const Joi = require('joi');

const registerCustomerSchema = Joi.object({
    name: Joi.string().max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    phone: Joi.string().min(10).max(15).allow('').optional()
});

const registerProviderSchema = Joi.object({
    userName: Joi.string().max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    
    // Provider specific fields
    providerName: Joi.string().max(100).required(),
    category: Joi.string().hex().length(24).allow(null, '').optional(),
    customCategory: Joi.string().max(50).allow(null, '').optional(),
    phone: Joi.string().min(10).max(15).required(),
    location: Joi.object({
        type: Joi.string().valid('Point').default('Point'),
        coordinates: Joi.array().items(Joi.number()).length(2).required(),
        address: Joi.string().required()
    }).required()
}).or('category', 'customCategory');

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    role: Joi.string().valid('CUSTOMER', 'PROVIDER', 'ADMIN').optional()
});

const updateCustomerProfileSchema = Joi.object({
    name: Joi.string().max(50).optional(),
    phone: Joi.string().min(10).max(15).allow('').optional(),
    profilePic: Joi.string().allow('', null).optional()
});

module.exports = {
    registerCustomerSchema,
    registerProviderSchema,
    loginSchema,
    updateCustomerProfileSchema
};
