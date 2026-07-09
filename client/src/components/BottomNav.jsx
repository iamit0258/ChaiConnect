import { NavLink } from 'react-router-dom';
import { HomeIcon, MapIcon, CoffeeIcon, GiftIcon, UserIcon } from './Icons';

const BottomNav = () => {
  const items = [
    { to: '/', icon: <HomeIcon />, label: 'Home' },
    { to: '/map', icon: <MapIcon />, label: 'Map' },
    { to: '/shops', icon: <CoffeeIcon />, label: 'Shops' },
    { to: '/rewards', icon: <GiftIcon />, label: 'Rewards' },
    { to: '/profile', icon: <UserIcon />, label: 'Profile' },
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
