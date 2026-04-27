import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import useApi from '../../../hooks/useApi';
import BookingCard from '../../common/BookingCard';
import LoadingSpinner from '../../common/LoadingSpinner';

const STATUSES = ['ALL', 'REQUESTED', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'REJECTED', 'CANCELLED'];

const ProviderBookings = () => {
    const { user } = useAuth();
    const [,, loading, call] = useApi();
    const [bookings, setBookings] = useState([]);
    const [filterStatus, setFilterStatus] = useState('ALL');

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const data = await call('GET', '/bookings/my');
            setBookings(data.bookings || []);
        } catch { /* handled */ }
    };

    const handleUpdateStatus = async (bookingId, status) => {
        try {
            await call('PATCH', `/bookings/${bookingId}/status`, { status });
            fetchBookings();
        } catch { /* handled */ }
    };

    const filtered = filterStatus === 'ALL'
        ? bookings
        : bookings.filter(b => b.status === filterStatus);

    return (
        <main className="prov-bookings">
            <div className="prov-bookings__header">
                <h1>Bookings</h1>
                <p>Manage incoming job requests</p>
            </div>

            <div className="prov-bookings__filters">
                {STATUSES.map(s => (
                    <button
                        key={s}
                        className={`prov-bookings__filter ${filterStatus === s ? 'active' : ''}`}
                        onClick={() => setFilterStatus(s)}
                    >
                        {s === 'ALL' ? 'All' : s.replace('_', ' ')}
                        {s !== 'ALL' && (
                            <span className="prov-bookings__filter-count">
                                {bookings.filter(b => b.status === s).length}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            <div className="prov-bookings__list">
                {loading ? (
                    <LoadingSpinner text="Loading bookings..." />
                ) : filtered.length === 0 ? (
                    <div className="prov-bookings__empty">
                        <p>📋</p>
                        <h3>No bookings {filterStatus !== 'ALL' ? `with status "${filterStatus}"` : 'yet'}</h3>
                    </div>
                ) : (
                    filtered.map(booking => (
                        <BookingCard
                            key={booking._id}
                            booking={booking}
                            role="PROVIDER"
                            onUpdateStatus={handleUpdateStatus}
                            onRefresh={fetchBookings}
                        />
                    ))
                )}
            </div>
        </main>
    );
};

export default ProviderBookings;
