import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const roleBadge = user?.role === 'admin' ? 'badge-admin' : 'badge-reader';

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`} role="navigation" aria-label="Main navigation">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <span className="emoji" role="img" aria-label="books">📚</span>
          <span className="gradient-text">BookShelf</span>
        </Link>

        {/* Desktop links */}
        <div className="navbar-links">
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                className={`navbar-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
              >
                Dashboard
              </Link>
              <span className={`badge ${roleBadge}`}>{user?.role || 'reader'}</span>
              <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="hamburger"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label="Toggle mobile menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="mobile-menu">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="navbar-link">
                Dashboard
              </Link>
              <div style={{ padding: '8px 16px' }}>
                <span className={`badge ${roleBadge}`}>{user?.role || 'reader'}</span>
              </div>
              <button className="btn btn-secondary" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar-link">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary">
                Register
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
