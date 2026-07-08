import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { shopAPI } from '../services/api';
import MapComponent from '../components/MapComponent';
import Toast from '../components/Toast';

const MapView = () => {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [route, setRoute] = useState(null);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchShops();
    getUserLocation();
  }, []);

  const fetchShops = async () => {
    try {
      const res = await shopAPI.getAll();
      setShops(res.data);
    } catch (err) {
      console.error('Failed to load shops:', err);
    } finally {
      setLoading(false);
    }
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => {}
      );
    }
  };

  const handleGetDirections = async (shop) => {
    if (!userLocation) {
      setToast({ message: 'Enable location or use the Home page to enter an address.', type: 'info' });
      return;
    }

    try {
      const res = await shopAPI.getDirections({
        startLat: userLocation.lat,
        startLng: userLocation.lng,
        endLat: shop.location.coordinates[1],
        endLng: shop.location.coordinates[0],
      });
      setRoute(res.data);
    } catch (err) {
      setToast({
        message: err.response?.data?.message || 'Could not get directions',
        type: 'error',
      });
    }
  };

  if (loading) {
    return (
      <div className="loading-page">
        <div className="spinner"></div>
        <p>Loading map...</p>
      </div>
    );
  }

  return (
    <div style={{ height: 'calc(100vh - 130px)', position: 'relative' }}>
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      {route && (
        <div
          style={{
            position: 'absolute',
            top: '16px',
            left: '16px',
            zIndex: 1000,
            background: 'white',
            padding: '12px 20px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            display: 'flex',
            gap: '24px',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ fontWeight: 700, color: '#D97706' }}>
              {(route.distance / 1000).toFixed(1)} km
            </div>
            <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>Distance</div>
          </div>
          <div>
            <div style={{ fontWeight: 700, color: '#D97706' }}>
              {Math.round(route.duration / 60)} min
            </div>
            <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>Duration</div>
          </div>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setRoute(null)}
          >
            ✕
          </button>
        </div>
      )}

      <MapComponent
        shops={shops}
        route={route}
        userLocation={userLocation}
        onShopClick={(shop) => navigate(`/shops/${shop._id}`)}
        onGetDirections={handleGetDirections}
        height="100%"
      />
    </div>
  );
};

export default MapView;
