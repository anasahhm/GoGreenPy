import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { login } from '../services/api';
import { setCredentials } from '../features/auth/authSlice';

/* ─── Styles ──────────────────────────────────────────────────────────────── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Geist+Mono:wght@300;400;600;700&display=swap');

  :root {
    --lg-dark: #0e0e0e;
    --lg-green: #16a34a;
    --lg-green-light: #22c55e;
    --lg-border: rgba(255, 255, 255, 0.12);
  }

  .lg-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--lg-dark);
    font-family: "Geist Mono", monospace;
    padding: 2rem 1.5rem;
    position: relative;
    overflow: hidden;
  }

  /* noise grain — mirrors home-hero::before */
  .lg-page::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E");
    opacity: 0.045;
    pointer-events: none;
    z-index: 0;
  }

  /* green glow — mirrors home-hero::after */
  .lg-page::after {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse 80% 60% at 50% 100%, rgba(22,163,74,0.18) 0%, transparent 70%);
    pointer-events: none;
    z-index: 0;
  }

  /* grid lines — mirrors home-hero-grid */
  .lg-grid {
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    background-image:
      linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
    background-size: 80px 80px;
  }

  /* ── Keyframes ── */
  @keyframes lg-fade-up {
    from { opacity: 0; transform: translateY(22px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes lg-line-grow {
    from { transform: scaleX(0); }
    to   { transform: scaleX(1); }
  }
  @keyframes lg-gradient-shift {
    0%   { background-position: 0%; }
    100% { background-position: 300%; }
  }

  .lg-reveal {
    opacity: 0;
    animation: lg-fade-up 0.55s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  }
  .lg-reveal[data-delay="0"] { animation-delay: 0.05s; }
  .lg-reveal[data-delay="1"] { animation-delay: 0.12s; }
  .lg-reveal[data-delay="2"] { animation-delay: 0.19s; }
  .lg-reveal[data-delay="3"] { animation-delay: 0.26s; }
  .lg-reveal[data-delay="4"] { animation-delay: 0.33s; }
  .lg-reveal[data-delay="5"] { animation-delay: 0.40s; }

  /* ── Panel ── */
  .lg-panel {
    position: relative;
    z-index: 1;
    border: 1px solid var(--lg-border);
    border-radius: 4px;
    background: rgba(255, 255, 255, 0.04);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    padding: 3rem 2.5rem;
    max-width: 420px;
    width: 100%;
    overflow: hidden;
    transition: border-color 0.22s ease, box-shadow 0.22s ease;
  }
  .lg-panel:hover {
    border-color: rgba(255, 255, 255, 0.2);
    box-shadow: 0 8px 40px rgba(0, 0, 0, 0.4);
  }
  .lg-panel::before, .lg-panel::after {
    content: '';
    position: absolute;
    width: 10px; height: 10px;
    opacity: 0;
    transition: opacity 0.22s ease;
  }
  .lg-panel::before {
    top: -1px; left: -1px;
    border-top: 1px solid rgba(34, 197, 94, 0.7);
    border-left: 1px solid rgba(34, 197, 94, 0.7);
  }
  .lg-panel::after {
    bottom: -1px; right: -1px;
    border-bottom: 1px solid rgba(34, 197, 94, 0.7);
    border-right: 1px solid rgba(34, 197, 94, 0.7);
  }
  .lg-panel:hover::before,
  .lg-panel:hover::after { opacity: 1; }

  /* ── Eyebrow ── */
  .lg-eyebrow {
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: rgba(34, 197, 94, 0.8);
    margin-bottom: 0.75rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .lg-eyebrow::before, .lg-eyebrow::after {
    content: '';
    display: inline-block;
    width: 16px; height: 1px;
    background: var(--lg-green-light);
    opacity: 0.5;
  }

  /* ── Title ── */
  .lg-title {
    font-size: clamp(1.2rem, 3vw, 1.6rem);
    font-weight: 700;
    letter-spacing: -0.02em;
    color: #fff;
    line-height: 1.2;
    margin-bottom: 2rem;
    position: relative;
    display: inline-block;
  }
  .lg-title::after {
    content: '';
    position: absolute;
    bottom: -6px; left: 0;
    width: 100%; height: 2px;
    background: linear-gradient(90deg, var(--lg-green), var(--lg-green-light), var(--lg-green));
    background-size: 300%;
    animation:
      lg-gradient-shift 2.4s linear infinite,
      lg-line-grow 0.6s 0.25s cubic-bezier(0.22, 1, 0.36, 1) both;
    transform-origin: left;
  }

  /* ── Error ── */
  .lg-error {
    font-size: 0.78rem;
    letter-spacing: 0.03em;
    color: #fca5a5;
    background: rgba(185, 28, 28, 0.15);
    border: 1px solid rgba(185, 28, 28, 0.35);
    border-radius: 3px;
    padding: 0.65rem 0.9rem;
    margin-bottom: 1.25rem;
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
  }
  .lg-error::before { content: '!'; font-weight: 700; color: #fca5a5; flex-shrink: 0; }

  /* ── Field ── */
  .lg-field { display: flex; flex-direction: column; gap: 0.35rem; margin-bottom: 1rem; }
  .lg-label {
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.35);
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }
  .lg-label::before {
    content: '';
    display: inline-block;
    width: 12px; height: 1px;
    background: var(--lg-green-light);
    opacity: 0.6;
  }
  .lg-input {
    width: 100%;
    font-family: "Geist Mono", monospace;
    font-size: 0.85rem;
    color: #fff;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid var(--lg-border);
    border-radius: 3px;
    padding: 0.6rem 0.85rem;
    outline: none;
    transition: border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
    box-sizing: border-box;
  }
  .lg-input::placeholder { color: rgba(255, 255, 255, 0.2); }
  .lg-input:focus {
    border-color: rgba(34, 197, 94, 0.45);
    background: rgba(255, 255, 255, 0.07);
    box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.12);
  }

  /* ── Button ── */
  .lg-btn {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    font-family: "Geist Mono", monospace;
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 0.13em;
    text-transform: uppercase;
    padding: 0.7rem 1.4rem;
    border: 1px solid rgba(34, 197, 94, 0.45);
    border-radius: 3px;
    background: rgba(22, 163, 74, 0.15);
    cursor: pointer;
    color: #86efac;
    transition: border-color 0.18s ease, background 0.18s ease;
    overflow: hidden;
    margin-top: 0.5rem;
  }
  .lg-btn .corner-tl, .lg-btn .corner-br {
    position: absolute;
    width: 5px; height: 5px;
    opacity: 0;
    transition: opacity 0.18s ease;
    pointer-events: none;
  }
  .lg-btn .corner-tl { top: -1px; left: -1px; border-top: 1px solid rgba(255,255,255,0.4); border-left: 1px solid rgba(255,255,255,0.4); }
  .lg-btn .corner-br { bottom: -1px; right: -1px; border-bottom: 1px solid rgba(255,255,255,0.4); border-right: 1px solid rgba(255,255,255,0.4); }
  .lg-btn:hover:not(:disabled) .corner-tl,
  .lg-btn:hover:not(:disabled) .corner-br { opacity: 1; }
  .lg-btn .link-text { display: block; overflow: hidden; height: 1em; }
  .lg-btn .link-track { display: flex; flex-direction: column; transition: transform 0.4s cubic-bezier(0.76, 0, 0.24, 1); }
  .lg-btn:hover:not(:disabled) .link-track { transform: translateY(-50%); }
  .lg-btn .link-track span { display: block; height: 1em; line-height: 1em; }
  .lg-btn .link-track span:first-child { color: #86efac; }
  .lg-btn .link-track span:last-child  { color: #bbf7d0; }
  .lg-btn:hover:not(:disabled) { border-color: rgba(34,197,94,0.8); background: rgba(22,163,74,0.28); }
  .lg-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  /* ── Divider + footer ── */
  .lg-divider { height: 1px; background: rgba(255,255,255,0.08); margin: 1.5rem 0; }
  .lg-footer { text-align: center; font-size: 0.75rem; color: rgba(255,255,255,0.3); letter-spacing: 0.04em; }
  .lg-footer a { color: var(--lg-green-light); text-decoration: none; font-weight: 600; transition: color 0.15s ease; }
  .lg-footer a:hover { color: #bbf7d0; }
`;

/* ─── Component ───────────────────────────────────────────────────────────── */
const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const navigate                 = useNavigate();
  const dispatch                 = useDispatch();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await login(formData);
      dispatch(setCredentials(response.data));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="lg-page">
        <div className="lg-grid" />
        <div className="lg-panel">

          <p className="lg-eyebrow lg-reveal" data-delay="0">EcoTrack</p>
          <h2 className="lg-title lg-reveal" data-delay="1">Sign in</h2>

          <form onSubmit={handleSubmit}>
            {error && <div className="lg-error lg-reveal" data-delay="2">{error}</div>}

            <div className="lg-field lg-reveal" data-delay="2">
              <label htmlFor="email" className="lg-label">Email Address</label>
              <input id="email" name="email" type="email" required className="lg-input"
                placeholder="jane@example.com" value={formData.email} onChange={handleChange} />
            </div>

            <div className="lg-field lg-reveal" data-delay="3">
              <label htmlFor="password" className="lg-label">Password</label>
              <input id="password" name="password" type="password" required className="lg-input"
                placeholder="••••••••" value={formData.password} onChange={handleChange} />
            </div>

            <div className="lg-reveal" data-delay="4">
              <button type="submit" disabled={loading} className="lg-btn">
                <div className="corner-tl" />
                <div className="link-text">
                  <div className="link-track">
                    <span>{loading ? 'Signing in...' : 'Sign in'}</span>
                    <span>{loading ? 'Signing in...' : 'Sign in'}</span>
                  </div>
                </div>
                <div className="corner-br" />
              </button>
            </div>
          </form>

          <div className="lg-divider lg-reveal" data-delay="5" />
          <p className="lg-footer lg-reveal" data-delay="5">
            Don't have an account? <Link to="/signup">Sign up</Link>
          </p>

        </div>
      </div>
    </>
  );
};

export default Login;