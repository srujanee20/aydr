const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/rest/booking.controller');
const bookingValidator = require('../validators/booking.validator');
const validate = require('../middlewares/validate.middleware');
const { requireAuth, requireScope } = require('../middlewares/auth.middleware');

router.post('/', requireAuth, requireScope(['customer', 'admin']), validate(bookingValidator.createBookingSchema), bookingController.createBooking);
router.get('/my', requireAuth, bookingController.getMyBookings);
router.patch('/:id/status', requireAuth, requireScope(['provider', 'customer', 'admin']), validate(bookingValidator.updateBookingStatusSchema), bookingController.updateStatus);
router.patch('/:id/reschedule', requireAuth, requireScope(['customer', 'admin']), validate(bookingValidator.rescheduleBookingSchema), bookingController.rescheduleBooking);

module.exports = router;
