import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useAuth } from '../../context/AuthContext';
import useApi from '../../hooks/useApi';

const Home = () => {
    const navigate = useNavigate();
    const { isAuthenticated, isProvider } = useAuth();
    const [,, , call] = useApi();

    const [searchArea, setSearchArea] = useState('');
    const [providers, setProviders] = useState([]);
    const [fallbackCenter, setFallbackCenter] = useState(null);

    const mapCenter = [20.2961, 85.8245];

    useEffect(() => {
        fetchProviders();
    }, []);

    const fetchProviders = async (searchTerm = '') => {
        try {
            const url = searchTerm ? `/providers?search=${encodeURIComponent(searchTerm)}` : '/providers';
            const data = await call('GET', url);
            const fetchedProviders = data.providers || [];
            
            if (fetchedProviders.length === 0 && searchTerm) {
                try {
                    // 1. Get coordinates for the searched area
                    const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchTerm)}`);
                    const geoData = await geoRes.json();
                    if (geoData && geoData.length > 0) {
                        setFallbackCenter([parseFloat(geoData[0].lat), parseFloat(geoData[0].lon)]);
                    }
                    
                    // 2. Fetch ALL providers so the map isn't completely empty
                    const allData = await call('GET', '/providers');
                    setProviders((allData.providers || []).filter(
                        p => p.location?.coordinates?.length === 2
                    ));
                } catch (err) { /* silent fail for geocoding */ }
            } else {
                setProviders(fetchedProviders.filter(
                    p => p.location?.coordinates?.length === 2
                ));
                setFallbackCenter(null);
            }
        } catch { /* silent */ }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchProviders(searchArea.trim());
    };

    const handleGetStarted = () => {
        if (isAuthenticated) {
            navigate(isProvider ? '/provider/dashboard' : '/customer/dashboard');
        } else {
            navigate('/register');
        }
    };

    // Auto-center map when providers change or fallback location is set
    const MapUpdater = ({ markers, fallback }) => {
        const map = useMap();
        useEffect(() => {
            if (fallback) {
                map.setView(fallback, 13);
            } else if (markers.length > 0) {
                map.setView([markers[0].location.coordinates[1], markers[0].location.coordinates[0]], 13);
            }
        }, [markers, fallback, map]);
        return null;
    };

    return (
        <main className="home-page">
            <section className="home-page__hero">
                <div className="home-page__hero-content">
                    <h1 className="home-page__title">Expert help, right around the corner.</h1>
                    <p className="home-page__subtitle">Find trusted local professionals for any job on Aydr.</p>

                    <form className="home-page__search-bar" onSubmit={handleSearch}>
                        <input
                            type="text"
                            placeholder="Search by neighborhood or city..."
                            value={searchArea}
                            onChange={(e) => setSearchArea(e.target.value)}
                        />
                        <button type="submit">Search</button>
                    </form>

                    <button className="home-page__cta-btn" onClick={handleGetStarted}>
                        {isAuthenticated ? 'Go to Dashboard' : 'Get Started'}
                    </button>
                </div>
            </section>

            <section className="home-page__discovery">
                <h2>Available Pros Near You</h2>
                <p>Browse local experts ready to work.</p>

                <div className="home-page__map-wrapper">
                    <MapContainer center={mapCenter} zoom={13} scrollWheelZoom={false}>
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <MapUpdater markers={providers} fallback={fallbackCenter} />
                        {providers.map(provider => (
                            <Marker
                                key={provider._id}
                                position={[provider.location.coordinates[1], provider.location.coordinates[0]]}
                            >
                                <Popup>
                                    <div className="map-popup">
                                        <strong>{provider.name}</strong>
                                        <p>{provider.category?.name}</p>
                                        {provider.rating > 0 && <p>⭐ {provider.rating}</p>}
                                        <button onClick={() => navigate(`/customer/provider/${provider._id}`)}>
                                            View Services →
                                        </button>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                </div>
            </section>
        </main>
    );
};

export default Home;