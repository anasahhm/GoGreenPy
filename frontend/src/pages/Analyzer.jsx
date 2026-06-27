import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { calculateImpact } from '../services/api';
import { useWeatherData } from '../components/WeatherWidget';
import RewardSummaryWidget from '../components/rewards/RewardSummaryWidget';
import RewardUnlockPopup from '../components/rewards/RewardUnlockPopup';

/* ─── Styles ────────────────────────────────────────────────────────────── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;600;700&display=swap');

  :root {
    --az-nav-h: 68px;
    --az-green: #16a34a;
    --az-green-light: #22c55e;
    --az-border: rgba(0, 0, 0, 0.12);
    --az-box-bg: rgba(0, 0, 0, 0.04);
    --az-link: rgba(30, 30, 30, 0.65);
    --az-link-hover: #111;
  }

  @keyframes az-fade-up {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes az-line-grow {
    from { transform: scaleX(0); }
    to   { transform: scaleX(1); }
  }
  @keyframes az-gradient-shift {
    0%   { background-position: 0%; }
    100% { background-position: 300%; }
  }
  @keyframes az-result-in {
    from { opacity: 0; transform: translateY(28px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes az-score-pop {
    0%   { opacity: 0; transform: scale(0.88); }
    60%  { transform: scale(1.04); }
    100% { opacity: 1; transform: scale(1); }
  }
  @keyframes az-tip-in {
    from { opacity: 0; transform: translateX(-10px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes az-spin {
    to { transform: rotate(360deg); }
  }

  .az-page {
    max-width: 1000px;
    margin: 0 auto;
    padding: calc(var(--az-nav-h) + 2.5rem) 1.5rem 5rem;
    font-family: "Geist Mono", monospace;
  }

  .az-reveal {
    opacity: 0;
    animation: az-fade-up 0.55s cubic-bezier(0.22,1,0.36,1) forwards;
  }
  .az-reveal[data-delay="0"] { animation-delay: 0.05s; }
  .az-reveal[data-delay="1"] { animation-delay: 0.13s; }
  .az-reveal[data-delay="2"] { animation-delay: 0.21s; }

  .az-title {
    font-size: clamp(1.4rem, 3vw, 2rem);
    font-weight: 700;
    letter-spacing: -0.02em;
    color: #111;
    line-height: 1;
    position: relative;
    display: inline-block;
    margin-bottom: 2.5rem;
  }
  .az-title::after {
    content: '';
    position: absolute;
    bottom: -6px; left: 0;
    width: 100%; height: 2px;
    background: linear-gradient(90deg, var(--az-green), var(--az-green-light), var(--az-green));
    background-size: 300%;
    animation: az-gradient-shift 2.4s linear infinite,
               az-line-grow 0.6s 0.15s cubic-bezier(0.22,1,0.36,1) both;
    transform-origin: left;
  }

  .az-panel {
    position: relative;
    border: 1px solid var(--az-border);
    border-radius: 4px;
    background: #fff;
    padding: 2rem;
    margin-bottom: 1.5rem;
    overflow: hidden;
    transition: border-color 0.22s ease, box-shadow 0.22s ease;
  }
  .az-panel:hover {
    border-color: rgba(0,0,0,0.2);
    box-shadow: 0 4px 24px rgba(0,0,0,0.05);
  }
  .az-panel::before,
  .az-panel::after {
    content: '';
    position: absolute;
    width: 8px; height: 8px;
    opacity: 0;
    transition: opacity 0.22s ease;
    pointer-events: none;
    z-index: 2;
  }
  .az-panel::before {
    top: -1px; left: -1px;
    border-top: 1px solid rgba(22,163,74,0.65);
    border-left: 1px solid rgba(22,163,74,0.65);
  }
  .az-panel::after {
    bottom: -1px; right: -1px;
    border-bottom: 1px solid rgba(22,163,74,0.65);
    border-right: 1px solid rgba(22,163,74,0.65);
  }
  .az-panel:hover::before,
  .az-panel:hover::after { opacity: 1; }

  .az-section-label {
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: rgba(0,0,0,0.35);
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1.25rem;
  }
  .az-section-label::before {
    content: '';
    display: inline-block;
    width: 16px; height: 1px;
    background: var(--az-green);
    opacity: 0.7;
  }

  .az-subsection {
    margin-top: 1.5rem;
    padding-top: 1.25rem;
    border-top: 1px solid rgba(0,0,0,0.07);
  }
  .az-subsection-label {
    font-size: 0.6rem;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: rgba(0,0,0,0.28);
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }
  .az-subsection-label::before {
    content: '';
    display: inline-block;
    width: 10px; height: 1px;
    background: rgba(0,0,0,0.25);
  }

  .az-form-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.25rem;
    margin-bottom: 1.75rem;
  }
  .az-form-grid-3 {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.25rem;
  }
  @media (max-width: 700px) {
    .az-form-grid, .az-form-grid-3 { grid-template-columns: 1fr; }
  }

  .az-field {
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
  }

  .az-label {
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: rgba(0,0,0,0.45);
  }
  .az-label-hint {
    font-size: 0.6rem;
    font-weight: 400;
    color: rgba(0,0,0,0.3);
    margin-left: 0.3rem;
    text-transform: none;
    letter-spacing: 0;
  }

  .az-input,
  .az-select {
    font-family: "Geist Mono", monospace;
    font-size: 0.82rem;
    font-weight: 600;
    color: #111;
    width: 100%;
    padding: 0.55rem 0.85rem;
    border: 1px solid var(--az-border);
    border-radius: 3px;
    background: #fff;
    outline: none;
    transition: border-color 0.18s ease, box-shadow 0.18s ease;
    appearance: none;
    -webkit-appearance: none;
    box-sizing: border-box;
  }
  .az-input:focus,
  .az-select:focus {
    border-color: rgba(22,163,74,0.55);
    box-shadow: 0 0 0 3px rgba(22,163,74,0.08);
  }
  .az-input:hover:not(:focus),
  .az-select:hover:not(:focus) {
    border-color: rgba(0,0,0,0.22);
  }
  .az-input[type="range"] {
    padding: 0.4rem 0;
    cursor: pointer;
    border: none;
    box-shadow: none;
    background: transparent;
  }
  .az-input[type="range"]:focus { box-shadow: none; border: none; }

  .az-select-wrap {
    position: relative;
  }
  .az-select-wrap::after {
    content: '▾';
    position: absolute;
    right: 0.85rem;
    top: 50%;
    transform: translateY(-50%);
    font-size: 0.7rem;
    color: rgba(0,0,0,0.35);
    pointer-events: none;
  }

  .az-range-row {
    display: flex;
    align-items: center;
    gap: 0.6rem;
  }
  .az-range-val {
    font-size: 0.78rem;
    font-weight: 700;
    color: var(--az-green);
    min-width: 2.5rem;
    text-align: right;
    white-space: nowrap;
  }

  .az-error {
    border: 1px solid rgba(185,28,28,0.3);
    background: rgba(185,28,28,0.05);
    border-radius: 3px;
    padding: 0.7rem 1rem;
    font-size: 0.78rem;
    color: #b91c1c;
    letter-spacing: 0.03em;
    margin-bottom: 1.25rem;
    animation: az-fade-up 0.3s ease;
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
  }
  .az-error::before { content: '!'; font-weight: 700; flex-shrink: 0; margin-top: 0.02rem; }

  .az-weather-banner {
    border: 1px solid rgba(22,163,74,0.2);
    border-radius: 3px;
    background: rgba(22,163,74,0.03);
    padding: 0.75rem 1rem;
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
  }
  .az-weather-label {
    font-size: 0.6rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--az-green);
    white-space: nowrap;
  }
  .az-weather-chips {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    flex: 1;
  }
  .az-weather-chip {
    font-size: 0.65rem;
    font-weight: 600;
    padding: 0.2rem 0.55rem;
    border: 1px solid rgba(0,0,0,0.1);
    border-radius: 3px;
    color: rgba(0,0,0,0.55);
    background: rgba(0,0,0,0.03);
  }
  .az-weather-chip strong {
    color: #111;
    font-weight: 700;
  }

  .az-submit {
    position: relative;
    width: 100%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-family: "Geist Mono", monospace;
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 0.13em;
    text-transform: uppercase;
    padding: 0.75rem 1.5rem;
    border: 1px solid rgba(22,163,74,0.4);
    border-radius: 3px;
    background: rgba(22,163,74,0.07);
    cursor: pointer;
    color: rgba(22,163,74,0.9);
    transition: border-color 0.18s ease, background 0.18s ease, color 0.18s ease;
    overflow: hidden;
    margin-top: 1.5rem;
  }
  .az-submit:hover:not(:disabled) {
    border-color: rgba(22,163,74,0.7);
    background: rgba(22,163,74,0.13);
    color: #15803d;
  }
  .az-submit:disabled { opacity: 0.55; cursor: not-allowed; }

  .az-submit .corner-tl,
  .az-submit .corner-br {
    position: absolute;
    width: 5px; height: 5px;
    opacity: 0;
    transition: opacity 0.18s ease;
    pointer-events: none;
  }
  .az-submit .corner-tl {
    top: -1px; left: -1px;
    border-top: 1px solid rgba(22,163,74,0.65);
    border-left: 1px solid rgba(22,163,74,0.65);
  }
  .az-submit .corner-br {
    bottom: -1px; right: -1px;
    border-bottom: 1px solid rgba(22,163,74,0.65);
    border-right: 1px solid rgba(22,163,74,0.65);
  }
  .az-submit:hover:not(:disabled) .corner-tl,
  .az-submit:hover:not(:disabled) .corner-br { opacity: 1; }

  .az-submit .link-text { display: block; overflow: hidden; height: 1em; }
  .az-submit .link-track {
    display: flex; flex-direction: column;
    transition: transform 0.4s cubic-bezier(0.76,0,0.24,1);
  }
  .az-submit:hover:not(:disabled) .link-track { transform: translateY(-50%); }
  .az-submit .link-track span { display: block; height: 1em; line-height: 1em; }
  .az-submit .link-track span:first-child { color: rgba(22,163,74,0.85); }
  .az-submit .link-track span:last-child  { color: #15803d; }

  .az-spinner {
    display: inline-block;
    width: 12px; height: 12px;
    border: 2px solid rgba(22,163,74,0.25);
    border-top-color: var(--az-green);
    border-radius: 50%;
    animation: az-spin 0.7s linear infinite;
    margin-right: 0.5rem;
  }

  .az-result { animation: az-result-in 0.5s cubic-bezier(0.22,1,0.36,1) both; }

  .az-score-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.85rem;
    margin-bottom: 1.75rem;
  }
  @media (max-width: 700px) { .az-score-grid { grid-template-columns: repeat(2,1fr); } }
  @media (max-width: 420px) { .az-score-grid { grid-template-columns: 1fr; } }

  .az-score-card {
    border: 1px solid var(--az-border);
    border-radius: 3px;
    padding: 1rem;
    background: #fff;
    position: relative;
    overflow: hidden;
    transition: border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
    animation: az-score-pop 0.45s cubic-bezier(0.22,1,0.36,1) both;
  }
  .az-score-card:hover {
    border-color: rgba(0,0,0,0.22);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0,0,0,0.07);
  }
  .az-score-card::after {
    content: '';
    position: absolute;
    bottom: 0; left: 0; right: 0;
    height: 2px;
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.3s cubic-bezier(0.22,1,0.36,1);
  }
  .az-score-card:hover::after { transform: scaleX(1); }
  .az-score-card.carbon::after { background: linear-gradient(90deg,#3b82f6,#60a5fa); }
  .az-score-card.water::after  { background: linear-gradient(90deg,#06b6d4,#67e8f9); }
  .az-score-card.energy::after { background: linear-gradient(90deg,#f59e0b,#fcd34d); }
  .az-score-card.waste::after  { background: linear-gradient(90deg,#6b7280,#9ca3af); }

  .az-score-label {
    font-size: 0.62rem; font-weight: 700;
    letter-spacing: 0.14em; text-transform: uppercase;
    color: rgba(0,0,0,0.38); margin-bottom: 0.4rem;
  }
  .az-score-value { font-size: 1.35rem; font-weight: 700; letter-spacing: -0.02em; line-height: 1; }
  .az-score-value.carbon { color: #2563eb; }
  .az-score-value.water  { color: #0891b2; }
  .az-score-value.energy { color: #d97706; }
  .az-score-value.waste  { color: #4b5563; }
  .az-score-unit { font-size: 0.65rem; font-weight: 600; color: rgba(0,0,0,0.35); margin-top: 0.15rem; }

  .az-breakdown { margin-bottom: 1.75rem; }
  .az-breakdown-bar-wrap {
    display: flex;
    gap: 2px;
    height: 8px;
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 0.75rem;
  }
  .az-breakdown-seg { height: 100%; transition: flex 0.5s ease; }
  .az-breakdown-legend { display: flex; flex-wrap: wrap; gap: 0.5rem 1rem; }
  .az-breakdown-item {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    font-size: 0.65rem;
    color: rgba(0,0,0,0.5);
  }
  .az-breakdown-dot { width: 8px; height: 8px; border-radius: 2px; flex-shrink: 0; }
  .az-breakdown-pct { font-weight: 700; color: #111; }

  .az-rating-value {
    font-size: clamp(2rem, 5vw, 3rem);
    font-weight: 700;
    letter-spacing: -0.03em;
    line-height: 1;
    margin-bottom: 0.25rem;
  }
  .az-rating-value.Excellent { color: #15803d; }
  .az-rating-value.Good      { color: #1d4ed8; }
  .az-rating-value.Moderate  { color: #b45309; }
  .az-rating-value.Poor      { color: #c2410c; }
  .az-rating-value.Critical  { color: #b91c1c; }

  .az-ai-block {
    border: 1px solid rgba(22,163,74,0.2);
    border-radius: 3px;
    background: rgba(22,163,74,0.03);
    padding: 1.25rem 1.25rem 1.25rem 1rem;
    margin-bottom: 1.5rem;
    position: relative;
    overflow: hidden;
    animation: az-fade-up 0.45s 0.3s ease both;
  }
  .az-ai-block::before {
    content: '';
    position: absolute;
    left: 0; top: 0; bottom: 0;
    width: 2px;
    background: linear-gradient(180deg, var(--az-green), var(--az-green-light));
  }
  .az-ai-label {
    font-size: 0.62rem; font-weight: 700;
    letter-spacing: 0.14em; text-transform: uppercase;
    color: var(--az-green); margin-bottom: 0.6rem;
    display: flex; align-items: center; gap: 0.4rem;
  }
  .az-ai-text { font-size: 0.8rem; line-height: 1.7; color: #333; font-weight: 400; }

  .az-weather-result {
    border: 1px solid rgba(0,119,182,0.18);
    border-radius: 3px;
    background: rgba(0,119,182,0.03);
    padding: 0.9rem 1rem;
    margin-bottom: 1.5rem;
    position: relative;
    padding-left: 1rem;
  }
  .az-weather-result::before {
    content: '';
    position: absolute;
    left: 0; top: 0; bottom: 0;
    width: 2px;
    background: linear-gradient(180deg, #0077b6, #48cae4);
  }

  .az-tip {
    display: flex;
    align-items: flex-start;
    gap: 0.6rem;
    font-size: 0.8rem;
    color: #333;
    line-height: 1.55;
    padding: 0.45rem 0;
    border-bottom: 1px solid rgba(0,0,0,0.055);
    opacity: 0;
    animation: az-tip-in 0.38s cubic-bezier(0.22,1,0.36,1) forwards;
  }
  .az-tip:last-child { border-bottom: none; }
  .az-tip-arrow { color: var(--az-green); font-size: 0.7rem; margin-top: 0.2rem; flex-shrink: 0; }
  .az-tip-tag {
    font-size: 0.58rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 0.1rem 0.35rem;
    border-radius: 2px;
    flex-shrink: 0;
    margin-top: 0.15rem;
  }
  .az-tip-tag.weather   { background: rgba(0,119,182,0.1); color: #0077b6; }
  .az-tip-tag.energy    { background: rgba(245,158,11,0.12); color: #b45309; }
  .az-tip-tag.diet      { background: rgba(22,163,74,0.1); color: #15803d; }
  .az-tip-tag.transport { background: rgba(99,102,241,0.1); color: #4338ca; }
  .az-tip-tag.waste     { background: rgba(107,114,128,0.12); color: #374151; }

  .az-dash-btn {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    font-family: "Geist Mono", monospace;
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 0.13em;
    text-transform: uppercase;
    padding: 0.7rem 1.5rem;
    border: 1px solid var(--az-border);
    border-radius: 3px;
    background: none;
    cursor: pointer;
    color: var(--az-link);
    margin-top: 1.5rem;
    overflow: hidden;
    transition: border-color 0.18s ease, background 0.18s ease;
  }
  .az-dash-btn:hover {
    border-color: rgba(0,0,0,0.26);
    background: var(--az-box-bg);
  }
  .az-dash-btn .corner-tl,
  .az-dash-btn .corner-br {
    position: absolute;
    width: 5px; height: 5px;
    opacity: 0;
    transition: opacity 0.18s ease;
  }
  .az-dash-btn .corner-tl { top: -1px; left: -1px; border-top: 1px solid rgba(0,0,0,0.45); border-left: 1px solid rgba(0,0,0,0.45); }
  .az-dash-btn .corner-br { bottom: -1px; right: -1px; border-bottom: 1px solid rgba(0,0,0,0.45); border-right: 1px solid rgba(0,0,0,0.45); }
  .az-dash-btn:hover .corner-tl,
  .az-dash-btn:hover .corner-br { opacity: 1; }
  .az-dash-btn .link-text { display: block; overflow: hidden; height: 1em; }
  .az-dash-btn .link-track { display: flex; flex-direction: column; transition: transform 0.4s cubic-bezier(0.76,0,0.24,1); }
  .az-dash-btn:hover .link-track { transform: translateY(-50%); }
  .az-dash-btn .link-track span { display: block; height: 1em; line-height: 1em; }
  .az-dash-btn .link-track span:first-child { color: var(--az-link); }
  .az-dash-btn .link-track span:last-child  { color: var(--az-link-hover); }
`;

/* ─── helpers ─────────────────────────────────────────────────────────────── */
const Field = ({ label, hint, children }) => (
  <div className="az-field">
    <label className="az-label">
      {label}
      {hint && <span className="az-label-hint">({hint})</span>}
    </label>
    {children}
  </div>
);

const RangeField = ({ label, hint, name, min, max, step, value, unit, onChange }) => (
  <div className="az-field">
    <label className="az-label">
      {label}
      {hint && <span className="az-label-hint">({hint})</span>}
    </label>
    <div className="az-range-row">
      <input
        type="range"
        name={name}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={onChange}
        className="az-input"
        style={{ flex: 1 }}
      />
      <span className="az-range-val">{value}{unit}</span>
    </div>
  </div>
);

const BREAKDOWN_COLORS = {
  transport:   '#3b82f6',
  electricity: '#f59e0b',
  diet:        '#16a34a',
  waste:       '#6b7280',
  flights:     '#8b5cf6',
  heating:     '#ef4444',
};

/* ─── Extract a readable error message from any axios error ──────────────── */
const extractErrorMessage = (err) => {
  // Network / CORS — no response at all
  if (!err.response) {
    return `Network error: ${err.message || 'Could not reach the server. Check that the backend is running.'}`;
  }

  const { status, data } = err.response;

  // 401 / 403 — auth
  if (status === 401) return 'Session expired. Please log in again.';
  if (status === 403) return 'You do not have permission to perform this action.';

  // FastAPI validation errors come as { detail: [ { loc, msg, type } ] }
  if (Array.isArray(data?.detail)) {
    return data.detail
      .map((e) => `${e.loc?.slice(1).join(' → ') ?? 'field'}: ${e.msg}`)
      .join(' | ');
  }

  // Plain string detail
  if (typeof data?.detail === 'string') return data.detail;

  // Fallback
  return `Server error (${status}). Please try again.`;
};

/* ─── Component ───────────────────────────────────────────────────────────── */
const Analyzer = () => {
  const [formData, setFormData] = useState({
    transport_method:    'car',
    transport_km:        0,
    electricity_kwh:     0,
    water_liters:        150,
    diet_type:           'mixed',
    waste_kg:            0.5,
    renewable_pct:       0,
    flights_per_year:    0,
    heating_fuel:        'none',
    heating_hours:       0,
    meat_meals_per_week: 7,
    plant_based_swaps:   0,
    new_clothing_items:  0,
    online_orders:       0,
    screen_hours:        4,
    recycling_pct:       50,
  });

  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const navigate = useNavigate();

  const { weather } = useWeatherData(import.meta.env.VITE_OWM_API_KEY);

  const handleChange = (e) => {
    const val =
      e.target.type === 'range' || e.target.type === 'number'
        ? parseFloat(e.target.value)
        : e.target.value;
    setFormData((prev) => ({ ...prev, [e.target.name]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);

    try {
      const payload = {
        transport_method:    formData.transport_method,
        transport_km:        parseFloat(formData.transport_km)        || 0,
        electricity_kwh:     parseFloat(formData.electricity_kwh)     || 0,
        water_liters:        parseFloat(formData.water_liters)        || 0,
        diet_type:           formData.diet_type,
        waste_kg:            parseFloat(formData.waste_kg)            || 0,
        renewable_pct:       parseFloat(formData.renewable_pct)       || 0,
        flights_per_year:    parseFloat(formData.flights_per_year)    || 0,
        heating_fuel:        formData.heating_fuel,
        heating_hours:       parseFloat(formData.heating_hours)       || 0,
        meat_meals_per_week: parseFloat(formData.meat_meals_per_week) || 0,
        plant_based_swaps:   parseInt(formData.plant_based_swaps, 10) || 0,
        new_clothing_items:  parseFloat(formData.new_clothing_items)  || 0,
        online_orders:       parseFloat(formData.online_orders)       || 0,
        screen_hours:        parseFloat(formData.screen_hours)        || 0,
        recycling_pct:       parseFloat(formData.recycling_pct)       || 0,
        weather_context: weather
          ? {
              temp:      weather.temp,
              humidity:  weather.humidity,
              aqi:       weather.aqi       ?? null,
              uv_index:  weather.uvIndex   ?? null,
              condition: weather.condition ?? null,
              city:      weather.cityName  ?? null,
            }
          : null,
      };

      const response = await calculateImpact(payload);

      // Support both { data: ... } (axios) and plain object responses
      const data = response?.data ?? response;
      if (!data || typeof data !== 'object') {
        throw new Error('Unexpected response format from server.');
      }

      setResult(data);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const buildBreakdown = (r) => {
    if (!r?.breakdown) return null;
    const total = Object.values(r.breakdown).reduce((a, b) => a + b, 0);
    if (total === 0) return null;
    return Object.entries(r.breakdown).map(([k, v]) => ({
      key:   k,
      pct:   Math.round((v / total) * 100),
      val:   v.toFixed(2),
      color: BREAKDOWN_COLORS[k] || '#9ca3af',
      label: {
        transport:   'Transport',
        electricity: 'Electricity',
        diet:        'Diet',
        waste:       'Waste',
        flights:     'Flights',
        heating:     'Heating',
      }[k] || k,
    }));
  };

  return (
    <>
      <style>{styles}</style>

      <div className="az-page">

        <h1 className="az-title az-reveal" data-delay="0">
          Environmental Impact Analyzer
        </h1>

        {weather && (
          <div className="az-weather-banner az-reveal" data-delay="0">
            <span className="az-weather-label">⬡ Live conditions</span>
            <div className="az-weather-chips">
              <span className="az-weather-chip"><strong>{weather.temp}°C</strong> {weather.condition}</span>
              <span className="az-weather-chip">Humidity <strong>{weather.humidity}%</strong></span>
              {weather.aqi   && <span className="az-weather-chip">AQI <strong>{weather.aqi}</strong></span>}
              {weather.uvIndex != null && <span className="az-weather-chip">UV <strong>{weather.uvIndex}</strong></span>}
            </div>
          </div>
        )}

        <div className="az-panel az-reveal" data-delay="1">
          <form onSubmit={handleSubmit} noValidate>

            {error && <div className="az-error">{error}</div>}

            {/* ── Transport ── */}
            <p className="az-section-label">Transport</p>
            <div className="az-form-grid">
              <Field label="Primary Method">
                <div className="az-select-wrap">
                  <select name="transport_method" value={formData.transport_method} onChange={handleChange} className="az-select">
                    <option value="car">Petrol/Diesel Car</option>
                    <option value="ev">Electric Vehicle</option>
                    <option value="bus">Bus</option>
                    <option value="metro">Metro / Train</option>
                    <option value="bike">Bicycle</option>
                    <option value="walk">Walk</option>
                    <option value="motorcycle">Motorcycle</option>
                  </select>
                </div>
              </Field>
              <Field label="Distance" hint="km today">
                <input type="number" name="transport_km" min="0" step="0.5" value={formData.transport_km} onChange={handleChange} className="az-input" />
              </Field>
            </div>

            <RangeField
              label="Flights per year" hint="round trips"
              name="flights_per_year" min={0} max={30} step={1}
              value={formData.flights_per_year} unit=" flights"
              onChange={handleChange}
            />

            {/* ── Energy ── */}
            <div className="az-subsection">
              <p className="az-subsection-label">Energy at Home</p>
              <div className="az-form-grid">
                <Field label="Electricity" hint="kWh today">
                  <input type="number" name="electricity_kwh" min="0" step="0.1" value={formData.electricity_kwh} onChange={handleChange} className="az-input" />
                </Field>
                <Field label="Screen Time" hint="device hours">
                  <input type="number" name="screen_hours" min="0" max="24" step="0.5" value={formData.screen_hours} onChange={handleChange} className="az-input" />
                </Field>
              </div>
              <div className="az-form-grid-3">
                <Field label="Heating / Cooking Fuel">
                  <div className="az-select-wrap">
                    <select name="heating_fuel" value={formData.heating_fuel} onChange={handleChange} className="az-select">
                      <option value="none">None / Electric only</option>
                      <option value="natural_gas">Natural Gas / PNG</option>
                      <option value="lpg">LPG / Cylinder</option>
                      <option value="wood">Wood / Biomass</option>
                    </select>
                  </div>
                </Field>
                <Field label="Fuel Usage" hint="hours/day">
                  <input type="number" name="heating_hours" min="0" max="12" step="0.25" value={formData.heating_hours} onChange={handleChange} className="az-input" />
                </Field>
                <RangeField
                  label="Renewable %" hint="of electricity"
                  name="renewable_pct" min={0} max={100} step={5}
                  value={formData.renewable_pct} unit="%"
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* ── Diet ── */}
            <div className="az-subsection">
              <p className="az-subsection-label">Diet & Food</p>
              <div className="az-form-grid">
                <Field label="Diet Pattern">
                  <div className="az-select-wrap">
                    <select name="diet_type" value={formData.diet_type} onChange={handleChange} className="az-select">
                      <option value="vegan">Vegan</option>
                      <option value="veg">Vegetarian</option>
                      <option value="mixed">Mixed (occasional meat)</option>
                      <option value="heavy_meat">Heavy Meat Eater</option>
                    </select>
                  </div>
                </Field>
                <RangeField
                  label="Meat meals / week"
                  name="meat_meals_per_week" min={0} max={21} step={1}
                  value={formData.meat_meals_per_week} unit=" meals"
                  onChange={handleChange}
                />
              </div>
              <RangeField
                label="Plant-based swaps today" hint="meals replaced with veg/vegan"
                name="plant_based_swaps" min={0} max={3} step={1}
                value={formData.plant_based_swaps} unit=" meals"
                onChange={handleChange}
              />
            </div>

            {/* ── Water & Waste ── */}
            <div className="az-subsection">
              <p className="az-subsection-label">Water & Waste</p>
              <div className="az-form-grid">
                <Field label="Water Usage" hint="litres today">
                  <input type="number" name="water_liters" min="0" step="5" value={formData.water_liters} onChange={handleChange} className="az-input" />
                </Field>
                <Field label="Waste Generated" hint="kg today">
                  <input type="number" name="waste_kg" min="0" step="0.1" value={formData.waste_kg} onChange={handleChange} className="az-input" />
                </Field>
              </div>
              <RangeField
                label="Recycling rate" hint="% of waste sorted"
                name="recycling_pct" min={0} max={100} step={5}
                value={formData.recycling_pct} unit="%"
                onChange={handleChange}
              />
            </div>

            {/* ── Consumption ── */}
            <div className="az-subsection">
              <p className="az-subsection-label">Consumption & Shopping</p>
              <div className="az-form-grid">
                <Field label="New Clothing" hint="items this week">
                  <input type="number" name="new_clothing_items" min="0" step="1" value={formData.new_clothing_items} onChange={handleChange} className="az-input" />
                </Field>
                <Field label="Online Orders" hint="deliveries this week">
                  <input type="number" name="online_orders" min="0" step="1" value={formData.online_orders} onChange={handleChange} className="az-input" />
                </Field>
              </div>
            </div>

            <button type="submit" disabled={loading} className="az-submit">
              <div className="corner-tl" />
              {loading ? (
                <>
                  <span className="az-spinner" />
                  <span>Calculating…</span>
                </>
              ) : (
                <div className="link-text">
                  <div className="link-track">
                    <span>Calculate My Impact</span>
                    <span>Calculate My Impact</span>
                  </div>
                </div>
              )}
              <div className="corner-br" />
            </button>
          </form>
        </div>

        {/* ── Results ── */}
        {result && (
          <div className="az-panel az-result">
            <p className="az-section-label">Your Environmental Impact</p>

            <div className="az-score-grid">
              {[
                { key: 'carbon', label: 'Carbon Score', value: result.carbon_score, unit: 'kg CO₂', delay: '0.05s' },
                { key: 'water',  label: 'Water Score',  value: result.water_score,  unit: 'L',      delay: '0.12s' },
                { key: 'energy', label: 'Energy Score', value: result.energy_score, unit: 'kWh',    delay: '0.19s' },
                { key: 'waste',  label: 'Waste Score',  value: result.waste_score,  unit: 'kg',     delay: '0.26s' },
              ].map((c) => (
                <div key={c.key} className={`az-score-card ${c.key}`} style={{ animationDelay: c.delay }}>
                  <p className="az-score-label">{c.label}</p>
                  <p className={`az-score-value ${c.key}`}>{c.value}</p>
                  <p className="az-score-unit">{c.unit}</p>
                </div>
              ))}
            </div>

            {result.breakdown && (() => {
              const segs = buildBreakdown(result);
              if (!segs) return null;
              return (
                <div className="az-breakdown">
                  <p className="az-section-label">Carbon Breakdown</p>
                  <div className="az-breakdown-bar-wrap">
                    {segs.map((s) => (
                      <div
                        key={s.key}
                        className="az-breakdown-seg"
                        style={{ flex: s.pct, background: s.color }}
                        title={`${s.label}: ${s.val} kg (${s.pct}%)`}
                      />
                    ))}
                  </div>
                  <div className="az-breakdown-legend">
                    {segs.map((s) => (
                      <div key={s.key} className="az-breakdown-item">
                        <div className="az-breakdown-dot" style={{ background: s.color }} />
                        <span>{s.label}</span>
                        <span className="az-breakdown-pct">{s.pct}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            <div style={{ marginBottom: '1.75rem' }}>
              <p className="az-section-label">Overall Rating</p>
              <p className={`az-rating-value ${result.overall_rating}`}>{result.overall_rating}</p>
              {result.carbon_vs_avg != null && (
                <p style={{ fontSize: '0.75rem', color: 'rgba(0,0,0,0.45)', marginTop: '0.4rem' }}>
                  {result.carbon_vs_avg > 0
                    ? `${result.carbon_vs_avg.toFixed(1)} kg CO₂ above daily average`
                    : `${Math.abs(result.carbon_vs_avg).toFixed(1)} kg CO₂ below daily average`}
                </p>
              )}
            </div>

            {result.weather_insight && (
              <div className="az-weather-result">
                <p className="az-ai-label" style={{ color: '#0077b6' }}>⛅ Weather-aware insight</p>
                <p className="az-ai-text">{result.weather_insight}</p>
              </div>
            )}

            {result.ai_analysis && (
              <div className="az-ai-block">
                <p className="az-ai-label">⬡ AI-Powered Analysis</p>
                <p className="az-ai-text">{result.ai_analysis}</p>
              </div>
            )}

            <p className="az-section-label">Personalized Tips</p>
            <div style={{ marginBottom: '0.5rem' }}>
              {(result.tips || []).map((tip, i) => {
                const isObj = tip && typeof tip === 'object';
                const text  = isObj ? tip.text : tip;
                const tag   = isObj ? tip.tag  : null;
                return (
                  <div key={i} className="az-tip" style={{ animationDelay: `${0.35 + i * 0.07}s` }}>
                    <span className="az-tip-arrow">→</span>
                    {tag && <span className={`az-tip-tag ${tag}`}>{tag}</span>}
                    <span>{text}</span>
                  </div>
                );
              })}
            </div>

            {result.reward_summary && (
              <div style={{ marginTop: '1.5rem' }}>
                <p className="az-ai-label" style={{ marginBottom: '0.6rem' }}>⬡ Eco Reward</p>
                <RewardSummaryWidget rewardSummary={result.reward_summary} />
              </div>
            )}

            <button onClick={() => navigate('/dashboard')} className="az-dash-btn">
              <div className="corner-tl" />
              <div className="link-text">
                <div className="link-track">
                  <span>View Dashboard</span>
                  <span>View Dashboard</span>
                </div>
              </div>
              <div className="corner-br" />
            </button>
          </div>
        )}
      </div>
      <RewardUnlockPopup newlyCoupons={result?.reward_summary?.newly_claimed_coupons || []} />
    </>
  );
};

export default Analyzer;