import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  HomeIcon, 
  MapIcon, 
  CoffeeIcon, 
  GiftIcon, 
  LeaderboardIcon, 
  UserIcon, 
  LogoutIcon 
} from './Icons';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
    onClose?.();
  };

  const navItems = [
    { to: '/', icon: <HomeIcon />, label: 'Home' },
    { to: '/map', icon: <MapIcon />, label: 'Map' },
    { to: '/shops', icon: <CoffeeIcon />, label: 'Shops' },
    { to: '/rewards', icon: <GiftIcon />, label: 'Rewards' },
    { to: '/leaderboard', icon: <LeaderboardIcon />, label: 'Leaderboard' },
    { to: '/profile', icon: <UserIcon />, label: 'Profile' },
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
            zIndex: 1100,
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
              <span className="icon"><LogoutIcon /></span>
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
