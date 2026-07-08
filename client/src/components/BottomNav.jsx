import { NavLink } from 'react-router-dom';

const BottomNav = () => {
  const items = [
    { to: '/', icon: '🏠', label: 'Home' },
    { to: '/map', icon: '🗺️', label: 'Map' },
    { to: '/shops', icon: '☕', label: 'Shops' },
    { to: '/rewards', icon: '🎁', label: 'Rewards' },
    { to: '/profile', icon: '👤', label: 'Profile' },
  ];

  return (
    <nav className="bottom-nav">
      <div className="bottom-nav-items">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `bottom-nav-item ${isActive ? 'active' : ''}`
            }
            end={item.to === '/'}
          >
            <span className="icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
