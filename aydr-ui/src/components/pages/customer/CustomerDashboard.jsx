import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import { useAuth } from '../../../context/AuthContext';
import useApi from '../../../hooks/useApi';
import BookingCard from '../../common/BookingCard';
import LoadingSpinner from '../../common/LoadingSpinner';

const DEFAULT_IMAGE = '/images/avatar-default.png';

// Component to let customer click the map to set a search point
const MapClickHandler = ({ onMapClick }) => {
    useMapEvents({
        click(e) { onMapClick([e.latlng.lat, e.latlng.lng]); }
    });
    return null;
};

const CustomerDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [,, loadingProviders, callApi] = useApi();
    const [,, loadingBookings, callBookings] = useApi();

    const [providers, setProviders] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [activeTab, setActiveTab] = useState('explore'); // 'explore' | 'bookings'

    const mapCenter = [20.2961, 85.8245];

    const [searchArea, setSearchArea] = useState('');
    const [fallbackCenter, setFallbackCenter] = useState(null);

    useEffect(() => {
        fetchProviders();
        fetchBookings();
        fetchCategories();
    }, []);

    const fetchProviders = async (searchTerm = '') => {
        try {
            const url = searchTerm ? `/providers?search=${encodeURIComponent(searchTerm)}` : '/providers';
            const data = await callApi('GET', url);
            const fetchedProviders = data.providers || [];

            if (fetchedProviders.length === 0 && searchTerm) {
                try {
                    // 1. Get coordinates to move the map
                    const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchTerm)}`);
                    const geoData = await geoRes.json();
                    if (geoData && geoData.length > 0) {
                        setFallbackCenter([parseFloat(geoData[0].lat), parseFloat(geoData[0].lon)]);
                    }

                    // 2. Fetch all providers so pins still appear
                    const allData = await callApi('GET', '/providers');
                    setProviders(allData.providers || []);
                } catch (err) { /* silent fail for geocoding */ }
            } else {
                setProviders(fetchedProviders);
                setFallbackCenter(null);
            }
        } catch { /* handled by useApi */ }
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        fetchProviders(searchArea.trim());
    };

    const fetchBookings = async () => {
        try {
            const data = await callBookings('GET', '/bookings/my');
            setBookings(data.bookings || []);
        } catch { /* handled by useApi */ }
    };

    const fetchCategories = async () => {
        try {
            const data = await callApi('GET', '/categories');
            setCategories(data.categories || []);
        } catch { /* handled by useApi */ }
    };

    const handleUpdateBookingStatus = async (bookingId, status) => {
        try {
            await callBookings('PATCH', `/bookings/${bookingId}/status`, { status });
            fetchBookings();
        } catch { /* handled */ }
    };

    const filteredProviders = selectedCategory
        ? providers.filter(p => p.category?._id === selectedCategory)
        : providers;

    // Only show providers that have valid coordinates
    const mappableProviders = filteredProviders.filter(
        p => p.location?.coordinates?.length === 2
    );

    // Auto-center map when providers change
    const MapUpdater = ({ markers, fallback }) => {
        const map = useMap();
        useEffect(() => {
            if (fallback) {
                map.setView(fallback, 12);
            } else if (markers.length > 0) {
                map.setView([markers[0].location.coordinates[1], markers[0].location.coordinates[0]], 12);
            }
        }, [markers, fallback, map]);
        return null;
    };

    return (
        <main className="customer-dashboard">
            <div className="customer-dashboard__header">
                <div>
                    <h1>Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
                    <p>Find trusted professionals near you</p>
                </div>
                <div className="customer-dashboard__tabs">
                    <button
                        className={`customer-dashboard__tab ${activeTab === 'explore' ? 'active' : ''}`}
                        onClick={() => setActiveTab('explore')}
                    >
                        🗺️ Explore
                    </button>
                    <button
                        className={`customer-dashboard__tab ${activeTab === 'bookings' ? 'active' : ''}`}
                        onClick={() => setActiveTab('bookings')}
                    >
                        📋 My Bookings {bookings.length > 0 && <span className="customer-dashboard__count">{bookings.length}</span>}
                    </button>
                </div>
            </div>

            {activeTab === 'explore' && (
                <div className="customer-dashboard__explore">
                    {/* Search and Filters */}
                    <div className="customer-dashboard__search-bar mb-3">
                        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '10px' }}>
                            <input 
                                type="text" 
                                placeholder="Search by city or area (e.g. Bhubaneswar)..." 
                                value={searchArea}
                                onChange={(e) => {
                                    setSearchArea(e.target.value);
                                    if (e.target.value === '') fetchProviders('');
                                }}
                                style={{ flex: 1, padding: '10px 15px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                            />
                            <button type="submit" className="btn btn-primary" style={{ padding: '10px 20px', borderRadius: '8px', background: '#4f46e5', color: '#fff', border: 'none', cursor: 'pointer' }}>Search</button>
                        </form>
                    </div>

                    <div className="customer-dashboard__filters">
                        <button
                            className={`customer-dashboard__filter ${!selectedCategory ? 'active' : ''}`}
                            onClick={() => setSelectedCategory('')}
                        >All</button>
                        {categories.map(cat => (
                            <button
                                key={cat._id}
                                className={`customer-dashboard__filter ${selectedCategory === cat._id ? 'active' : ''}`}
                                onClick={() => setSelectedCategory(cat._id)}
                            >{cat.name}</button>
                        ))}
                    </div>

                    <div className="customer-dashboard__content">
                        {/* Map */}
                        <div className="customer-dashboard__map">
                            <MapContainer center={mapCenter} zoom={12} scrollWheelZoom={true}>
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                <MapUpdater markers={mappableProviders} fallback={fallbackCenter} />
                                {mappableProviders.map(provider => (
                                    <Marker
                                        key={provider._id}
                                        position={[provider.location.coordinates[1], provider.location.coordinates[0]]}
                                    >
                                        <Popup>
                                            <div className="map-popup">
                                                <strong>{provider.name}</strong>
                                                <p>{provider.category?.name}</p>
                                                {provider.rating > 0 && <p>⭐ {provider.rating} ({provider.reviewCount})</p>}
                                                <button onClick={() => navigate(`/customer/provider/${provider._id}`)}>
                                                    View Services →
                                                </button>
                                            </div>
                                        </Popup>
                                    </Marker>
                                ))}
                            </MapContainer>
                        </div>

                        {/* Provider List */}
                        <div className="customer-dashboard__providers">
                            <h3>Providers {filteredProviders.length > 0 && `(${filteredProviders.length})`}</h3>
                            {loadingProviders ? (
                                <LoadingSpinner size="sm" />
                            ) : filteredProviders.length === 0 ? (
                                <p className="customer-dashboard__empty">No providers found.</p>
                            ) : (
                                <div className="customer-dashboard__provider-list">
                                    {filteredProviders.map(provider => (
                                        <div
                                            key={provider._id}
                                            className="provider-card"
                                            onClick={() => navigate(`/customer/provider/${provider._id}`)}
                                        >
                                            <img
                                                src={provider.logoUrl || DEFAULT_IMAGE}
                                                alt={provider.name}
                                                className="provider-card__avatar"
                                            />
                                            <div className="provider-card__info">
                                                <h4>{provider.name}</h4>
                                                <span className="provider-card__category">{provider.category?.name}</span>
                                                {provider.rating > 0 && (
                                                    <span className="provider-card__rating">⭐ {provider.rating}</span>
                                                )}
                                            </div>
                                            {provider.basePrice > 0 && (
                                                <span className="provider-card__price">from ₹{provider.basePrice}</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'bookings' && (
                <div className="customer-dashboard__bookings">
                    {loadingBookings ? (
                        <LoadingSpinner text="Loading bookings..." />
                    ) : bookings.length === 0 ? (
                        <div className="customer-dashboard__empty-state">
                            <p>📋</p>
                            <h3>No bookings yet</h3>
                            <p>Explore providers and book your first service!</p>
                            <button onClick={() => setActiveTab('explore')} className="customer-dashboard__explore-btn">
                                Explore Providers
                            </button>
                        </div>
                    ) : (
                        bookings.map(booking => (
                            <BookingCard
                                key={booking._id}
                                booking={booking}
                                role="CUSTOMER"
                                onUpdateStatus={handleUpdateBookingStatus}
                                onRefresh={fetchBookings}
                            />
                        ))
                    )}
                </div>
            )}
        </main>
    );
};

export default CustomerDashboard;
