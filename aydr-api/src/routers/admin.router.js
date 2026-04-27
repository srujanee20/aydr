const express = require('express');
const router = express.Router();
const { requireAdminSession } = require('../middlewares/auth.middleware');

const authController = require('../controllers/admin/auth.controller');
const providerController = require('../controllers/admin/provider.controller');
const categoryController = require('../controllers/admin/category.controller');
const reviewController = require('../controllers/admin/review.controller');
const Provider = require('../models/Provider');
const Booking = require('../models/Booking');

// Auth (No session required)
router.get('/login', authController.getLogin);
router.post('/login', authController.postLogin);
router.get('/logout', authController.logout);

// Protected routes
router.use(requireAdminSession);

router.get('/dashboard', async (req, res) => {
    // Quick stats for the dashboard
    const pendingProviders = await Provider.countDocuments({ 'verification.status': 'PENDING' });
    const totalBookings = await Booking.countDocuments();
    res.render('admin/dashboard', { pendingProviders, totalBookings });
});

// Providers
router.get('/providers', providerController.getProviders);
router.patch('/providers/:id/status', providerController.updateStatus);

// Categories
router.get('/categories', categoryController.getCategories);
router.post('/categories', categoryController.createCategory);
router.patch('/categories/:id/toggle', categoryController.toggleCategory);
router.patch('/categories/:id/rename', categoryController.renameCategory);

// Reviews
router.get('/reviews', reviewController.getReviews);
router.delete('/reviews/:id', reviewController.deleteReview);

// Redirect root to dashboard
router.get('/', (req, res) => res.redirect('/admin/dashboard'));

module.exports = router;
