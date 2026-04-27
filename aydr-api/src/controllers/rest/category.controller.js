const categoryService = require('../../services/category.service');

const createCategory = async (req, res, next) => {
    try {
        const category = await categoryService.createCategory(req.body);
        res.status(201).json({ message: 'Category created', category });
    } catch (error) {
        next(error);
    }
};

const getCategories = async (req, res, next) => {
    try {
        const categories = await categoryService.getAllCategories();
        res.status(200).json({ categories });
    } catch (error) {
        next(error);
    }
};

module.exports = { createCategory, getCategories };
