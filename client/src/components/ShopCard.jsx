import StarRating from './StarRating';

const ShopCard = ({ shop, onClick, distance }) => {
  return (
    <div className="shop-card" onClick={() => onClick?.(shop)} id={`shop-card-${shop._id}`}>
      <div className="shop-card-img">
        {shop.photoUrl ? (
          <img
            src={shop.photoUrl}
            alt={shop.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10px' }}
            onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.textContent = '☕'; }}
          />
        ) : (
          '☕'
        )}
      </div>
      <div className="shop-card-info">
        <div className="shop-card-name">{shop.name}</div>
        <div className="shop-card-address">{shop.address}</div>
        <div className="shop-card-meta">
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <StarRating rating={Math.round(shop.averageRating)} size="0.85rem" />
            <strong style={{ color: '#1A1A1A' }}>
              {shop.averageRating?.toFixed(1) || '0.0'}
            </strong>
            <span style={{ color: '#9CA3AF' }}>
              ({shop.reviewCount || 0})
            </span>
          </span>
          {distance && (
            <span style={{ color: '#6B7280', fontSize: '0.8rem' }}>
              📍 {distance}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShopCard;
