const Category = require('../../models/Category');

const getCategories = async (req, res) => {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.render('admin/categories', { categories });
};

const createCategory = async (req, res) => {
    try {
        const payload = { ...req.body };
        if (!payload.iconUrl || payload.iconUrl.trim() === '') {
            delete payload.iconUrl;
        }
        
        const category = new Category(payload);
        await category.save();
        res.redirect('/admin/categories');
    } catch (error) {
        console.error('Error creating category:', error);
        res.status(400).send("Error creating category: " + error.message);
    }
};

const toggleCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        category.isActive = !category.isActive;
        await category.save();
        res.json({ success: true, isActive: category.isActive });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

const renameCategory = async (req, res) => {
    try {
        const { name } = req.body;
        const category = await Category.findByIdAndUpdate(req.params.id, { name }, { new: true, runValidators: true });
        res.json({ success: true, category });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

module.exports = { getCategories, createCategory, toggleCategory, renameCategory };
