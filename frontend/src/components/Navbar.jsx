import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../features/auth/authSlice';

/* Inline styles */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;600;700&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap');
  :root {
    --nav-h: 68px;
    --link-color: rgba(30, 30, 30, 0.7);
    --link-hover: #111;
    --box-border: rgba(0, 0, 0, 0.18);
    --box-bg: rgba(0, 0, 0, 0.05);
  }

  /* ── Shell ── */
  #eco-navbar {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: var(--nav-h);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 2rem;
    z-index: 1000;
    background: none;
    transition: background 0.3s ease;
    box-sizing: border-box;
  }

  /* Clusters */
  #eco-navbar .eco-left,
  #eco-navbar .eco-right {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  /* Individual link */
  #eco-navbar .eco-nav-link {
    position: relative;
    display: inline-flex;
    align-items: center;
    font-family: "Geist Mono", monospace;
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 0.13em;
    text-transform: uppercase;
    text-decoration: none;
    padding: 0.45rem 0.9rem;
    border: 1px solid transparent;
    border-radius: 3px;
    transition: border-color 0.18s ease, background 0.18s ease;
    white-space: nowrap;
    backdrop-filter: blur(25px);
    background: none;
    cursor: pointer;
    color: inherit;
  }

  #eco-navbar .eco-nav-link:hover {
    border-color: var(--box-border);
    background: var(--box-bg);
  }

  /* corner accents */
  #eco-navbar .eco-nav-link .corner-tl,
  #eco-navbar .eco-nav-link .corner-br {
    position: absolute;
    width: 5px;
    height: 5px;
    opacity: 0;
    transition: opacity 0.18s ease;
    pointer-events: none;
  }

  #eco-navbar .eco-nav-link .corner-tl {
    top: -1px;
    left: -1px;
    border-top: 1px solid rgba(0, 0, 0, 0.5);
    border-left: 1px solid rgba(0, 0, 0, 0.5);
  }

  #eco-navbar .eco-nav-link .corner-br {
    bottom: -1px;
    right: -1px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.5);
    border-right: 1px solid rgba(0, 0, 0, 0.5);
  }

  #eco-navbar .eco-nav-link:hover .corner-tl,
  #eco-navbar .eco-nav-link:hover .corner-br {
    opacity: 1;
  }

  /* Text scroll effect */
  #eco-navbar .link-text {
    display: block;
    overflow: hidden;
    height: 1em;
  }

  #eco-navbar .link-track {
    display: flex;
    flex-direction: column;
    transition: transform 0.4s cubic-bezier(0.76, 0, 0.24, 1);
  }

  #eco-navbar .eco-nav-link:hover .link-track {
    transform: translateY(-50%);
  }

  #eco-navbar .link-track span {
    display: block;
    height: 1em;
    line-height: 1em;
  }

  #eco-navbar .link-track span:first-child { color: var(--link-color); }
  #eco-navbar .link-track span:last-child  { color: var(--link-hover); }

  /* logout button variant — inherits nav-link but styled as button */
  #eco-navbar .eco-nav-link.eco-logout {
    border-color: rgba(220, 38, 38, 0.3);
  }

  #eco-navbar .eco-nav-link.eco-logout:hover {
    border-color: rgba(220, 38, 38, 0.6);
    background: rgba(220, 38, 38, 0.07);
  }

  #eco-navbar .eco-nav-link.eco-logout .link-track span:first-child {
    color: rgba(185, 28, 28, 0.8);
  }

  #eco-navbar .eco-nav-link.eco-logout .link-track span:last-child {
    color: #b91c1c;
  }

  /* signup / primary CTA */
  #eco-navbar .eco-nav-link.eco-signup {
    border-color: rgba(21, 128, 61, 0.35);
    background: rgba(21, 128, 61, 0.06);
  }

  #eco-navbar .eco-nav-link.eco-signup:hover {
    border-color: rgba(21, 128, 61, 0.65);
    background: rgba(21, 128, 61, 0.12);
  }

  #eco-navbar .eco-nav-link.eco-signup .link-track span:first-child {
    color: rgba(21, 128, 61, 0.85);
  }

  #eco-navbar .eco-nav-link.eco-signup .link-track span:last-child {
    color: #15803d;
  }

  /* Centre logo */
  #eco-navbar .eco-logo-wrap {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    padding: 2.5px;
    border-radius: 12px;
    background: linear-gradient(120deg,
    #0b2e13,
    #14532d,
    #1f7a3d,
    #6ee7b7,
    #1f7a3d,
    #14532d,
    #0b2e13);
    background-size: 300%;
    animation: ecoLogoGradient 2.8s linear infinite;
    text-decoration: none;
  }

  @keyframes ecoLogoGradient {
    0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
  }

  #eco-navbar .eco-logo-inner {
    background: linear-gradient( 135deg,
    #04130a,
    #0b2e13,
    #14532d);
    border-radius: 10px;
    padding: 0.35rem 0.9rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  #eco-navbar .eco-logo-inner span {
    font-family: "Geist Mono", monospace;
    font-size: 1.05rem;
    font-weight: 700;
    color: #ffffffea;
    line-height: 1;
    letter-spacing: 0.1em;
    user-select: none;
    text-transform: uppercase;
  }

  /* Menu trigger (mobile) */
  #eco-navbar .eco-menu-trigger {
    display: none;
    align-items: center;
    cursor: pointer;
    background: none;
    border: 1px solid transparent;
    border-radius: 3px;
    padding: 0.35rem 0.7rem;
    transition: border-color 0.18s ease, background 0.18s ease;
    z-index: 1000;
    overflow: hidden;
  }

  #eco-navbar .eco-menu-trigger:hover {
    border-color: var(--box-border);
    background: var(--box-bg);
  }

  #eco-navbar .eco-menu-trigger .link-track span {
    font-family: "Geist Mono", monospace;
    font-size: 0.78rem;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  #eco-navbar .eco-menu-trigger .link-track span:first-child { color: rgba(30, 30, 30, 0.7); }
  #eco-navbar .eco-menu-trigger .link-track span:last-child  { color: #111; }

  #eco-navbar .eco-menu-trigger:hover .link-track {
    transform: translateY(-50%);
  }

  /* Mobile drawer */
  .eco-mobile-menu {
    display: none;
    position: fixed;
    top: var(--nav-h);
    right: 1rem;
    width: 58%;
    backdrop-filter: blur(12px);
    background: rgba(255,255,255,0.85);
    border: 1px solid rgba(0,0,0,0.1);
    border-radius: 8px;
    flex-direction: column;
    padding: 1rem 2rem 1.5rem;
    gap: 0.25rem;
    transform: translateY(-8px);
    opacity: 0;
    transition: transform 0.22s ease, opacity 0.22s ease;
    pointer-events: none;
    z-index: 999;
  }

  .eco-mobile-menu.open {
    opacity: 1;
    transform: translateY(0);
    pointer-events: auto;
  }

  .eco-mobile-menu .eco-nav-link {
    font-size: 0.82rem;
    font-weight: 600;
    padding: 0.6rem 0.75rem;
  }

  .eco-mobile-menu .eco-divider {
    height: 1px;
    background-color: #000;
    opacity: 0.1;
    margin: 0.5rem 0;
  }

  /* Responsive */
  @media (max-width: 1000px) {
    #eco-navbar .eco-left,
    #eco-navbar .eco-right { display: none; }

    #eco-navbar .eco-menu-trigger { display: flex; }

    .eco-mobile-menu { display: flex; }

    #eco-navbar .eco-logo-wrap {
      position: static;
      transform: none;
      margin-right: auto;
    }

    #eco-navbar { justify-content: space-between; }
  }

  @media (max-width: 480px) {
    #eco-navbar { padding: 0 1.25rem; }
  }
`;

/* NavLink helper */
const NavLink = ({ to, label, className = '', onClick }) => {
  const Tag = onClick ? 'button' : Link;
  const extraProps = onClick ? { onClick } : { to };

  return (
    <Tag {...extraProps} className={`eco-nav-link ${className}`}>
      <div className="corner-tl" />
      <div className="link-text">
        <div className="link-track">
          <span>{label}</span>
          <span>{label}</span>
        </div>
      </div>
      <div className="corner-br" />
    </Tag>
  );
};

/* Component */
const Navbar = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
    setMenuOpen(false);
  };

  // close drawer on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const close = (e) => {
      if (!e.target.closest('#eco-navbar') && !e.target.closest('.eco-mobile-menu')) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [menuOpen]);

  const authLinks = isAuthenticated ? (
    <>
      <NavLink to="/dashboard" label="Dashboard" />
      <NavLink to="/analyzer"  label="Analyzer"  />
      <NavLink to="/history"   label="History"   />
      {user?.role === 'admin' && <NavLink to="/admin" label="Admin" />}
    </>
  ) : null;

  const rightLinks = isAuthenticated ? (
    <NavLink label="Logout" className="eco-logout" onClick={handleLogout} />
  ) : (
    <>
      <NavLink to="/login"  label="Login"   />
      <NavLink to="/signup" label="Sign Up" className="eco-signup" />
    </>
  );

  return (
    <>
      {/* Inject scoped styles */}
      <style>{styles}</style>

      <nav id="eco-navbar">
        {/* Left cluster */}
        <div className="eco-left">
          {isAuthenticated ? authLinks : <NavLink to="/" label="Home" />}
        </div>

        {/* Centre logo */}
        <Link to="/" className="eco-logo-wrap">
          <div className="eco-logo-inner">
            <span>GoGreenPy</span>
          </div>
        </Link>

        {/* Right cluster */}
        <div className="eco-right">
          {rightLinks}
        </div>

        {/* Mobile menu trigger */}
        <button
          className={`eco-menu-trigger${menuOpen ? ' open' : ''}`}
          aria-label="Toggle menu"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <div className="link-text">
            <div className="link-track">
              <span>Menu</span>
              <span>Close</span>
            </div>
          </div>
        </button>
      </nav>

      {/* Mobile drawer */}
      <div className={`eco-mobile-menu${menuOpen ? ' open' : ''}`}>
        {isAuthenticated ? (
          <>
            <NavLink to="/dashboard" label="Dashboard" onClick={() => setMenuOpen(false)} />
            <NavLink to="/analyzer"  label="Analyzer"  onClick={() => setMenuOpen(false)} />
            <NavLink to="/history"   label="History"   onClick={() => setMenuOpen(false)} />
            {user?.role === 'admin' && (
              <NavLink to="/admin" label="Admin" onClick={() => setMenuOpen(false)} />
            )}
            <div className="eco-divider" />
            <NavLink label="Logout" className="eco-logout" onClick={handleLogout} />
          </>
        ) : (
          <>
            <NavLink to="/"       label="Home"    onClick={() => setMenuOpen(false)} />
            <NavLink to="/login"  label="Login"   onClick={() => setMenuOpen(false)} />
            <NavLink to="/signup" label="Sign Up" className="eco-signup" onClick={() => setMenuOpen(false)} />
          </>
        )}
      </div>
    </>
  );
};

export default Navbar;
