import { useState, useEffect } from 'react';
import { rewardAPI } from '../services/api';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const res = await rewardAPI.getLeaderboard();
      setLeaderboard(res.data);
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRankClass = (index) => {
    if (index === 0) return 'gold';
    if (index === 1) return 'silver';
    if (index === 2) return 'bronze';
    return 'default';
  };

  const getRankEmoji = (index) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `${index + 1}`;
  };

  if (loading) {
    return (
      <div className="loading-page">
        <div className="spinner"></div>
        <p>Loading leaderboard...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '24px' }}>🏆 Leaderboard</h1>

      {leaderboard.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🏆</div>
          <h3>No entries yet</h3>
          <p>Start reviewing shops to climb the leaderboard!</p>
        </div>
      ) : (
        <>
          {/* Top 3 featured */}
          {leaderboard.length >= 3 && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'end',
                gap: '16px',
                marginBottom: '32px',
                padding: '24px',
                background: 'linear-gradient(135deg, #FFF8F0, #FEF3C7)',
                borderRadius: '20px',
              }}
            >
              {/* 2nd place */}
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #9CA3AF, #6B7280)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    margin: '0 auto 8px',
                    border: '3px solid white',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                >
                  {leaderboard[1].name.charAt(0).toUpperCase()}
                </div>
                <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{leaderboard[1].name}</div>
                <div style={{ fontWeight: 700, color: '#D97706' }}>{leaderboard[1].totalEarned} pts</div>
                <div style={{ fontSize: '1.2rem' }}>🥈</div>
              </div>

              {/* 1st place */}
              <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                <div
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '2rem',
                    fontWeight: 700,
                    margin: '0 auto 8px',
                    border: '4px solid white',
                    boxShadow: '0 4px 16px rgba(217,119,6,0.3)',
                  }}
                >
                  {leaderboard[0].name.charAt(0).toUpperCase()}
                </div>
                <div style={{ fontWeight: 600, fontSize: '1rem' }}>{leaderboard[0].name}</div>
                <div style={{ fontWeight: 700, color: '#D97706', fontSize: '1.1rem' }}>{leaderboard[0].totalEarned} pts</div>
                <div style={{ fontSize: '1.5rem' }}>🥇</div>
              </div>

              {/* 3rd place */}
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #D97706, #92400E)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '1.3rem',
                    fontWeight: 700,
                    margin: '0 auto 8px',
                    border: '3px solid white',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                >
                  {leaderboard[2].name.charAt(0).toUpperCase()}
                </div>
                <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{leaderboard[2].name}</div>
                <div style={{ fontWeight: 700, color: '#D97706' }}>{leaderboard[2].totalEarned} pts</div>
                <div style={{ fontSize: '1.2rem' }}>🥉</div>
              </div>
            </div>
          )}

          {/* Full list */}
          <div className="card">
            <div className="card-header">
              <h3>All Rankings</h3>
            </div>
            {leaderboard.map((entry, index) => (
              <div className="leaderboard-item" key={entry.userId || index}>
                <div className={`leaderboard-rank ${getRankClass(index)}`}>
                  {getRankEmoji(index)}
                </div>
                <div className="leaderboard-name">
                  {entry.name}
                  <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>
                    {entry.reviewCount} review{entry.reviewCount !== 1 ? 's' : ''}
                  </div>
                </div>
                <div className="leaderboard-points">{entry.totalEarned} pts</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Leaderboard;
