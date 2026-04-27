const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/rest/service.controller');
const serviceValidator = require('../validators/service.validator');
const validate = require('../middlewares/validate.middleware');
const { requireAuth, requireScope } = require('../middlewares/auth.middleware');

router.post('/', requireAuth, requireScope(['admin', 'provider']), validate(serviceValidator.createServiceSchema), serviceController.createService);
router.get('/provider/:providerId', serviceController.getServicesByProvider);
router.put('/:id', requireAuth, requireScope(['admin', 'provider']), serviceController.updateService);

module.exports = router;
