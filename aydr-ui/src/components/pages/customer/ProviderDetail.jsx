import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import useApi from '../../../hooks/useApi';
import ServiceCard from '../../common/ServiceCard';
import Modal from '../../common/Modal';
import LoadingSpinner from '../../common/LoadingSpinner';

const DEFAULT_IMAGE = '/images/avatar-default.png';

const ProviderDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [,, loading, call] = useApi();

    const [provider, setProvider] = useState(null);
    const [services, setServices] = useState([]);
    const [bookingModal, setBookingModal] = useState({ open: false, service: null });
    const [bookingForm, setBookingForm] = useState({ scheduledAt: '', address: '', notes: '', customerImage: '' });
    const [bookingError, setBookingError] = useState('');
    const [bookingSuccess, setBookingSuccess] = useState('');

    useEffect(() => {
        fetchProvider();
        fetchServices();
    }, [id]);

    const fetchProvider = async () => {
        try {
            const data = await call('GET', `/providers/${id}`);
            setProvider(data.provider);
        } catch { navigate('/customer/dashboard'); }
    };

    const fetchServices = async () => {
        try {
            const data = await call('GET', `/services/provider/${id}`);
            setServices(data.services || []);
        } catch { /* handled */ }
    };

    const openBookingModal = (service) => {
        setBookingModal({ open: true, service });
        setBookingForm({ scheduledAt: '', address: '', notes: '', customerImage: '' });
        setBookingError('');
        setBookingSuccess('');
    };

    const handleBookingSubmit = async (e) => {
        e.preventDefault();
        setBookingError('');

        const service = bookingModal.service;
        const payload = {
            providerId: id,
            serviceId: service._id,
            scheduledAt: new Date(bookingForm.scheduledAt).toISOString(),
            priceAtBooking: service.price,
            address: bookingForm.address,
            notes: bookingForm.notes || undefined,
            customerImages: bookingForm.customerImage ? [bookingForm.customerImage] : undefined
        };

        try {
            await call('POST', '/bookings', payload);
            setBookingSuccess('Booking request sent! The provider will review your request.');
            setTimeout(() => {
                setBookingModal({ open: false, service: null });
            }, 2000);
        } catch (err) {
            setBookingError(err.response?.data?.message || 'Failed to create booking.');
        }
    };

    if (!provider) return <LoadingSpinner size="lg" text="Loading provider..." />;

    return (
        <main className="provider-detail">
            {/* Provider Header Banner */}
            <section className="provider-detail__hero" style={{ padding: 0, position: 'relative', overflow: 'hidden', minHeight: '300px', display: 'flex', alignItems: 'flex-end' }}>
                {provider.logoUrl ? (
                    <img 
                        src={provider.logoUrl} 
                        alt={provider.name} 
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }}
                    />
                ) : (
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', zIndex: 0 }}></div>
                )}
                
                {/* Overlay gradient for text readability */}
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)', zIndex: 1 }}></div>

                <div className="provider-detail__hero-inner" style={{ position: 'relative', zIndex: 2, padding: '2rem', width: '100%', color: 'white' }}>
                    <div className="provider-detail__info" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <h1 style={{ fontSize: '2.5rem', margin: 0 }}>{provider.name}</h1>
                        <div className="provider-detail__meta" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <span className="provider-detail__category" style={{ background: 'var(--primary)', padding: '0.2rem 0.8rem', borderRadius: '2rem', fontSize: '0.9rem' }}>{provider.category?.name}</span>
                            {provider.rating > 0 && (
                                <span className="provider-detail__rating">
                                    ⭐ {provider.rating} <small>({provider.reviewCount} reviews)</small>
                                </span>
                            )}
                        </div>
                        {provider.bio && <p className="provider-detail__bio" style={{ maxWidth: '800px', opacity: 0.9 }}>{provider.bio}</p>}
                        <div className="provider-detail__contact" style={{ display: 'flex', gap: '1.5rem', opacity: 0.8, marginTop: '1rem' }}>
                            {provider.email && <span>✉️ {provider.email}</span>}
                            {provider.phone && <span>📞 {provider.phone}</span>}
                            {provider.location?.address && <span>📍 {provider.location.address}</span>}
                        </div>
                    </div>
                </div>
            </section>

            {/* Services */}
            <section className="provider-detail__services">
                <h2>Services Offered</h2>
                {services.length === 0 ? (
                    <p className="provider-detail__empty">This provider hasn't listed any services yet.</p>
                ) : (
                    <div className="provider-detail__grid">
                        {services.map(service => (
                            <ServiceCard
                                key={service._id}
                                service={service}
                                showBookBtn={true}
                                onBook={openBookingModal}
                            />
                        ))}
                    </div>
                )}
            </section>

            {/* Booking Modal */}
            <Modal
                isOpen={bookingModal.open}
                onClose={() => setBookingModal({ open: false, service: null })}
                title={`Book: ${bookingModal.service?.name || ''}`}
            >
                {bookingSuccess ? (
                    <div className="booking-success">
                        <span className="booking-success__icon">✅</span>
                        <p>{bookingSuccess}</p>
                    </div>
                ) : (
                    <form className="booking-form" onSubmit={handleBookingSubmit}>
                        {bookingError && <div className="booking-form__error">{bookingError}</div>}

                        <div className="booking-form__price">
                            <span>Price</span>
                            <strong>₹{bookingModal.service?.price}</strong>
                        </div>

                        <label>
                            <span>Schedule Date & Time</span>
                            <input
                                type="datetime-local"
                                value={bookingForm.scheduledAt}
                                onChange={(e) => setBookingForm({ ...bookingForm, scheduledAt: e.target.value })}
                                min={new Date().toISOString().slice(0, 16)}
                                required
                            />
                        </label>

                        <label>
                            <span>Service Address</span>
                            <input
                                type="text"
                                value={bookingForm.address}
                                onChange={(e) => setBookingForm({ ...bookingForm, address: e.target.value })}
                                placeholder="Where should the provider come?"
                                required
                            />
                        </label>

                        <label>
                            <span>Notes (optional)</span>
                            <textarea
                                value={bookingForm.notes}
                                onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
                                placeholder="Any special instructions..."
                                rows={3}
                                maxLength={500}
                            />
                        </label>

                        <label>
                            <span>Issue Image URL (optional)</span>
                            <input
                                type="url"
                                value={bookingForm.customerImage}
                                onChange={(e) => setBookingForm({ ...bookingForm, customerImage: e.target.value })}
                                placeholder="https://... (Link to image)"
                            />
                        </label>

                        <button type="submit" className="booking-form__submit" disabled={loading}>
                            {loading ? 'Booking...' : 'Confirm Booking'}
                        </button>
                    </form>
                )}
            </Modal>
        </main>
    );
};

export default ProviderDetail;
