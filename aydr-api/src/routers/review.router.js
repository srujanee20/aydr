const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/rest/review.controller');
const reviewValidator = require('../validators/review.validator');
const validate = require('../middlewares/validate.middleware');
const { requireAuth, requireScope } = require('../middlewares/auth.middleware');

router.post('/', requireAuth, requireScope(['customer', 'admin']), validate(reviewValidator.createReviewSchema), reviewController.createReview);
router.get('/my', requireAuth, requireScope(['customer', 'admin']), reviewController.getMyReviews);
router.get('/provider/:providerId', reviewController.getReviewsByProvider);

module.exports = router;
