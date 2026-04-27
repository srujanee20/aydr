const express = require('express');
const router = express.Router();
const providerController = require('../controllers/rest/provider.controller');
const providerValidator = require('../validators/provider.validator');
const validate = require('../middlewares/validate.middleware');
const { requireAuth, requireScope, optionalAuth } = require('../middlewares/auth.middleware');

router.route('/')
    .get(optionalAuth, providerController.getProviders)
    .post(requireAuth, requireScope(['admin', 'provider']), validate(providerValidator.createProviderSchema), providerController.createProvider);

router.route('/:id')
    .get(optionalAuth, providerController.getProvider)
    .put(requireAuth, requireScope(['provider', 'admin']), validate(providerValidator.updateProviderSchema), providerController.updateSettings);

module.exports = router;
