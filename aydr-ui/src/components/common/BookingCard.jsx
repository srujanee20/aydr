import { useState } from 'react';
import Modal from './Modal';
import useApi from '../../hooks/useApi';

const STATUS_CONFIG = {
    REQUESTED: { label: 'Requested', color: '#6366f1', bg: 'rgba(99, 102, 241, 0.1)' },
    ACCEPTED: { label: 'Accepted', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
    REJECTED: { label: 'Rejected', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' },
    IN_PROGRESS: { label: 'In Progress', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
    COMPLETED: { label: 'Completed', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
    CANCELLED: { label: 'Cancelled', color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.1)' },
};

const BookingCard = ({ booking, role, onUpdateStatus, onRefresh }) => {
    const status = STATUS_CONFIG[booking.status] || STATUS_CONFIG.REQUESTED;
    const [,, loading, callApi] = useApi();

    // Modal States
    const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
    const [newDate, setNewDate] = useState('');

    const [isReviewOpen, setIsReviewOpen] = useState(false);
    const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });

    const [isCompleteOpen, setIsCompleteOpen] = useState(false);
    const [completeForm, setCompleteForm] = useState({ providerNotes: '', beforeImage: '', afterImage: '' });

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    const handleReschedule = async (e) => {
        e.preventDefault();
        try {
            await callApi('PATCH', `/bookings/${booking._id}/reschedule`, { scheduledAt: new Date(newDate).toISOString() });
            setIsRescheduleOpen(false);
            if (onRefresh) onRefresh();
        } catch { alert('Failed to reschedule'); }
    };

    const handleReview = async (e) => {
        e.preventDefault();
        try {
            await callApi('POST', `/reviews`, {
                bookingId: booking._id,
                providerId: booking.providerId._id,
                serviceId: booking.serviceId._id,
                rating: Number(reviewForm.rating),
                comment: reviewForm.comment
            });
            setIsReviewOpen(false);
            if (onRefresh) onRefresh();
        } catch (err) { alert(err.response?.data?.error || 'Failed to submit review'); }
    };

    const handleComplete = async (e) => {
        e.preventDefault();
        try {
            const payload = { status: 'COMPLETED', providerNotes: completeForm.providerNotes, providerImages: { before: [], after: [] } };
            if (completeForm.beforeImage) payload.providerImages.before.push(completeForm.beforeImage);
            if (completeForm.afterImage) payload.providerImages.after.push(completeForm.afterImage);
            
            await callApi('PATCH', `/bookings/${booking._id}/status`, payload);
            setIsCompleteOpen(false);
            if (onRefresh) onRefresh();
        } catch { alert('Failed to mark complete'); }
    };

    // Provider Actions
    const getProviderActions = () => {
        if (role !== 'PROVIDER') return null;

        if (booking.status === 'REQUESTED') {
            return (
                <div className="booking-card__actions">
                    <button className="booking-card__btn booking-card__btn--accept" onClick={() => onUpdateStatus(booking._id, 'ACCEPTED')}>Accept</button>
                    <button className="booking-card__btn booking-card__btn--reject" onClick={() => onUpdateStatus(booking._id, 'REJECTED')}>Reject</button>
                </div>
            );
        }
        if (booking.status === 'ACCEPTED') {
            return (
                <div className="booking-card__actions">
                    <button className="booking-card__btn booking-card__btn--progress" onClick={() => onUpdateStatus(booking._id, 'IN_PROGRESS')}>Start Work</button>
                </div>
            );
        }
        if (booking.status === 'IN_PROGRESS') {
            return (
                <div className="booking-card__actions">
                    <button className="booking-card__btn booking-card__btn--complete" onClick={() => setIsCompleteOpen(true)}>Mark Complete</button>
                </div>
            );
        }
        return null;
    };

    // Customer Actions
    const getCustomerActions = () => {
        if (role !== 'CUSTOMER') return null;
        if (['REQUESTED', 'ACCEPTED'].includes(booking.status)) {
            return (
                <div className="booking-card__actions">
                    <button className="booking-card__btn booking-card__btn--cancel" onClick={() => onUpdateStatus(booking._id, 'CANCELLED')}>Cancel</button>
                    <button className="booking-card__btn booking-card__btn--accept" onClick={() => setIsRescheduleOpen(true)}>Reschedule</button>
                </div>
            );
        }
        if (booking.status === 'COMPLETED') {
            return (
                <div className="booking-card__actions">
                    <button className="booking-card__btn booking-card__btn--accept" onClick={() => setIsReviewOpen(true)}>Submit Review</button>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="booking-card">
            <div className="booking-card__header">
                <div>
                    <h4 className="booking-card__service">{booking.serviceId?.name || 'Service'}</h4>
                    <p className="booking-card__provider">
                        {role === 'CUSTOMER'
                            ? booking.providerId?.name || 'Provider'
                            : booking.customerId?.name || 'Customer'
                        }
                    </p>
                </div>
                <span className="booking-card__status" style={{ color: status.color, backgroundColor: status.bg }}>
                    {status.label}
                </span>
            </div>
            <div className="booking-card__details">
                <div className="booking-card__detail">
                    <span className="booking-card__label">Scheduled</span>
                    <span>{formatDate(booking.scheduledAt)}</span>
                </div>
                <div className="booking-card__detail">
                    <span className="booking-card__label">Price</span>
                    <span>₹{booking.priceAtBooking}</span>
                </div>
                <div className="booking-card__detail">
                    <span className="booking-card__label">Address</span>
                    <span>{booking.address}</span>
                </div>
                {booking.notes && (
                    <div className="booking-card__detail">
                        <span className="booking-card__label">Notes</span>
                        <span>{booking.notes}</span>
                    </div>
                )}
                {booking.customerImages && booking.customerImages.length > 0 && (
                    <div className="booking-card__detail">
                        <span className="booking-card__label">Issue Images</span>
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                            {booking.customerImages.map((img, idx) => (
                                <a key={idx} href={img} target="_blank" rel="noopener noreferrer">
                                    <img src={img} alt="Issue" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '0.5rem', border: '1px solid var(--border)' }} />
                                </a>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            {getProviderActions()}
            {getCustomerActions()}

            {/* Reschedule Modal */}
            <Modal isOpen={isRescheduleOpen} onClose={() => setIsRescheduleOpen(false)} title="Reschedule Booking">
                <form className="booking-form" onSubmit={handleReschedule}>
                    <label>
                        <span>New Date & Time</span>
                        <input type="datetime-local" value={newDate} onChange={(e) => setNewDate(e.target.value)} min={newDate || new Date().toISOString().slice(0, 16)} required />
                    </label>
                    <button type="submit" className="booking-form__submit" disabled={loading}>{loading ? 'Saving...' : 'Confirm Reschedule'}</button>
                </form>
            </Modal>

            {/* Complete Job Modal */}
            <Modal isOpen={isCompleteOpen} onClose={() => setIsCompleteOpen(false)} title="Complete Job">
                <form className="booking-form" onSubmit={handleComplete}>
                    <label>
                        <span>Work Notes (optional)</span>
                        <textarea value={completeForm.providerNotes} onChange={(e) => setCompleteForm({...completeForm, providerNotes: e.target.value})} placeholder="What work was done?" rows={3} maxLength={1000} />
                    </label>
                    <label>
                        <span>Before Image URL (optional)</span>
                        <input type="url" value={completeForm.beforeImage} onChange={(e) => setCompleteForm({...completeForm, beforeImage: e.target.value})} placeholder="https://..." />
                    </label>
                    <label>
                        <span>After Image URL (optional)</span>
                        <input type="url" value={completeForm.afterImage} onChange={(e) => setCompleteForm({...completeForm, afterImage: e.target.value})} placeholder="https://..." />
                    </label>
                    <button type="submit" className="booking-form__submit" disabled={loading}>{loading ? 'Saving...' : 'Mark as Completed'}</button>
                </form>
            </Modal>

            {/* Review Modal */}
            <Modal isOpen={isReviewOpen} onClose={() => setIsReviewOpen(false)} title="Submit Review">
                <form className="booking-form" onSubmit={handleReview}>
                    <label>
                        <span>Rating (1-5)</span>
                        <input type="number" min="1" max="5" value={reviewForm.rating} onChange={(e) => setReviewForm({...reviewForm, rating: e.target.value})} required />
                    </label>
                    <label>
                        <span>Comment (optional)</span>
                        <textarea value={reviewForm.comment} onChange={(e) => setReviewForm({...reviewForm, comment: e.target.value})} placeholder="How was the service?" rows={3} maxLength={1000} />
                    </label>
                    <button type="submit" className="booking-form__submit" disabled={loading}>{loading ? 'Submitting...' : 'Submit Review'}</button>
                </form>
            </Modal>
        </div>
    );
};

export default BookingCard;
