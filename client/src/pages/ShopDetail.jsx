import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { shopAPI, reviewAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import MapComponent from '../components/MapComponent';
import StarRating from '../components/StarRating';
import Toast from '../components/Toast';

const ShopDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();

  const [shop, setShop] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [toast, setToast] = useState(null);

  // Review form state
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [existingReview, setExistingReview] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Directions state
  const [route, setRoute] = useState(null);
  const [startAddress, setStartAddress] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [directionsLoading, setDirectionsLoading] = useState(false);

  useEffect(() => {
    fetchShopData();
    getUserLocation();
  }, [id]);

  const fetchShopData = async () => {
    setLoading(true);
    try {
      const [shopRes, reviewsRes] = await Promise.all([
        shopAPI.getById(id),
        reviewAPI.getByShop(id),
      ]);
      setShop(shopRes.data);
      setReviews(reviewsRes.data);

      // Check if user has already reviewed this shop
      if (user) {
        const myReview = reviewsRes.data.find(
          (r) => r.user._id === user._id
        );
        if (myReview) {
          setExistingReview(myReview);
          setReviewRating(myReview.rating);
          setReviewText(myReview.text);
        }
      }
    } catch (err) {
      setToast({ message: 'Failed to load shop details', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {}
      );
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    if (reviewRating === 0) {
      setToast({ message: 'Please select a rating', type: 'error' });
      return;
    }
    if (!reviewText.trim()) {
      setToast({ message: 'Please write a review', type: 'error' });
      return;
    }

    setReviewLoading(true);
    try {
      if (existingReview && isEditing) {
        const res = await reviewAPI.update(existingReview._id, {
          rating: reviewRating,
          text: reviewText,
        });
        setToast({ message: res.data.message, type: 'success' });
      } else {
        const res = await reviewAPI.create(id, {
          rating: reviewRating,
          text: reviewText,
        });
        setToast({ message: res.data.message, type: 'success' });
      }
      // Refresh data
      await fetchShopData();
      await refreshUser();
      setIsEditing(false);
    } catch (err) {
      setToast({
        message: err.response?.data?.message || 'Failed to submit review',
        type: 'error',
      });
    } finally {
      setReviewLoading(false);
    }
  };

  const handleGetDirections = async () => {
    if (!shop) return;
    setDirectionsLoading(true);
    try {
      const payload = {
        endLat: shop.location.coordinates[1],
        endLng: shop.location.coordinates[0],
      };

      if (startAddress.trim()) {
        payload.startAddress = startAddress.trim();
      } else if (userLocation) {
        payload.startLat = userLocation.lat;
        payload.startLng = userLocation.lng;
      } else {
        setToast({ message: 'Please enter a start address or enable location', type: 'error' });
        setDirectionsLoading(false);
        return;
      }

      const res = await shopAPI.getDirections(payload);
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
        <p>Loading shop details...</p>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="empty-state">
        <div className="empty-icon">😕</div>
        <h3>Shop not found</h3>
        <button className="btn btn-primary" onClick={() => navigate('/shops')}>
          Browse Shops
        </button>
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

      {/* Back button */}
      <button
        className="btn btn-ghost"
        onClick={() => navigate(-1)}
        style={{ marginBottom: '16px' }}
      >
        ← Back
      </button>

      <div className="grid-2" style={{ gap: '24px' }}>
        {/* Left: Shop info */}
        <div>
          {/* Cover photo */}
          <div className="shop-detail-cover">
            {shop.photoUrl ? (
              <img
                src={shop.photoUrl}
                alt={shop.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '16px' }}
                onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.textContent = '☕'; }}
              />
            ) : (
              '☕'
            )}
          </div>

          {/* Shop info */}
          <div className="shop-detail-info">
            <h1 className="shop-detail-name">{shop.name}</h1>
            <p className="shop-detail-address">📍 {shop.address}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
              <StarRating rating={Math.round(shop.averageRating)} size="1.2rem" />
              <strong>{shop.averageRating?.toFixed(1) || '0.0'}</strong>
              <span style={{ color: '#9CA3AF' }}>({shop.reviewCount || 0} reviews)</span>
            </div>
            {shop.description && (
              <p className="shop-detail-description">{shop.description}</p>
            )}
          </div>

          {/* Actions */}
          <div className="shop-detail-actions">
            <button
              className="btn btn-primary"
              onClick={() => setActiveTab('directions')}
            >
              🧭 Get Directions
            </button>
            <button
              className="btn btn-outline"
              onClick={() => setActiveTab('reviews')}
            >
              ✍️ Write a Review
            </button>
          </div>

          {/* Tabs */}
          <div className="tabs" style={{ marginTop: '24px' }}>
            <button
              className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button
              className={`tab ${activeTab === 'reviews' ? 'active' : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              Reviews ({shop.reviewCount || 0})
            </button>
            <button
              className={`tab ${activeTab === 'directions' ? 'active' : ''}`}
              onClick={() => setActiveTab('directions')}
            >
              Directions
            </button>
          </div>

          {/* Tab content */}
          {activeTab === 'overview' && (
            <div style={{ animation: 'fadeIn 0.3s ease' }}>
              <div className="card" style={{ marginTop: '8px' }}>
                <div className="card-body">
                  <h3 style={{ marginBottom: '12px' }}>About this shop</h3>
                  <p>{shop.description || 'No description provided.'}</p>
                  <div style={{ marginTop: '16px', fontSize: '0.85rem', color: '#6B7280' }}>
                    <p>📍 {shop.address}</p>
                    {shop.addedBy && (
                      <p style={{ marginTop: '4px' }}>
                        Added by {shop.addedBy.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div style={{ animation: 'fadeIn 0.3s ease' }}>
              {/* Review form */}
              {user ? (
                <div className="card" style={{ marginTop: '8px', marginBottom: '16px' }}>
                  <div className="card-body">
                    {existingReview && !isEditing ? (
                      <div>
                        <h4>Your Review</h4>
                        <div style={{ margin: '8px 0' }}>
                          <StarRating rating={existingReview.rating} size="1.1rem" />
                        </div>
                        <p style={{ fontSize: '0.9rem' }}>{existingReview.text}</p>
                        <button
                          className="btn btn-outline btn-sm"
                          style={{ marginTop: '12px' }}
                          onClick={() => setIsEditing(true)}
                        >
                          ✏️ Edit Review
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmitReview}>
                        <h4>{isEditing ? 'Edit Your Review' : 'Write a Review'}</h4>
                        <div style={{ margin: '12px 0' }}>
                          <label className="form-label">Your Rating</label>
                          <StarRating
                            rating={reviewRating}
                            onRate={setReviewRating}
                            interactive={true}
                            size="1.5rem"
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Your Review</label>
                          <textarea
                            className="form-textarea"
                            placeholder="Share your experience at this chai shop..."
                            value={reviewText}
                            onChange={(e) => setReviewText(e.target.value)}
                            maxLength={500}
                          />
                          <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#9CA3AF' }}>
                            {reviewText.length}/500
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={reviewLoading}
                          >
                            {reviewLoading
                              ? 'Submitting...'
                              : isEditing
                              ? 'Update Review'
                              : 'Submit Review'}
                          </button>
                          {isEditing && (
                            <button
                              type="button"
                              className="btn btn-ghost"
                              onClick={() => {
                                setIsEditing(false);
                                setReviewRating(existingReview.rating);
                                setReviewText(existingReview.text);
                              }}
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              ) : (
                <div className="card" style={{ marginTop: '8px', marginBottom: '16px' }}>
                  <div className="card-body" style={{ textAlign: 'center' }}>
                    <p>Sign in to write a review</p>
                    <button
                      className="btn btn-primary btn-sm"
                      style={{ marginTop: '8px' }}
                      onClick={() => navigate('/login')}
                    >
                      Sign In
                    </button>
                  </div>
                </div>
              )}

              {/* Reviews list */}
              <div className="card">
                {reviews.length === 0 ? (
                  <div className="card-body empty-state" style={{ padding: '32px' }}>
                    <div className="empty-icon">💬</div>
                    <h3>No reviews yet</h3>
                    <p>Be the first to review this shop!</p>
                  </div>
                ) : (
                  reviews.map((review) => (
                    <div className="review-card" key={review._id}>
                      <div className="review-header">
                        <div className="review-author">
                          <div className="review-avatar">
                            {review.user?.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="review-author-name">{review.user?.name}</div>
                            <StarRating rating={review.rating} size="0.85rem" />
                          </div>
                        </div>
                        <div className="review-date">
                          {new Date(review.createdAt).toLocaleDateString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </div>
                      </div>
                      <p className="review-text">{review.text}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'directions' && (
            <div className="directions-panel" style={{ marginTop: '8px', animation: 'fadeIn 0.3s ease' }}>
              <h3>🧭 Get Directions</h3>

              <div className="form-group" style={{ marginTop: '12px' }}>
                <label className="form-label">From</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder={
                    userLocation
                      ? 'Using your location (or type an address)'
                      : 'Enter your start address'
                  }
                  value={startAddress}
                  onChange={(e) => setStartAddress(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleGetDirections()}
                />
              </div>

              <div style={{ fontSize: '0.85rem', color: '#6B7280', marginBottom: '12px' }}>
                <strong>To:</strong> {shop.address}
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  className="btn btn-primary"
                  onClick={handleGetDirections}
                  disabled={directionsLoading}
                >
                  {directionsLoading ? 'Finding route...' : '🧭 Get Directions'}
                </button>
                {userLocation && !startAddress && (
                  <button
                    className="btn btn-outline"
                    onClick={handleGetDirections}
                    disabled={directionsLoading}
                  >
                    📍 From My Location
                  </button>
                )}
              </div>

              {route && (
                <div className="directions-route-info">
                  <div>
                    <div className="value">{formatDistance(route.distance)}</div>
                    <div className="label">Distance</div>
                  </div>
                  <div>
                    <div className="value">{formatDuration(route.duration)}</div>
                    <div className="label">Estimated Time</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Mini map */}
        <div>
          <div style={{ position: 'sticky', top: '90px' }}>
            <MapComponent
              shops={[shop]}
              route={route}
              userLocation={userLocation}
              height="350px"
              onGetDirections={() => setActiveTab('directions')}
            />
            <div className="card" style={{ marginTop: '16px' }}>
              <div className="card-body">
                <h4>Location</h4>
                <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>{shop.address}</p>
                <p style={{ fontSize: '0.75rem', color: '#9CA3AF', marginTop: '4px' }}>
                  Lat: {shop.location.coordinates[1].toFixed(4)},
                  Lng: {shop.location.coordinates[0].toFixed(4)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopDetail;
