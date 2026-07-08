import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { shopAPI } from '../services/api';
import MapComponent from '../components/MapComponent';
import ShopCard from '../components/ShopCard';
import Toast from '../components/Toast';

const Home = () => {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [route, setRoute] = useState(null);
  const [directionsShop, setDirectionsShop] = useState(null);
  const [startAddress, setStartAddress] = useState('');
  const [directionsLoading, setDirectionsLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [sortBy, setSortBy] = useState('newest');
  const navigate = useNavigate();

  useEffect(() => {
    fetchShops();
    getUserLocation();
  }, []);

  const fetchShops = async () => {
    try {
      const res = await shopAPI.getAll({ sortBy });
      setShops(res.data);
    } catch (err) {
      setError('Failed to load shops');
    } finally {
      setLoading(false);
    }
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        () => {
          // Geolocation failed — that's fine, user can enter address
          console.log('Geolocation not available');
        }
      );
    }
  };

  const handleGetDirections = async (shop) => {
    setDirectionsShop(shop);
    setRoute(null);

    // If we have user location, get directions automatically
    if (userLocation) {
      await fetchDirections(shop, userLocation.lat, userLocation.lng);
    }
  };

  const fetchDirections = async (shop, sLat, sLng) => {
    setDirectionsLoading(true);
    try {
      const res = await shopAPI.getDirections({
        startLat: sLat,
        startLng: sLng,
        endLat: shop.location.coordinates[1],
        endLng: shop.location.coordinates[0],
      });
      setRoute(res.data);
    } catch (err) {
      setToast({
        message: err.response?.data?.message || 'Could not get directions',
        type: 'error',
      });
    } finally {
      setDirectionsLoading(false);
    }
  };

  const handleDirectionsFromAddress = async () => {
    if (!startAddress.trim() || !directionsShop) return;
    setDirectionsLoading(true);
    try {
      const res = await shopAPI.getDirections({
        startAddress: startAddress.trim(),
        endLat: directionsShop.location.coordinates[1],
        endLng: directionsShop.location.coordinates[0],
      });
      setRoute(res.data);
    } catch (err) {
      setToast({
        message: err.response?.data?.message || 'Could not get directions from this address',
        type: 'error',
      });
    } finally {
      setDirectionsLoading(false);
    }
  };

  const formatDistance = (meters) => {
    if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`;
    return `${Math.round(meters)} m`;
  };

  const formatDuration = (seconds) => {
    if (seconds >= 3600) {
      const h = Math.floor(seconds / 3600);
      const m = Math.round((seconds % 3600) / 60);
      return `${h}h ${m}m`;
    }
    return `${Math.round(seconds / 60)} min`;
  };

  if (loading) {
    return (
      <div className="loading-page">
        <div className="spinner"></div>
        <p>Loading chai shops...</p>
      </div>
    );
  }

  return (
    <div>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="home-layout">
        {/* Map */}
        <div className="home-map">
          <MapComponent
            shops={shops}
            route={route}
            userLocation={userLocation}
            onShopClick={(shop) => navigate(`/shops/${shop._id}`)}
            onGetDirections={handleGetDirections}
          />
        </div>

        {/* Shop list sidebar */}
        <div className="home-sidebar">
          <div className="home-sidebar-header">
            <h3>Nearby Shops</h3>
            <select
              className="form-select"
              style={{ width: 'auto', padding: '6px 12px', fontSize: '0.8rem' }}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Newest</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>

          {/* Directions panel */}
          {directionsShop && (
            <div className="directions-panel" style={{ marginBottom: '16px' }}>
              <h3>
                🧭 Directions to {directionsShop.name}
                <button
                  className="btn btn-ghost btn-sm"
                  style={{ marginLeft: 'auto' }}
                  onClick={() => {
                    setDirectionsShop(null);
                    setRoute(null);
                  }}
                >
                  ✕
                </button>
              </h3>

              <div className="form-group" style={{ marginBottom: '12px', marginTop: '12px' }}>
                <label className="form-label" style={{ fontSize: '0.8rem' }}>From</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder={
                      userLocation
                        ? 'Using your location (or enter address)'
                        : 'Enter start address'
                    }
                    value={startAddress}
                    onChange={(e) => setStartAddress(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleDirectionsFromAddress()}
                    style={{ fontSize: '0.85rem', padding: '8px 12px' }}
                  />
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={handleDirectionsFromAddress}
                    disabled={directionsLoading || !startAddress.trim()}
                  >
                    {directionsLoading ? '...' : 'Go'}
                  </button>
                </div>
                {userLocation && !startAddress && (
                  <button
                    className="btn btn-outline btn-sm"
                    style={{ marginTop: '8px', width: '100%' }}
                    onClick={() => fetchDirections(directionsShop, userLocation.lat, userLocation.lng)}
                    disabled={directionsLoading}
                  >
                    📍 Use My Location
                  </button>
                )}
              </div>

              <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>
                <strong>To:</strong> {directionsShop.address}
              </div>

              {route && (
                <div className="directions-route-info">
                  <div>
                    <div className="value">{formatDistance(route.distance)}</div>
                    <div className="label">Distance</div>
                  </div>
                  <div>
                    <div className="value">{formatDuration(route.duration)}</div>
                    <div className="label">Duration</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Shop list */}
          <div className="shop-list">
            {shops.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">☕</div>
                <h3>No shops yet</h3>
                <p>Be the first to add a chai shop!</p>
                <button
                  className="btn btn-primary"
                  onClick={() => navigate('/shops/add')}
                >
                  + Add Shop
                </button>
              </div>
            ) : (
              shops.map((shop) => (
                <ShopCard
                  key={shop._id}
                  shop={shop}
                  onClick={(s) => navigate(`/shops/${s._id}`)}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
