import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { rewardAPI } from '../services/api';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ points: 0, reviewCount: 0, totalEarned: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchStats();
  }, [user]);

  const fetchStats = async () => {
    try {
      const res = await rewardAPI.getBalance();
      const transactions = res.data.transactions || [];
      const totalEarned = transactions
        .filter((t) => t.points > 0)
        .reduce((sum, t) => sum + t.points, 0);
      const reviewCount = transactions.filter(
        (t) => t.type === 'REVIEW' || t.type === 'FIRST_REVIEW'
      ).length;

      setStats({
        points: res.data.points,
        reviewCount,
        totalEarned,
      });
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    return (
      <div className="empty-state">
        <div className="empty-icon">👤</div>
        <h3>Sign in to view your profile</h3>
        <button className="btn btn-primary" onClick={() => navigate('/login')}>
          Sign In
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="loading-page">
        <div className="spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '24px' }}>👤 Profile</h1>

      {/* Profile header */}
      <div className="profile-header">
        <div className="profile-avatar">
          {user.name?.charAt(0).toUpperCase()}
        </div>
        <div className="profile-info">
          <h2>{user.name}</h2>
          <p>{user.email}</p>
          <p style={{ fontSize: '0.8rem', marginTop: '4px' }}>
            Member since{' '}
            {new Date(user.createdAt).toLocaleDateString('en-IN', {
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="profile-stats">
        <div className="profile-stat">
          <div className="stat-value">{stats.points}</div>
          <div className="stat-label">Current Points</div>
        </div>
        <div className="profile-stat">
          <div className="stat-value">{stats.reviewCount}</div>
          <div className="stat-label">Reviews Written</div>
        </div>
        <div className="profile-stat">
          <div className="stat-value">{stats.totalEarned}</div>
          <div className="stat-label">Total Earned</div>
        </div>
      </div>

      {/* Actions */}
      <div className="card">
        <div className="card-body">
          <h3 style={{ marginBottom: '16px' }}>Quick Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              className="btn btn-outline btn-full"
              onClick={() => navigate('/rewards')}
            >
              🎁 View Rewards & Redeem
            </button>
            <button
              className="btn btn-outline btn-full"
              onClick={() => navigate('/shops/add')}
            >
              ☕ Add a Chai Shop
            </button>
            <button
              className="btn btn-outline btn-full"
              onClick={() => navigate('/leaderboard')}
            >
              🏆 View Leaderboard
            </button>
            <hr style={{ border: 'none', borderTop: '1px solid #E5E7EB', margin: '8px 0' }} />
            <button className="btn btn-danger btn-full" onClick={handleLogout}>
              🚪 Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
