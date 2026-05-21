import React from 'react';
import { Link } from 'react-router-dom';

/* ─── Styles ──────────────────────────────────────────────────────────────── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;600;700&display=swap');

  :root {
    --nf-link-color: rgba(30, 30, 30, 0.7);
    --nf-link-hover: #111;
    --nf-box-border: rgba(0, 0, 0, 0.18);
    --nf-green: #16a34a;
    --nf-green-light: #22c55e;
  }

  /* ── Page shell ── */
  .nf-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f9f9f7;
    font-family: "Geist Mono", monospace;
    padding: 2rem;
  }

  /* ── Keyframes ── */
  @keyframes nf-fade-up {
    from { opacity: 0; transform: translateY(22px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @keyframes nf-line-grow {
    from { transform: scaleX(0); }
    to   { transform: scaleX(1); }
  }

  @keyframes nf-gradient-shift {
    0%   { background-position: 0%; }
    100% { background-position: 300%; }
  }

  @keyframes nf-glitch {
    0%, 100% { clip-path: inset(0 0 100% 0); transform: translateX(0); }
    10%       { clip-path: inset(10% 0 60% 0); transform: translateX(-4px); }
    20%       { clip-path: inset(40% 0 30% 0); transform: translateX(4px); }
    30%       { clip-path: inset(70% 0 10% 0); transform: translateX(-2px); }
    40%       { clip-path: inset(0 0 100% 0); transform: translateX(0); }
  }

  /* ── Staggered reveal ── */
  .nf-reveal {
    opacity: 0;
    animation: nf-fade-up 0.55s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  }
  .nf-reveal[data-delay="0"] { animation-delay: 0.05s; }
  .nf-reveal[data-delay="1"] { animation-delay: 0.15s; }
  .nf-reveal[data-delay="2"] { animation-delay: 0.25s; }
  .nf-reveal[data-delay="3"] { animation-delay: 0.35s; }

  /* ── Panel ── */
  .nf-panel {
    position: relative;
    border: 1px solid var(--nf-box-border);
    border-radius: 4px;
    background: #fff;
    padding: 4rem 3.5rem;
    text-align: center;
    max-width: 480px;
    width: 100%;
    overflow: hidden;
    transition: border-color 0.22s ease, box-shadow 0.22s ease;
  }

  .nf-panel:hover {
    border-color: rgba(0, 0, 0, 0.28);
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
  }

  /* corner accents */
  .nf-panel::before,
  .nf-panel::after {
    content: '';
    position: absolute;
    width: 10px;
    height: 10px;
    opacity: 0;
    transition: opacity 0.22s ease;
  }
  .nf-panel::before {
    top: -1px; left: -1px;
    border-top: 1px solid rgba(22, 163, 74, 0.7);
    border-left: 1px solid rgba(22, 163, 74, 0.7);
  }
  .nf-panel::after {
    bottom: -1px; right: -1px;
    border-bottom: 1px solid rgba(22, 163, 74, 0.7);
    border-right: 1px solid rgba(22, 163, 74, 0.7);
  }
  .nf-panel:hover::before,
  .nf-panel:hover::after { opacity: 1; }

  /* ── 404 number ── */
  .nf-code {
    position: relative;
    font-size: clamp(5rem, 18vw, 7rem);
    font-weight: 700;
    color: #111;
    letter-spacing: -0.04em;
    line-height: 1;
    margin-bottom: 0.25rem;
    display: inline-block;
  }

  /* glitch ghost layer */
  .nf-code::before {
    content: '404';
    position: absolute;
    inset: 0;
    color: var(--nf-green);
    opacity: 0.18;
    animation: nf-glitch 4s 1.5s ease-in-out infinite;
    pointer-events: none;
  }

  /* animated underline beneath 404 */
  .nf-code::after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 0;
    width: 100%;
    height: 2px;
    background: linear-gradient(90deg, var(--nf-green), var(--nf-green-light), var(--nf-green));
    background-size: 300%;
    animation:
      nf-gradient-shift 2.4s linear infinite,
      nf-line-grow 0.6s 0.3s cubic-bezier(0.22, 1, 0.36, 1) both;
    transform-origin: left;
  }

  /* ── Label above 404 ── */
  .nf-eyebrow {
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: rgba(22, 163, 74, 0.8);
    margin-bottom: 0.75rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }
  .nf-eyebrow::before,
  .nf-eyebrow::after {
    content: '';
    display: inline-block;
    width: 20px;
    height: 1px;
    background: var(--nf-green);
    opacity: 0.5;
  }

  /* ── Subtitle ── */
  .nf-subtitle {
    font-size: 0.88rem;
    color: rgba(0, 0, 0, 0.45);
    letter-spacing: 0.04em;
    margin-top: 1.25rem;
    margin-bottom: 2.5rem;
    line-height: 1.6;
  }

  /* ── CTA button (matching dash-btn style) ── */
  .nf-btn {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-family: "Geist Mono", monospace;
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 0.13em;
    text-transform: uppercase;
    text-decoration: none;
    padding: 0.6rem 1.4rem;
    border: 1px solid rgba(22, 163, 74, 0.4);
    border-radius: 3px;
    background: rgba(22, 163, 74, 0.06);
    cursor: pointer;
    color: rgba(22, 163, 74, 0.85);
    transition: border-color 0.18s ease, background 0.18s ease, color 0.18s ease;
    white-space: nowrap;
    overflow: hidden;
  }

  .nf-btn .corner-tl,
  .nf-btn .corner-br {
    position: absolute;
    width: 5px;
    height: 5px;
    opacity: 0;
    transition: opacity 0.18s ease;
    pointer-events: none;
  }
  .nf-btn .corner-tl {
    top: -1px; left: -1px;
    border-top: 1px solid rgba(0, 0, 0, 0.5);
    border-left: 1px solid rgba(0, 0, 0, 0.5);
  }
  .nf-btn .corner-br {
    bottom: -1px; right: -1px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.5);
    border-right: 1px solid rgba(0, 0, 0, 0.5);
  }
  .nf-btn:hover .corner-tl,
  .nf-btn:hover .corner-br { opacity: 1; }

  .nf-btn .link-text {
    display: block;
    overflow: hidden;
    height: 1em;
  }
  .nf-btn .link-track {
    display: flex;
    flex-direction: column;
    transition: transform 0.4s cubic-bezier(0.76, 0, 0.24, 1);
  }
  .nf-btn:hover .link-track { transform: translateY(-50%); }
  .nf-btn .link-track span {
    display: block;
    height: 1em;
    line-height: 1em;
  }
  .nf-btn .link-track span:first-child { color: rgba(22, 163, 74, 0.85); }
  .nf-btn .link-track span:last-child  { color: #15803d; }

  .nf-btn:hover {
    border-color: rgba(22, 163, 74, 0.7);
    background: rgba(22, 163, 74, 0.12);
  }
`;

/* ─── Component ───────────────────────────────────────────────────────────── */
const NotFound = () => {
  return (
    <>
      <style>{styles}</style>

      <div className="nf-page">
        <div className="nf-panel">

          <p className="nf-eyebrow nf-reveal" data-delay="0">Error</p>

          <h1 className="nf-code nf-reveal" data-delay="1">404</h1>

          <p className="nf-subtitle nf-reveal" data-delay="2">
            Page not found
          </p>

          <div className="nf-reveal" data-delay="3">
            <Link to="/" className="nf-btn">
              <div className="corner-tl" />
              <div className="link-text">
                <div className="link-track">
                  <span>Go Home</span>
                  <span>Go Home</span>
                </div>
              </div>
              <div className="corner-br" />
            </Link>
          </div>

        </div>
      </div>
    </>
  );
};

export default NotFound;