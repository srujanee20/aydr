const bookingService = require('../../services/booking.service');

const createBooking = async (req, res, next) => {
    try {
        // Inject customerId from the authenticated user's JWT — never trust client payload
        const bookingData = { ...req.body, customerId: req.user._id };
        const booking = await bookingService.createBooking(bookingData);
        res.status(201).json({ message: 'Booking created', booking });
    } catch (error) {
        next(error);
    }
};

const getMyBookings = async (req, res, next) => {
    try {
        const scopes = req.user.jwtPayload.scp;
        const bookings = await bookingService.getMyBookings(req.user._id, scopes);
        res.status(200).json({ bookings });
    } catch (error) {
        next(error);
    }
};

const updateStatus = async (req, res, next) => {
    try {
        const booking = await bookingService.updateBookingStatus(req.params.id, req.body);
        res.status(200).json({ message: 'Booking updated', booking });
    } catch (error) {
        next(error);
    }
};

const rescheduleBooking = async (req, res, next) => {
    try {
        const booking = await bookingService.rescheduleBooking(req.params.id, req.body.scheduledAt);
        res.status(200).json({ message: 'Booking rescheduled', booking });
    } catch (error) {
        next(error);
    }
};

module.exports = { createBooking, getMyBookings, updateStatus, rescheduleBooking };
