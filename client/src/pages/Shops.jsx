import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { shopAPI } from '../services/api';
import ShopCard from '../components/ShopCard';
import StarRating from '../components/StarRating';

const Shops = () => {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('newest');
  const navigate = useNavigate();

  useEffect(() => {
    fetchShops();
  }, [search, minRating, sortBy]);

  const fetchShops = async () => {
    setLoading(true);
    try {
      const params = { sortBy };
      if (search.trim()) params.search = search.trim();
      if (minRating > 0) params.minRating = minRating;

      const res = await shopAPI.getAll(params);
      setShops(res.data);
    } catch (err) {
      console.error('Failed to fetch shops:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1>☕ Chai Shops</h1>
        <button className="btn btn-primary" onClick={() => navigate('/shops/add')}>
          + Add New Shop
        </button>
      </div>

      {/* Filter panel */}
      <div className="filter-panel">
        <h3>🔍 Filter & Search</h3>
        <div className="filter-row">
          <div className="form-group">
            <label className="form-label">Search</label>
            <input
              type="text"
              className="form-input"
              placeholder="Search shops..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Minimum Rating</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <StarRating
                rating={minRating}
                onRate={(r) => setMinRating(minRating === r ? 0 : r)}
                interactive={true}
                size="1.3rem"
              />
              {minRating > 0 && (
                <span style={{ fontSize: '0.85rem', color: '#6B7280' }}>
                  {minRating}+ stars
                </span>
              )}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Sort By</label>
            <select
              className="form-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Newest</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
          {(search || minRating > 0) && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => {
                setSearch('');
                setMinRating(0);
              }}
              style={{ alignSelf: 'end', marginBottom: '2px' }}
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="loading-page">
          <div className="spinner"></div>
          <p>Loading shops...</p>
        </div>
      ) : shops.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <h3>No shops found</h3>
          <p>
            {search || minRating > 0
              ? 'Try adjusting your search filters.'
              : 'Be the first to add a chai shop!'}
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/shops/add')}>
            + Add Shop
          </button>
        </div>
      ) : (
        <div>
          <p style={{ color: '#6B7280', fontSize: '0.85rem', marginBottom: '16px' }}>
            {shops.length} shop{shops.length !== 1 ? 's' : ''} found
          </p>
          <div className="grid-2">
            {shops.map((shop) => (
              <ShopCard
                key={shop._id}
                shop={shop}
                onClick={(s) => navigate(`/shops/${s._id}`)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Shops;
