const Booking = require('../models/Booking');
const User = require('../models/User');

const createBooking = async (bookingData) => {
    const booking = new Booking(bookingData);
    return await booking.save();
};

const getMyBookings = async (userId, scopes) => {
    const user = await User.findById(userId);
    // If the user has a provider role and an attached providerId, fetch bookings mapped to their provider profile
    if (scopes.includes('provider') && user.providerId) {
        return await Booking.find({ providerId: user.providerId }).populate('serviceId customerId').sort({ createdAt: -1 });
    }
    // Otherwise, fetch bookings they made as a customer
    return await Booking.find({ customerId: userId }).populate('serviceId providerId').sort({ createdAt: -1 });
};

const updateBookingStatus = async (id, payload) => {
    return await Booking.findByIdAndUpdate(id, payload, { new: true });
};

const rescheduleBooking = async (id, scheduledAt) => {
    return await Booking.findByIdAndUpdate(id, { scheduledAt }, { new: true, runValidators: true });
};

module.exports = { createBooking, getMyBookings, updateBookingStatus, rescheduleBooking };
