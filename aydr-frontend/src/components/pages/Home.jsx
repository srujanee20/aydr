import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

const Home = () => {
  const [searchArea, setSearchArea] = useState('');
  
  // Default map center set to Bhubaneswar coordinates
  const mapCenter = [20.2961, 85.8245];

  const handleSearch = (e) => {
    e.preventDefault();
    console.log("Searching Aydr for pros in:", searchArea);
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
              placeholder="Enter your neighborhood or city..." 
              value={searchArea}
              onChange={(e) => setSearchArea(e.target.value)}
            />
            <button type="submit">Search</button>
          </form>
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
            {/* Future provider markers will be mapped here */}
          </MapContainer>
        </div>
      </section>
    </main>
  );
};

export default Home;