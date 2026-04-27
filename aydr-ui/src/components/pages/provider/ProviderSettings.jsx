import { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { useAuth } from '../../../context/AuthContext';
import useApi from '../../../hooks/useApi';
import ProgressBar from '../../common/ProgressBar';
import AvatarUpload from '../../common/AvatarUpload';
import Modal from '../../common/Modal';
import LoadingSpinner from '../../common/LoadingSpinner';

const DEFAULT_AVATAR = '/images/avatar-default.png';

const LocationPicker = ({ onLocationSelect }) => {
    useMapEvents({ click(e) { onLocationSelect([e.latlng.lng, e.latlng.lat]); } });
    return null;
};

const ProviderSettings = () => {
    const { user, refreshUser } = useAuth();
    const [,, loading, call] = useApi();

    const [provider, setProvider] = useState(null);
    const [services, setServices] = useState([]);
    const [message, setMessage] = useState({ type: '', text: '' });

    // ─── User Profile form (personal account) ───
    const [userForm, setUserForm] = useState({ name: '', email: '', phone: '', profilePic: '' });

    // ─── Business Profile form (brand) ───
    const [businessForm, setBusinessForm] = useState({
        name: '', bio: '', email: '', phone: '', basePrice: '', isAvailable: false
    });

    // Location form
    const [locationForm, setLocationForm] = useState({ address: '' });
    const [coordinates, setCoordinates] = useState(null);
    const [browserCenter, setBrowserCenter] = useState(null); // from Geolocation API

    // Add / Edit Service modal
    const [showServiceModal, setShowServiceModal] = useState(false);
    const [editingService, setEditingService] = useState(null); // null = create mode, object = edit mode
    const EMPTY_SERVICE_FORM = { name: '', description: '', price: '', duration: '', primaryImage: '', images: '', availabilityType: '24_7', days: [], startTime: '', endTime: '' };
    const [serviceForm, setServiceForm] = useState(EMPTY_SERVICE_FORM);

    useEffect(() => {
        fetchData();
    }, [user]);

    const fetchData = async () => {
        if (!user?.providerId) return;
        const pid = typeof user.providerId === 'object' ? user.providerId._id : user.providerId;
        try {
            const [provData, svcData] = await Promise.all([
                call('GET', `/providers/${pid}`),
                call('GET', `/services/provider/${pid}`)
            ]);
            const p = provData.provider;
            setProvider(p);
            setServices(svcData.services || []);

            // Populate user form from auth context
            setUserForm({
                name: user.name || '', email: user.email || '', phone: user.phone || '', profilePic: user.profilePic || ''
            });

            // Populate business form from provider data
            setBusinessForm({
                name: p.name || '', bio: p.bio || '', email: p.email || '',
                phone: p.phone || '', basePrice: p.basePrice || '',
                isAvailable: p.isAvailable || false
            });

            if (p.location?.coordinates) {
                setCoordinates(p.location.coordinates);
                setLocationForm({ address: p.location.address || '' });
            }
        } catch { /* handled */ }
    };

    // Try browser geolocation once provider loads and no saved coordinates exist
    useEffect(() => {
        if (!provider || coordinates) return;
        if (!navigator.geolocation) return;
        navigator.geolocation.getCurrentPosition(
            (pos) => setBrowserCenter([pos.coords.latitude, pos.coords.longitude]),
            () => { /* denied or unavailable — world-view fallback handled in render */ },
            { timeout: 5000, maximumAge: 60000 }
        );
    }, [provider, coordinates]);

    const pid = provider?._id;

    // ─── User Profile Update (personal account info) ───
    const handleUserSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });
        try {
            await call('PUT', `/users/${user._id}`, {
                name: userForm.name,
                phone: userForm.phone
            });
            await refreshUser();
            setMessage({ type: 'success', text: 'Personal profile updated!' });
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Update failed.' });
        }
    };

    // ─── Business Profile Update (brand info) ───
    const handleBusinessSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });
        try {
            await call('PUT', `/providers/${pid}`, {
                name: businessForm.name,
                bio: businessForm.bio,
                email: businessForm.email,
                phone: businessForm.phone,
                basePrice: Number(businessForm.basePrice) || 0,
                isAvailable: businessForm.isAvailable
            });
            setMessage({ type: 'success', text: 'Business profile updated!' });
            fetchData();
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Update failed.' });
        }
    };

    // ─── Location Update (triggers re-verification) ───
    const handleLocationSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });
        if (!coordinates) {
            setMessage({ type: 'error', text: 'Please click on the map to set location.' });
            return;
        }
        try {
            await call('PUT', `/providers/${pid}`, {
                location: { type: 'Point', coordinates, address: locationForm.address }
            });
            setMessage({ type: 'success', text: 'Location updated! This will require re-verification by admin.' });
            fetchData();
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Update failed.' });
        }
    };

    const handleLocationSelect = useCallback((coords) => { setCoordinates(coords); }, []);

    // ─── Add / Update Service ───
    const handleAddService = async (e) => {
        e.preventDefault();
        const categoryId = provider?.category?._id || provider?.category;
        const imagesArray = serviceForm.images
            ? serviceForm.images.split(',').map(s => s.trim()).filter(Boolean)
            : [];

        // Build availability object based on selected type
        const availability = { is24x7: serviceForm.availabilityType === '24_7' };
        if (!availability.is24x7) {
            const scheduleItem = {};
            if (serviceForm.availabilityType === 'DAYS_ALL_HOURS') {
                scheduleItem.days = serviceForm.days;
                scheduleItem.isAllDay = true;
            } else if (serviceForm.availabilityType === 'HOURS_ALL_DAYS') {
                scheduleItem.days = ['ALL_DAYS'];
                scheduleItem.isAllDay = false;
                scheduleItem.startTime = serviceForm.startTime;
                scheduleItem.endTime = serviceForm.endTime;
            } else if (serviceForm.availabilityType === 'DAYS_AND_HOURS') {
                scheduleItem.days = serviceForm.days;
                scheduleItem.isAllDay = false;
                scheduleItem.startTime = serviceForm.startTime;
                scheduleItem.endTime = serviceForm.endTime;
            }
            availability.schedule = [scheduleItem];
        }

        const payload = {
            name: serviceForm.name,
            description: serviceForm.description,
            price: Number(serviceForm.price),
            duration: serviceForm.duration ? Number(serviceForm.duration) : undefined,
            primaryImage: serviceForm.primaryImage || undefined,
            images: imagesArray.length > 0 ? imagesArray : undefined,
            availability
        };

        try {
            if (editingService) {
                // UPDATE existing service
                await call('PUT', `/services/${editingService._id}`, payload);
            } else {
                // CREATE new service
                await call('POST', '/services', {
                    ...payload,
                    providerId: pid,
                    categoryId,
                });
            }
            setShowServiceModal(false);
            setEditingService(null);
            setServiceForm(EMPTY_SERVICE_FORM);
            fetchData();
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to save service.' });
        }
    };

    // ─── Open modal in Edit mode pre-filled with existing service data ───
    const openEditModal = (svc) => {
        // Reverse-engineer availabilityType from stored availability object
        let availabilityType = '24_7';
        let days = [];
        let startTime = '';
        let endTime = '';
        if (!svc.availability?.is24x7 && svc.availability?.schedule?.length > 0) {
            const s = svc.availability.schedule[0];
            const isAllDays = s.days?.includes('ALL_DAYS');
            if (s.isAllDay) availabilityType = 'DAYS_ALL_HOURS';
            else if (isAllDays) availabilityType = 'HOURS_ALL_DAYS';
            else availabilityType = 'DAYS_AND_HOURS';
            days = s.days?.filter(d => d !== 'ALL_DAYS') || [];
            startTime = s.startTime || '';
            endTime = s.endTime || '';
        }
        setEditingService(svc);
        setServiceForm({
            name: svc.name || '',
            description: svc.description || '',
            price: svc.price || '',
            duration: svc.duration || '',
            primaryImage: svc.primaryImage || '',
            images: (svc.images || []).join(', '),
            availabilityType,
            days,
            startTime,
            endTime
        });
        setShowServiceModal(true);
    };

    // ─── Logo / Banner Upload ───
    const handleLogoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const form = new FormData();
        form.append('image', file);
        form.append('folder', 'logos');
        try {
            const data = await call('POST', '/uploads/single', form);
            await call('PUT', `/providers/${pid}`, { logoUrl: data.url });
            fetchData();
        } catch { setMessage({ type: 'error', text: 'Upload failed.' }); }
    };



    if (!provider) return <LoadingSpinner size="lg" text="Loading settings..." />;

    const setup = provider.profileSetup || {};
    // Priority: saved provider coords → browser geolocation → world view
    const mapCenter = coordinates
        ? [coordinates[1], coordinates[0]]
        : browserCenter ?? [20, 0];
    const mapZoom = (coordinates || browserCenter) ? 13 : 2;

    return (
        <main className="prov-settings">
            <h1>Provider Settings</h1>
            <p className="prov-settings__subtitle">Manage your personal account, business brand, and services</p>

            {message.text && (
                <div className={`prov-settings__message prov-settings__message--${message.type}`}>
                    {message.text}
                </div>
            )}

            {/* ─── Progress Bars ─── */}
            <section className="prov-settings__section">
                <h2>Setup Progress</h2>
                <div className="prov-settings__progress">
                    <ProgressBar label="Branding" status={setup.branding?.status} message={setup.branding?.adminMessage} />
                    <ProgressBar label="Location" status={setup.location?.status} message={setup.location?.adminMessage} />
                    <ProgressBar label="Pricing" status={setup.pricing?.status} message={setup.pricing?.adminMessage} />
                    <ProgressBar label="Category" status={setup.category?.status} message={setup.category?.adminMessage} />
                </div>
            </section>

            {/* ─── User Profile (personal account) ─── */}
            <section className="prov-settings__section">
                <h2>User Profile</h2>
                <p className="prov-settings__section-desc">Your personal account information. Not visible to customers.</p>
                
                {/* User Profile Avatar Section */}
                <AvatarUpload 
                    currentImage={userForm.profilePic}
                    onUploadSuccess={async (url) => {
                        await call('PUT', `/users/${user._id}`, { profilePic: url });
                        setUserForm(prev => ({ ...prev, profilePic: url }));
                        await refreshUser();
                        setMessage({ type: 'success', text: 'Profile picture updated!' });
                    }}
                />
                <form className="prov-settings__form" onSubmit={handleUserSubmit}>
                    <label>
                        <span>Full Name</span>
                        <input type="text" value={userForm.name} onChange={e => setUserForm({ ...userForm, name: e.target.value })} maxLength={50} />
                    </label>
                    <label>
                        <span>Email (login)</span>
                        <input type="email" value={userForm.email} disabled />
                    </label>
                    <label>
                        <span>Phone</span>
                        <input type="tel" value={userForm.phone} onChange={e => setUserForm({ ...userForm, phone: e.target.value })} />
                    </label>
                    <button type="submit" disabled={loading}>Save User Profile</button>
                </form>
            </section>

            {/* ─── Business Profile (brand) ─── */}
            <section className="prov-settings__section">
                <h2>Business Profile</h2>
                <p className="prov-settings__section-desc">Your brand information visible to customers.</p>

                <div className="prov-settings__banner-section" style={{ marginBottom: '2rem' }}>
                    <div className="prov-settings__banner-wrapper" style={{ position: 'relative', width: '100%', height: '200px', borderRadius: '1rem', overflow: 'hidden', background: 'var(--surface-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)' }}>
                        {provider.logoUrl ? (
                            <img src={provider.logoUrl} alt={provider.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <span style={{ color: 'var(--text-secondary)' }}>No Business Banner Set</span>
                        )}
                        <label style={{ position: 'absolute', bottom: '1rem', right: '1rem', background: 'rgba(0,0,0,0.7)', color: 'white', padding: '0.5rem 1rem', borderRadius: '2rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                            📷 Upload Banner
                            <input type="file" accept="image/*" onChange={handleLogoUpload} hidden />
                        </label>
                    </div>
                </div>

                <form className="prov-settings__form" onSubmit={handleBusinessSubmit}>
                    <label>
                        <span>Business Name</span>
                        <input type="text" value={businessForm.name} onChange={e => setBusinessForm({ ...businessForm, name: e.target.value })} maxLength={100} />
                    </label>
                    <label>
                        <span>Bio / Description</span>
                        <textarea value={businessForm.bio} onChange={e => setBusinessForm({ ...businessForm, bio: e.target.value })} maxLength={500} rows={3} placeholder="Tell customers about your business..." />
                    </label>
                    <label>
                        <span>Business Email</span>
                        <input type="email" value={businessForm.email} onChange={e => setBusinessForm({ ...businessForm, email: e.target.value })} />
                    </label>
                    <label>
                        <span>Business Phone</span>
                        <input type="tel" value={businessForm.phone} onChange={e => setBusinessForm({ ...businessForm, phone: e.target.value })} />
                    </label>
                    <label>
                        <span>Base Price (₹)</span>
                        <input type="number" value={businessForm.basePrice} onChange={e => setBusinessForm({ ...businessForm, basePrice: e.target.value })} min="0" />
                    </label>
                    <label className="prov-settings__toggle">
                        <span>Available for bookings</span>
                        <input type="checkbox" checked={businessForm.isAvailable} onChange={e => setBusinessForm({ ...businessForm, isAvailable: e.target.checked })} />
                    </label>
                    <button type="submit" disabled={loading}>Save Business Profile</button>
                </form>
            </section>

            {/* ─── Location ─── */}
            <section className="prov-settings__section">
                <h2>Location <small>(updates require re-verification)</small></h2>
                <form className="prov-settings__form" onSubmit={handleLocationSubmit}>
                    <label>
                        <span>Address</span>
                        <input type="text" value={locationForm.address} onChange={e => setLocationForm({ ...locationForm, address: e.target.value })} required />
                    </label>
                    <div className="prov-settings__minimap">
                        <MapContainer
                            key={`${mapCenter[0]}-${mapCenter[1]}-${mapZoom}`}
                            center={mapCenter}
                            zoom={mapZoom}
                            scrollWheelZoom={true}
                            style={{ height: '100%', width: '100%' }}
                        >
                            <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                            <LocationPicker onLocationSelect={handleLocationSelect} />
                            {coordinates && <Marker position={[coordinates[1], coordinates[0]]} />}
                        </MapContainer>
                    </div>
                    <button type="submit" disabled={loading}>Update Location</button>
                </form>
            </section>

            {/* ─── Services ─── */}
            <section className="prov-settings__section">
                <div className="prov-settings__section-header">
                    <h2>My Services ({services.length})</h2>
                    <button className="prov-settings__add-btn" onClick={() => { setEditingService(null); setServiceForm(EMPTY_SERVICE_FORM); setShowServiceModal(true); }}>+ Add Service</button>
                </div>
                {services.length === 0 ? (
                    <p className="prov-settings__empty">No services added yet. Add your first service!</p>
                ) : (
                    <div className="prov-settings__services-grid">
                        {services.map(svc => (
                            <div key={svc._id} className="mini-service" onClick={() => openEditModal(svc)} style={{ cursor: 'pointer' }} title="Click to edit">
                                {svc.primaryImage && <img src={svc.primaryImage} alt={svc.name} className="mini-service__image" />}
                                <div className="mini-service__header">
                                    <h4>{svc.name}</h4>
                                    <span>₹{svc.price}</span>
                                </div>
                                <p>{svc.description}</p>
                                <small>
                                    {svc.duration ? `${svc.duration} min · ` : ''}
                                    {svc.availability?.is24x7 ? '24/7' : 'Scheduled'}
                                </small>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* ─── Add / Edit Service Modal ─── */}
            <Modal 
                isOpen={showServiceModal} 
                onClose={() => { setShowServiceModal(false); setEditingService(null); setServiceForm(EMPTY_SERVICE_FORM); }} 
                title={editingService ? `Edit: ${editingService.name}` : 'Add New Service'}
            >
                <form className="booking-form" onSubmit={handleAddService}>
                    <label>
                        <span>Service Name</span>
                        <input type="text" value={serviceForm.name} onChange={e => setServiceForm({ ...serviceForm, name: e.target.value })} required maxLength={100} />
                    </label>
                    <label>
                        <span>Description</span>
                        <textarea value={serviceForm.description} onChange={e => setServiceForm({ ...serviceForm, description: e.target.value })} required maxLength={1000} rows={3} />
                    </label>
                    <label>
                        <span>Price (₹)</span>
                        <input type="number" value={serviceForm.price} onChange={e => setServiceForm({ ...serviceForm, price: e.target.value })} required min="0" />
                    </label>
                    <label>
                        <span>Duration (minutes, optional)</span>
                        <input type="number" value={serviceForm.duration} onChange={e => setServiceForm({ ...serviceForm, duration: e.target.value })} min="1" />
                    </label>
                    <label>
                        <span>Primary Image URL (displayed on card)</span>
                        <input type="url" value={serviceForm.primaryImage} onChange={e => setServiceForm({ ...serviceForm, primaryImage: e.target.value })} placeholder="https://..." />
                    </label>
                    <label>
                        <span>Additional Images (comma-separated URLs)</span>
                        <input type="text" value={serviceForm.images} onChange={e => setServiceForm({ ...serviceForm, images: e.target.value })} placeholder="https://img1.jpg, https://img2.jpg" />
                    </label>
                    <label>
                        <span>Availability Type</span>
                        <select value={serviceForm.availabilityType} onChange={e => setServiceForm({ ...serviceForm, availabilityType: e.target.value })}>
                            <option value="24_7">Available 24/7</option>
                            <option value="DAYS_ALL_HOURS">Certain days, all hours</option>
                            <option value="HOURS_ALL_DAYS">Certain hours, all days</option>
                            <option value="DAYS_AND_HOURS">Certain days and hours</option>
                        </select>
                    </label>

                    {(serviceForm.availabilityType === 'DAYS_ALL_HOURS' || serviceForm.availabilityType === 'DAYS_AND_HOURS') && (
                        <label>
                            <span>Select Days</span>
                            <select 
                                multiple 
                                value={serviceForm.days} 
                                onChange={e => {
                                    const options = [...e.target.selectedOptions];
                                    const values = options.map(opt => opt.value);
                                    setServiceForm({ ...serviceForm, days: values });
                                }}
                                style={{ height: '120px' }}
                            >
                                <option value="MONDAY">Monday</option>
                                <option value="TUESDAY">Tuesday</option>
                                <option value="WEDNESDAY">Wednesday</option>
                                <option value="THURSDAY">Thursday</option>
                                <option value="FRIDAY">Friday</option>
                                <option value="SATURDAY">Saturday</option>
                                <option value="SUNDAY">Sunday</option>
                            </select>
                            <small>Hold Ctrl (or Cmd) to select multiple days</small>
                        </label>
                    )}

                    {(serviceForm.availabilityType === 'HOURS_ALL_DAYS' || serviceForm.availabilityType === 'DAYS_AND_HOURS') && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <label>
                                <span>Start Time (HH:MM)</span>
                                <input type="time" value={serviceForm.startTime} onChange={e => setServiceForm({ ...serviceForm, startTime: e.target.value })} required />
                            </label>
                            <label>
                                <span>End Time (HH:MM)</span>
                                <input type="time" value={serviceForm.endTime} onChange={e => setServiceForm({ ...serviceForm, endTime: e.target.value })} required />
                            </label>
                        </div>
                    )}
                    <button type="submit" className="booking-form__submit" disabled={loading}>
                        {loading ? 'Saving...' : editingService ? 'Save Changes' : 'Add Service'}
                    </button>
                </form>
            </Modal>
        </main>
    );
};

export default ProviderSettings;
