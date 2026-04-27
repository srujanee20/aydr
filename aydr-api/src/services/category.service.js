const Category = require('../models/Category');

const createCategory = async (categoryData) => {
    const category = new Category(categoryData);
    return await category.save();
};

const getAllCategories = async () => {
    return await Category.find({ isActive: true });
};

module.exports = { createCategory, getAllCategories };
