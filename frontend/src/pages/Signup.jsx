import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { signup } from '../services/api';
import { setCredentials } from '../features/auth/authSlice';

/* ─── Styles ──────────────────────────────────────────────────────────────── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Geist+Mono:wght@300;400;600;700&display=swap');

  :root {
    --su-dark: #0e0e0e;
    --su-green: #16a34a;
    --su-green-light: #22c55e;
    --su-border: rgba(255, 255, 255, 0.12);
  }

  .su-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--su-dark);
    font-family: "Geist Mono", monospace;
    padding: 2rem 1.5rem;
    position: relative;
    overflow: hidden;
  }

  /* noise grain — mirrors home-hero::before */
  .su-page::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E");
    opacity: 0.045;
    pointer-events: none;
    z-index: 0;
  }

  /* green glow — mirrors home-hero::after */
  .su-page::after {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse 80% 60% at 50% 100%, rgba(22,163,74,0.18) 0%, transparent 70%);
    pointer-events: none;
    z-index: 0;
  }

  /* grid lines — mirrors home-hero-grid */
  .su-grid {
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
  @keyframes su-fade-up {
    from { opacity: 0; transform: translateY(22px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes su-line-grow {
    from { transform: scaleX(0); }
    to   { transform: scaleX(1); }
  }
  @keyframes su-gradient-shift {
    0%   { background-position: 0%; }
    100% { background-position: 300%; }
  }

  .su-reveal {
    opacity: 0;
    animation: su-fade-up 0.55s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  }
  .su-reveal[data-delay="0"] { animation-delay: 0.05s; }
  .su-reveal[data-delay="1"] { animation-delay: 0.12s; }
  .su-reveal[data-delay="2"] { animation-delay: 0.19s; }
  .su-reveal[data-delay="3"] { animation-delay: 0.26s; }
  .su-reveal[data-delay="4"] { animation-delay: 0.33s; }
  .su-reveal[data-delay="5"] { animation-delay: 0.40s; }
  .su-reveal[data-delay="6"] { animation-delay: 0.47s; }

  /* ── Panel ── */
  .su-panel {
    position: relative;
    z-index: 1;
    border: 1px solid var(--su-border);
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
  .su-panel:hover {
    border-color: rgba(255, 255, 255, 0.2);
    box-shadow: 0 8px 40px rgba(0, 0, 0, 0.4);
  }
  .su-panel::before, .su-panel::after {
    content: '';
    position: absolute;
    width: 10px; height: 10px;
    opacity: 0;
    transition: opacity 0.22s ease;
  }
  .su-panel::before {
    top: -1px; left: -1px;
    border-top: 1px solid rgba(34, 197, 94, 0.7);
    border-left: 1px solid rgba(34, 197, 94, 0.7);
  }
  .su-panel::after {
    bottom: -1px; right: -1px;
    border-bottom: 1px solid rgba(34, 197, 94, 0.7);
    border-right: 1px solid rgba(34, 197, 94, 0.7);
  }
  .su-panel:hover::before,
  .su-panel:hover::after { opacity: 1; }

  /* ── Eyebrow ── */
  .su-eyebrow {
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
  .su-eyebrow::before, .su-eyebrow::after {
    content: '';
    display: inline-block;
    width: 16px; height: 1px;
    background: var(--su-green-light);
    opacity: 0.5;
  }

  /* ── Title ── */
  .su-title {
    font-size: clamp(1.2rem, 3vw, 1.6rem);
    font-weight: 700;
    letter-spacing: -0.02em;
    color: #fff;
    line-height: 1.2;
    margin-bottom: 2rem;
    position: relative;
    display: inline-block;
  }
  .su-title::after {
    content: '';
    position: absolute;
    bottom: -6px; left: 0;
    width: 100%; height: 2px;
    background: linear-gradient(90deg, var(--su-green), var(--su-green-light), var(--su-green));
    background-size: 300%;
    animation:
      su-gradient-shift 2.4s linear infinite,
      su-line-grow 0.6s 0.25s cubic-bezier(0.22, 1, 0.36, 1) both;
    transform-origin: left;
  }

  /* ── Error ── */
  .su-error {
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
  .su-error::before { content: '!'; font-weight: 700; color: #fca5a5; flex-shrink: 0; }

  /* ── Field ── */
  .su-field { display: flex; flex-direction: column; gap: 0.35rem; margin-bottom: 1rem; }
  .su-label {
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.35);
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }
  .su-label::before {
    content: '';
    display: inline-block;
    width: 12px; height: 1px;
    background: var(--su-green-light);
    opacity: 0.6;
  }
  .su-input {
    width: 100%;
    font-family: "Geist Mono", monospace;
    font-size: 0.85rem;
    color: #fff;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid var(--su-border);
    border-radius: 3px;
    padding: 0.6rem 0.85rem;
    outline: none;
    transition: border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
    box-sizing: border-box;
  }
  .su-input::placeholder { color: rgba(255, 255, 255, 0.2); }
  .su-input:focus {
    border-color: rgba(34, 197, 94, 0.45);
    background: rgba(255, 255, 255, 0.07);
    box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.12);
  }

  /* ── Button ── */
  .su-btn {
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
  .su-btn .corner-tl, .su-btn .corner-br {
    position: absolute;
    width: 5px; height: 5px;
    opacity: 0;
    transition: opacity 0.18s ease;
    pointer-events: none;
  }
  .su-btn .corner-tl { top: -1px; left: -1px; border-top: 1px solid rgba(255,255,255,0.4); border-left: 1px solid rgba(255,255,255,0.4); }
  .su-btn .corner-br { bottom: -1px; right: -1px; border-bottom: 1px solid rgba(255,255,255,0.4); border-right: 1px solid rgba(255,255,255,0.4); }
  .su-btn:hover:not(:disabled) .corner-tl,
  .su-btn:hover:not(:disabled) .corner-br { opacity: 1; }
  .su-btn .link-text { display: block; overflow: hidden; height: 1em; }
  .su-btn .link-track { display: flex; flex-direction: column; transition: transform 0.4s cubic-bezier(0.76, 0, 0.24, 1); }
  .su-btn:hover:not(:disabled) .link-track { transform: translateY(-50%); }
  .su-btn .link-track span { display: block; height: 1em; line-height: 1em; }
  .su-btn .link-track span:first-child { color: #86efac; }
  .su-btn .link-track span:last-child  { color: #bbf7d0; }
  .su-btn:hover:not(:disabled) { border-color: rgba(34,197,94,0.8); background: rgba(22,163,74,0.28); }
  .su-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  /* ── Divider + footer ── */
  .su-divider { height: 1px; background: rgba(255,255,255,0.08); margin: 1.5rem 0; }
  .su-footer { text-align: center; font-size: 0.75rem; color: rgba(255,255,255,0.3); letter-spacing: 0.04em; }
  .su-footer a { color: var(--su-green-light); text-decoration: none; font-weight: 600; transition: color 0.15s ease; }
  .su-footer a:hover { color: #bbf7d0; }
`;

/* ─── Component ───────────────────────────────────────────────────────────── */
const Signup = () => {
  const [formData, setFormData] = useState({ email: '', password: '', full_name: '' });
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
      const response = await signup(formData);
      dispatch(setCredentials(response.data));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="su-page">
        <div className="su-grid" />
        <div className="su-panel">

          <p className="su-eyebrow su-reveal" data-delay="0">EcoTrack</p>
          <h2 className="su-title su-reveal" data-delay="1">Create your account</h2>

          <form onSubmit={handleSubmit}>
            {error && <div className="su-error su-reveal" data-delay="2">{error}</div>}

            <div className="su-field su-reveal" data-delay="2">
              <label htmlFor="full_name" className="su-label">Full Name</label>
              <input id="full_name" name="full_name" type="text" required className="su-input"
                placeholder="Jane Doe" value={formData.full_name} onChange={handleChange} />
            </div>

            <div className="su-field su-reveal" data-delay="3">
              <label htmlFor="email" className="su-label">Email Address</label>
              <input id="email" name="email" type="email" required className="su-input"
                placeholder="jane@example.com" value={formData.email} onChange={handleChange} />
            </div>

            <div className="su-field su-reveal" data-delay="4">
              <label htmlFor="password" className="su-label">Password</label>
              <input id="password" name="password" type="password" required minLength={6}
                className="su-input" placeholder="Min 6 characters"
                value={formData.password} onChange={handleChange} />
            </div>

            <div className="su-reveal" data-delay="5">
              <button type="submit" disabled={loading} className="su-btn">
                <div className="corner-tl" />
                <div className="link-text">
                  <div className="link-track">
                    <span>{loading ? 'Creating account...' : 'Sign up'}</span>
                    <span>{loading ? 'Creating account...' : 'Sign up'}</span>
                  </div>
                </div>
                <div className="corner-br" />
              </button>
            </div>
          </form>

          <div className="su-divider su-reveal" data-delay="6" />
          <p className="su-footer su-reveal" data-delay="6">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>

        </div>
      </div>
    </>
  );
};

export default Signup;