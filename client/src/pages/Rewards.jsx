import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { rewardAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';

const Rewards = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [balance, setBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [redeemLoading, setRedeemLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [couponModal, setCouponModal] = useState(null);

  useEffect(() => {
    if (!user) return;
    fetchBalance();
  }, [user]);

  const fetchBalance = async () => {
    try {
      const res = await rewardAPI.getBalance();
      setBalance(res.data);
      setTransactions(res.data.transactions);
    } catch (err) {
      console.error('Failed to fetch balance:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async () => {
    if (!balance?.canRedeem) {
      setToast({
        message: `You need ${balance?.redemptionCost || 50} points to redeem a coupon. You have ${balance?.points || 0} points.`,
        type: 'error',
      });
      return;
    }

    setRedeemLoading(true);
    try {
      const res = await rewardAPI.redeem();
      setCouponModal(res.data);
      await refreshUser();
      await fetchBalance();
    } catch (err) {
      setToast({
        message: err.response?.data?.message || 'Failed to redeem coupon',
        type: 'error',
      });
    } finally {
      setRedeemLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="empty-state">
        <div className="empty-icon">🎁</div>
        <h3>Sign in to view rewards</h3>
        <p>Earn points by reviewing chai shops and redeem them for coupons!</p>
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
        <p>Loading rewards...</p>
      </div>
    );
  }

  return (
    <div>
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      {/* Coupon Modal */}
      {couponModal && (
        <div className="modal-overlay" onClick={() => setCouponModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>🎉 Coupon Unlocked!</h2>
            <p>Your coupon code is:</p>
            <div className="coupon-code">{couponModal.couponCode}</div>
            <p style={{ fontSize: '0.85rem', color: '#6B7280' }}>
              {couponModal.pointsDeducted} points deducted. Remaining: {couponModal.remainingPoints} points.
            </p>
            <button
              className="btn btn-primary btn-lg"
              style={{ marginTop: '16px' }}
              onClick={() => {
                navigator.clipboard?.writeText(couponModal.couponCode);
                setToast({ message: 'Coupon code copied!', type: 'success' });
                setCouponModal(null);
              }}
            >
              📋 Copy Code
            </button>
            <button
              className="btn btn-ghost"
              style={{ marginTop: '8px', display: 'block', width: '100%' }}
              onClick={() => setCouponModal(null)}
            >
              Done
            </button>
          </div>
        </div>
      )}

      <h1 style={{ marginBottom: '24px' }}>🎁 Rewards</h1>

      {/* Points Display */}
      <div className="points-display">
        <div style={{ fontSize: '1rem', color: '#6B7280', marginBottom: '8px' }}>Your Points</div>
        <div className="points-big">{balance?.points || 0}</div>
        <div className="points-subtitle">Keep reviewing to earn more points!</div>
      </div>

      {/* Redeem Section */}
      <div className="grid-2" style={{ marginBottom: '32px' }}>
        <div className="redeem-card">
          <h3>🎟️ Redeem a Coupon</h3>
          <p>Get a coupon code for {balance?.redemptionCost || 50} points</p>
          <button
            className={`btn ${balance?.canRedeem ? 'btn-primary' : 'btn-outline'} btn-lg`}
            onClick={handleRedeem}
            disabled={redeemLoading || !balance?.canRedeem}
          >
            {redeemLoading
              ? 'Redeeming...'
              : balance?.canRedeem
              ? '🎉 Redeem Now'
              : `Need ${(balance?.redemptionCost || 50) - (balance?.points || 0)} more points`}
          </button>
        </div>

        <div className="redeem-card">
          <h3>💡 How to earn points</h3>
          <div style={{ textAlign: 'left', fontSize: '0.9rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F3F4F6' }}>
              <span>Write a review</span>
              <span className="badge badge-success">+10 pts</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F3F4F6' }}>
              <span>First review on a new shop</span>
              <span className="badge badge-warning">+15 pts</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
              <span>Redeem coupon</span>
              <span className="badge badge-error">-{balance?.redemptionCost || 50} pts</span>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="card">
        <div className="card-header">
          <h3>📋 History</h3>
        </div>
        {transactions.length === 0 ? (
          <div className="card-body empty-state" style={{ padding: '32px' }}>
            <p>No transactions yet. Start reviewing shops to earn points!</p>
          </div>
        ) : (
          transactions.map((tx) => (
            <div className="transaction-item" key={tx._id}>
              <div className="transaction-info">
                <div className={`transaction-icon ${tx.points > 0 ? 'earned' : 'spent'}`}>
                  {tx.type === 'REDEMPTION' ? '🎟️' : tx.type === 'FIRST_REVIEW' ? '🌟' : '✍️'}
                </div>
                <div className="transaction-details">
                  <h4>{tx.description}</h4>
                  <p>
                    {new Date(tx.createdAt).toLocaleDateString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
              <div className={`transaction-points ${tx.points > 0 ? 'positive' : 'negative'}`}>
                {tx.points > 0 ? '+' : ''}{tx.points} pts
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Rewards;
