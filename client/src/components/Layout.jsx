import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import { useAuth } from '../context/AuthContext';
import { SearchIcon } from './Icons';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="main-content">
        <header className="top-bar">
          <button
            className="mobile-menu-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            ☰
          </button>

          <div className="top-bar-search">
            <SearchIcon />
            <input
              type="text"
              placeholder="Search chai shops..."
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.target.value.trim()) {
                  navigate(`/shops?search=${encodeURIComponent(e.target.value.trim())}`);
                }
              }}
            />
          </div>

          <div className="top-bar-actions">
            {user ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                }}
                onClick={() => navigate('/profile')}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                  }}
                >
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>
                  {user.name}
                </span>
              </div>
            ) : (
              <button
                className="btn btn-primary btn-sm"
                onClick={() => navigate('/login')}
              >
                Sign In
              </button>
            )}
          </div>
        </header>

        <main className="page-content">
          <Outlet />
        </main>
      </div>

      <BottomNav />
    </div>
  );
};

export default Layout;
