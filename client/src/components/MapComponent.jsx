import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import StarRating from './StarRating';

// Fix default marker icon (Leaflet + Vite bundler issue)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom chai marker icon
const chaiIcon = new L.DivIcon({
  className: 'custom-marker',
  html: '<div class="marker-pin"></div>',
  iconSize: [30, 42],
  iconAnchor: [15, 42],
  popupAnchor: [0, -40],
});

// User location marker
const userIcon = new L.DivIcon({
  className: 'custom-marker',
  html: '<div style="width:16px;height:16px;background:#3B82F6;border:3px solid white;border-radius:50%;box-shadow:0 0 10px rgba(59,130,246,0.5);"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

// Auto-fit bounds when shops change
const FitBounds = ({ shops }) => {
  const map = useMap();

  useEffect(() => {
    if (shops && shops.length > 0) {
      const bounds = L.latLngBounds(
        shops.map((s) => [
          s.location.coordinates[1],
          s.location.coordinates[0],
        ])
      );
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [shops, map]);

  return null;
};

const MapComponent = ({
  shops = [],
  route = null,
  userLocation = null,
  onShopClick,
  onGetDirections,
  selectedShopId = null,
  height = '100%',
}) => {
  // Default center (India - Bangalore)
  const defaultCenter = [12.9716, 77.5946];
  const center =
    shops.length > 0
      ? [shops[0].location.coordinates[1], shops[0].location.coordinates[0]]
      : userLocation
      ? [userLocation.lat, userLocation.lng]
      : defaultCenter;

  return (
    <div className="map-container" style={{ height }}>
      <MapContainer
        center={center}
        zoom={13}
        style={{ width: '100%', height: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FitBounds shops={shops} />

        {/* Shop markers */}
        {shops.map((shop) => (
          <Marker
            key={shop._id}
            position={[
              shop.location.coordinates[1],
              shop.location.coordinates[0],
            ]}
            icon={chaiIcon}
            eventHandlers={{
              click: () => onShopClick?.(shop),
            }}
          >
            <Popup>
              <div className="map-popup">
                <h3>{shop.name}</h3>
                <div className="popup-meta">
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <StarRating rating={Math.round(shop.averageRating)} size="0.85rem" />
                    <strong>{shop.averageRating?.toFixed(1) || '0.0'}</strong>
                    <span>({shop.reviewCount || 0})</span>
                  </span>
                </div>
                <p style={{ fontSize: '0.8rem', color: '#6B7280', marginBottom: '8px' }}>
                  {shop.address}
                </p>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onGetDirections?.(shop);
                    }}
                  >
                    🧭 Get Directions
                  </button>
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onShopClick?.(shop);
                    }}
                  >
                    View
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* User location marker */}
        {userLocation && (
          <Marker
            position={[userLocation.lat, userLocation.lng]}
            icon={userIcon}
          >
            <Popup>
              <div className="map-popup">
                <h3>📍 Your Location</h3>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Route polyline */}
        {route && route.geometry && (
          <GeoJSON
            key={JSON.stringify(route.geometry)}
            data={route.geometry}
            style={{
              color: '#D97706',
              weight: 5,
              opacity: 0.8,
              dashArray: '10, 6',
            }}
          />
        )}
      </MapContainer>
    </div>
  );
};

export default MapComponent;
