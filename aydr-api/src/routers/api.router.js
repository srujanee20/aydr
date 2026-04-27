const express = require('express');
const router = express.Router();

const authRouter = require('./auth.router');
const userRouter = require('./user.router');
const categoryRouter = require('./category.router');
const providerRouter = require('./provider.router');
const serviceRouter = require('./service.router');
const bookingRouter = require('./booking.router');
const reviewRouter = require('./review.router');
const uploadRouter = require('./upload.router');

// Mount all resource routers using RESTful plural naming conventions
router.use('/auth', authRouter);
router.use('/users', userRouter);
router.use('/categories', categoryRouter);
router.use('/providers', providerRouter);
router.use('/services', serviceRouter);
router.use('/bookings', bookingRouter);
router.use('/reviews', reviewRouter);
router.use('/uploads', uploadRouter);

module.exports = router;