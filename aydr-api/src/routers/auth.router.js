const express = require('express');
const router = express.Router();
const userController = require('../controllers/rest/user.controller');
const userValidator = require('../validators/user.validator');
const validate = require('../middlewares/validate.middleware');

// Authentication routes
router.post('/register/customer', validate(userValidator.registerCustomerSchema), userController.registerCustomer);
router.post('/register/provider', validate(userValidator.registerProviderSchema), userController.registerProvider);
router.post('/login', validate(userValidator.loginSchema), userController.login);

module.exports = router;
