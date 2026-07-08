import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { shopAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';

const AddShop = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  if (!user) {
    return (
      <div className="empty-state">
        <div className="empty-icon">🔒</div>
        <h3>Sign in to add a shop</h3>
        <p>You need to be logged in to add chai shops.</p>
        <button className="btn btn-primary" onClick={() => navigate('/login')}>
          Sign In
        </button>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim() || !address.trim()) {
      setToast({ message: 'Shop name and address are required', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const res = await shopAPI.create({
        name: name.trim(),
        address: address.trim(),
        description: description.trim(),
        photoUrl: photoUrl.trim(),
      });
      setToast({ message: 'Shop added successfully!', type: 'success' });
      setTimeout(() => navigate(`/shops/${res.data._id}`), 1500);
    } catch (err) {
      setToast({
        message: err.response?.data?.message || 'Failed to add shop. Check the address and try again.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      <button
        className="btn btn-ghost"
        onClick={() => navigate(-1)}
        style={{ marginBottom: '16px' }}
      >
        ← Back
      </button>

      <div className="card">
        <div className="card-header">
          <h2>☕ Add New Chai Shop</h2>
          <p style={{ fontSize: '0.85rem', color: '#6B7280', marginTop: '4px' }}>
            Share your favorite chai spot with the community
          </p>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="shop-name">Shop Name *</label>
              <input
                id="shop-name"
                type="text"
                className="form-input"
                placeholder="Enter shop name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={100}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="shop-address">Address *</label>
              <input
                id="shop-address"
                type="text"
                className="form-input"
                placeholder="Enter complete address (e.g., MG Road, Bangalore, Karnataka)"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
              <p style={{ fontSize: '0.75rem', color: '#9CA3AF', marginTop: '4px' }}>
                The address will be converted to map coordinates automatically.
              </p>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="shop-description">Description</label>
              <textarea
                id="shop-description"
                className="form-textarea"
                placeholder="Tell us about this shop..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={500}
              />
              <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#9CA3AF' }}>
                {description.length}/500
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="shop-photo">Photo URL (Optional)</label>
              <input
                id="shop-photo"
                type="url"
                className="form-input"
                placeholder="https://example.com/photo.jpg"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
              />
            </div>

            {photoUrl && (
              <div style={{ marginBottom: '16px' }}>
                <img
                  src={photoUrl}
                  alt="Preview"
                  style={{
                    width: '100%',
                    height: '160px',
                    objectFit: 'cover',
                    borderRadius: '12px',
                    border: '1px solid #E5E7EB',
                  }}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary btn-full btn-lg"
              disabled={loading}
            >
              {loading ? 'Adding shop...' : '☕ Add Shop'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddShop;
