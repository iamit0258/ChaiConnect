import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
    onClose?.();
  };

  const navItems = [
    { to: '/', icon: '🏠', label: 'Home' },
    { to: '/map', icon: '🗺️', label: 'Map' },
    { to: '/shops', icon: '☕', label: 'Shops' },
    { to: '/rewards', icon: '🎁', label: 'Rewards' },
    { to: '/leaderboard', icon: '🏆', label: 'Leaderboard' },
    { to: '/profile', icon: '👤', label: 'Profile' },
  ];

  return (
    <>
      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.3)',
            zIndex: 99,
            display: 'block',
          }}
        />
      )}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-brand" style={{ gap: '12px' }}>
          <img 
            src="/logo.png" 
            alt="Chai Connect Logo" 
            style={{ width: '45px', height: '45px', objectFit: 'contain' }} 
          />
          <div>
            <h2>Chai Connect</h2>
            <p>Discover. Review. Earn.</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
              onClick={onClose}
              end={item.to === '/'}
            >
              <span className="icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}

          {user && (
            <button className="sidebar-link" onClick={handleLogout}>
              <span className="icon">🚪</span>
              Logout
            </button>
          )}
        </nav>

        {user && (
          <div className="sidebar-points">
            <div className="points-value">{user.points || 0}</div>
            <div className="points-label">Points</div>
            <NavLink
              to="/rewards"
              className="btn btn-outline btn-sm"
              style={{ marginTop: '8px' }}
              onClick={onClose}
            >
              View rewards
            </NavLink>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;
