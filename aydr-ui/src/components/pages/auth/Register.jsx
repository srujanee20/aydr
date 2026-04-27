import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import useApi from '../../../hooks/useApi';

// Leaflet click handler component
const LocationPicker = ({ onLocationSelect }) => {
    useMapEvents({
        click(e) {
            onLocationSelect([e.latlng.lng, e.latlng.lat]); // [lng, lat] for GeoJSON
        },
    });
    return null;
};

const Register = () => {
    const navigate = useNavigate();
    const [,, loading, call] = useApi();
    const [categories, setCategories] = useState([]);

    const [isProvider, setIsProvider] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Customer fields
    const [customerData, setCustomerData] = useState({
        name: '', email: '', password: '', phone: ''
    });

    // Provider fields
    const [providerData, setProviderData] = useState({
        userName: '', email: '', password: '', providerName: '',
        category: '', phone: '', address: ''
    });
    const [coordinates, setCoordinates] = useState(null); // [lng, lat]

    // Fetch categories on mount
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await call('GET', '/categories');
                setCategories(data.categories || []);
            } catch {
                // Categories will just be empty
            }
        };
        fetchCategories();
    }, []);

    const handleCustomerChange = (e) => {
        setCustomerData({ ...customerData, [e.target.name]: e.target.value });
    };

    const handleProviderChange = (e) => {
        setProviderData({ ...providerData, [e.target.name]: e.target.value });
    };

    const handleToggle = (isProv) => {
        setIsProvider(isProv);
        setErrorMessage('');
        setSuccessMessage('');
    };

    const handleLocationSelect = useCallback((coords) => {
        setCoordinates(coords);
    }, []);

    const handleCustomerSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');

        try {
        const payload = { ...customerData };
            if (!payload.phone) delete payload.phone;

            await call('POST', '/auth/register/customer', payload);
            setSuccessMessage('Account created! Redirecting to login...');
            setTimeout(() => navigate('/login'), 1500);
        } catch (err) {
            setErrorMessage(err.response?.data?.message || err.response?.data?.error || 'Registration failed.');
        }
    };

    const handleProviderSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');

        if (!coordinates) {
            setErrorMessage('Please click on the map to set your business location.');
            return;
        }

        const selectedCategoryName = providerData.category.trim();
        const matchedCategory = categories.find(c => c.name.toLowerCase() === selectedCategoryName.toLowerCase());

        const payload = {
            userName: providerData.userName,
            email: providerData.email,
            password: providerData.password,
            providerName: providerData.providerName,
            category: matchedCategory ? matchedCategory._id : null,
            customCategory: matchedCategory ? null : selectedCategoryName,
            phone: providerData.phone,
            location: {
                type: 'Point',
                coordinates: coordinates,
                address: providerData.address
            }
        };

        try {
            await call('POST', '/auth/register/provider', payload);
            setSuccessMessage('Provider account created! An admin will review your profile before you can log in.');
            setTimeout(() => navigate('/login'), 2500);
        } catch (err) {
            setErrorMessage(err.response?.data?.message || err.response?.data?.error || 'Registration failed.');
        }
    };

    const mapCenter = [20.2961, 85.8245]; // Bhubaneswar default

    return (
        <main className="auth-page">
            <div className={`auth-container auth-container--register ${isProvider ? 'provider-active' : ''}`}>

                {/* LEFT: Provider Registration */}
                <div className="form-container provider-container">
                    <form className="auth-form auth-form--scrollable" onSubmit={handleProviderSubmit}>
                        <div className="auth-form__icon">🔧</div>
                        <h2>Become a Provider</h2>
                        <p className="auth-form__subtitle">Join and start offering services</p>

                        {errorMessage && isProvider && <div className="auth-form__error">{errorMessage}</div>}
                        {successMessage && isProvider && <div className="auth-form__success">{successMessage}</div>}

                        <input type="text" name="userName" value={providerData.userName} onChange={handleProviderChange} placeholder="Your Full Name" required />
                        <input type="email" name="email" value={providerData.email} onChange={handleProviderChange} placeholder="Email Address" required />
                        <input type="password" name="password" value={providerData.password} onChange={handleProviderChange} placeholder="Password (min 6 chars)" required minLength={6} />
                        <input type="text" name="providerName" value={providerData.providerName} onChange={handleProviderChange} placeholder="Business / Service Name" required />

                        <input
                            type="text"
                            name="category"
                            list="category-options"
                            value={providerData.category}
                            onChange={handleProviderChange}
                            placeholder="Select or type a category"
                            required
                        />
                        <datalist id="category-options">
                            {categories.map(cat => (
                                <option key={cat._id} value={cat.name} />
                            ))}
                        </datalist>

                        <input type="tel" name="phone" value={providerData.phone} onChange={handleProviderChange} placeholder="Phone Number" required minLength={10} maxLength={15} />
                        <input type="text" name="address" value={providerData.address} onChange={handleProviderChange} placeholder="Business Address" required />

                        {/* Leaflet Minimap */}
                        <div className="auth-form__map-section">
                            <label className="auth-form__map-label">
                                📍 Click on the map to set your location
                                {coordinates && <span className="auth-form__map-set"> ✓ Location set</span>}
                            </label>
                            <div className="auth-form__minimap">
                                <MapContainer center={mapCenter} zoom={12} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
                                    <TileLayer
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    />
                                    <LocationPicker onLocationSelect={handleLocationSelect} />
                                    {coordinates && (
                                        <Marker position={[coordinates[1], coordinates[0]]} />
                                    )}
                                </MapContainer>
                            </div>
                        </div>

                        <button type="submit" className="auth-form__btn" disabled={loading}>
                            {loading && isProvider ? 'Creating Account...' : 'Sign Up as Provider'}
                        </button>
                        <p className="auth-form__link">Already have an account? <Link to="/login">Log In</Link></p>
                    </form>
                </div>

                {/* RIGHT: Customer Registration */}
                <div className="form-container customer-container">
                    <form className="auth-form" onSubmit={handleCustomerSubmit}>
                        <div className="auth-form__icon">🏠</div>
                        <h2>Join as a Customer</h2>
                        <p className="auth-form__subtitle">Find trusted providers near you</p>

                        {errorMessage && !isProvider && <div className="auth-form__error">{errorMessage}</div>}
                        {successMessage && !isProvider && <div className="auth-form__success">{successMessage}</div>}

                        <input type="text" name="name" value={customerData.name} onChange={handleCustomerChange} placeholder="Full Name" required />
                        <input type="email" name="email" value={customerData.email} onChange={handleCustomerChange} placeholder="Email Address" required />
                        <input type="password" name="password" value={customerData.password} onChange={handleCustomerChange} placeholder="Password (min 6 chars)" required minLength={6} />
                        <input type="tel" name="phone" value={customerData.phone} onChange={handleCustomerChange} placeholder="Phone Number (optional)" />

                        <button type="submit" className="auth-form__btn" disabled={loading}>
                            {loading && !isProvider ? 'Creating Account...' : 'Sign Up as Customer'}
                        </button>
                        <p className="auth-form__link">Already have an account? <Link to="/login">Log In</Link></p>
                    </form>
                </div>

                {/* Sliding Overlay */}
                <div className="overlay-container">
                    <div className="overlay">
                        <div className="overlay-panel overlay-left">
                            <h2>Are you a Provider?</h2>
                            <p>Join our platform to offer your services and grow your business locally.</p>
                            <button type="button" className="ghost-btn" onClick={() => handleToggle(true)}>
                                Sign Up as Provider →
                            </button>
                        </div>
                        <div className="overlay-panel overlay-right">
                            <h2>Looking for Services?</h2>
                            <p>Sign up as a customer to find trusted professionals near you.</p>
                            <button type="button" className="ghost-btn" onClick={() => handleToggle(false)}>
                                Sign Up as Customer →
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default Register;