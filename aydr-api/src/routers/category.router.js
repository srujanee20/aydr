const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/rest/category.controller');
const categoryValidator = require('../validators/category.validator');
const validate = require('../middlewares/validate.middleware');
const { requireAuth, requireScope } = require('../middlewares/auth.middleware');

router.route('/')
    .get(categoryController.getCategories)
    .post(requireAuth, requireScope(['admin']), validate(categoryValidator.createCategorySchema), categoryController.createCategory);

module.exports = router;
