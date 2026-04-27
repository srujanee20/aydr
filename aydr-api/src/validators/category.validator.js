const Joi = require('joi');

const createCategorySchema = Joi.object({
    name: Joi.string().max(50).required(),
    description: Joi.string().max(200).optional(),
    iconUrl: Joi.string().uri().optional(),
    isActive: Joi.boolean().optional()
});

module.exports = {
    createCategorySchema
};
