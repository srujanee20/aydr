import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import useApi from '../../../hooks/useApi';
import LoadingSpinner from '../../common/LoadingSpinner';

const ProviderDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [,, loading, call] = useApi();

    const [provider, setProvider] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [services, setServices] = useState([]);

    useEffect(() => {
        if (user?.providerId) {
            fetchProviderData();
        }
    }, [user]);

    const fetchProviderData = async () => {
        try {
            const pid = typeof user.providerId === 'object' ? user.providerId._id : user.providerId;
            const [provData, bookData, svcData] = await Promise.all([
                call('GET', `/providers/${pid}`),
                call('GET', '/bookings/my'),
                call('GET', `/services/provider/${pid}`)
            ]);
            setProvider(provData.provider);
            setBookings(bookData.bookings || []);
            setServices(svcData.services || []);
        } catch { /* handled */ }
    };

    const stats = {
        total: bookings.length,
        pending: bookings.filter(b => b.status === 'REQUESTED').length,
        active: bookings.filter(b => ['ACCEPTED', 'IN_PROGRESS'].includes(b.status)).length,
        completed: bookings.filter(b => b.status === 'COMPLETED').length,
    };

    if (loading && !provider) return <LoadingSpinner size="lg" text="Loading dashboard..." />;

    return (
        <main className="prov-dashboard">
            <div className="prov-dashboard__header">
                <div>
                    <h1>Provider Dashboard</h1>
                    <p>Welcome back, {provider?.name || user?.name}</p>
                </div>
                {provider?.verification?.status && (
                    <span className={`prov-dashboard__verification prov-dashboard__verification--${provider.verification.status.toLowerCase()}`}>
                        {provider.verification.status}
                    </span>
                )}
            </div>

            {/* Stats */}
            <div className="prov-dashboard__stats">
                <div className="stat-card">
                    <span className="stat-card__number">{stats.total}</span>
                    <span className="stat-card__label">Total Bookings</span>
                </div>
                <div className="stat-card stat-card--warning">
                    <span className="stat-card__number">{stats.pending}</span>
                    <span className="stat-card__label">Pending Review</span>
                </div>
                <div className="stat-card stat-card--info">
                    <span className="stat-card__number">{stats.active}</span>
                    <span className="stat-card__label">Active Jobs</span>
                </div>
                <div className="stat-card stat-card--success">
                    <span className="stat-card__number">{stats.completed}</span>
                    <span className="stat-card__label">Completed</span>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="prov-dashboard__actions">
                <h2>Quick Actions</h2>
                <div className="prov-dashboard__action-grid">
                    <button className="action-card" onClick={() => navigate('/provider/bookings')}>
                        <span className="action-card__icon">📋</span>
                        <span className="action-card__title">Manage Bookings</span>
                        <span className="action-card__desc">Accept, reject, or complete jobs</span>
                    </button>
                    <button className="action-card" onClick={() => navigate('/provider/settings')}>
                        <span className="action-card__icon">⚙️</span>
                        <span className="action-card__title">Settings & Services</span>
                        <span className="action-card__desc">Update profile, add services</span>
                    </button>
                </div>
            </div>

            {/* Recent Bookings */}
            {stats.pending > 0 && (
                <div className="prov-dashboard__recent">
                    <h2>Pending Requests</h2>
                    <div className="prov-dashboard__pending-list">
                        {bookings.filter(b => b.status === 'REQUESTED').slice(0, 3).map(b => (
                            <div key={b._id} className="pending-item">
                                <div>
                                    <strong>{b.serviceId?.name || 'Service'}</strong>
                                    <p>{b.customerId?.name || 'Customer'} · {new Date(b.scheduledAt).toLocaleDateString()}</p>
                                </div>
                                <span className="pending-item__price">₹{b.priceAtBooking}</span>
                            </div>
                        ))}
                        {stats.pending > 3 && (
                            <button className="prov-dashboard__view-all" onClick={() => navigate('/provider/bookings')}>
                                View all {stats.pending} pending →
                            </button>
                        )}
                    </div>
                </div>
            )}
        </main>
    );
};

export default ProviderDashboard;
