const express = require('express');
const router = express.Router();
const userController = require('../controllers/rest/user.controller');
const userValidator = require('../validators/user.validator');
const validate = require('../middlewares/validate.middleware');
const { requireAuth } = require('../middlewares/auth.middleware');

// 'me' endpoints intrinsically derive the ID from the JWT token
router.route('/me')
    .get(requireAuth, userController.getMe)
    .put(requireAuth, validate(userValidator.updateCustomerProfileSchema), userController.updateMe);

// explicit ID endpoints for strict REST patterns (validated within controller to match JWT or Admin)
router.route('/:id')
    .get(requireAuth, userController.getUserById)
    .put(requireAuth, validate(userValidator.updateCustomerProfileSchema), userController.updateUserById);

module.exports = router;
