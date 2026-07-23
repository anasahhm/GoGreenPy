import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import {
  Globe,
  Droplets,
  Zap,
  Recycle,
  Sprout,
  ArrowRight,
  ArrowUpRight,
  LayoutDashboard,
} from 'lucide-react';
import { getHistory } from '../services/api';
import ScoreCard from '../components/ScoreCard';
import TrendChart from '../components/TrendChart';
import LoadingSpinner from '../components/LoadingSpinner';
import WeatherWidget from '../components/WeatherWidget';

/* ─── Styles ──────────────────────────────────────────────────────────────── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;500;600;700&family=Fraunces:opsz,wght@9..144,300;9..144,500&display=swap');

  :root {
    --dash-nav-h: 68px;
    --dash-ink: #f5f5f7;
    --dash-ink-dim: rgba(245,245,247,0.55);
    --dash-ink-faint: rgba(245,245,247,0.32);
    --dash-glass-bg: linear-gradient(160deg, rgba(255,255,255,0.055), rgba(255,255,255,0.015));
    --dash-glass-border: rgba(255,255,255,0.08);
    --dash-violet: #a78bfa;
    --dash-blue: #60a5fa;
    --dash-pink: #f472b6;
    --dash-radius: 20px;
  }

  .dash-page {
    position: relative;
    z-index: 1;
    max-width: 1320px;
    margin: 0 auto;
    padding: calc(var(--dash-nav-h) + 3rem) 1.75rem 5rem;
    font-family: "Geist Mono", monospace;
    color: var(--dash-ink);
    min-height: 100vh;
    isolation: isolate;
  }

  .dash-bg {
    position: fixed;
    inset: 0;
    z-index: -1;
    background: #06060a;
    overflow: hidden;
  }
  .dash-bg::before {
    content: '';
    position: absolute;
    top: -20%; left: -10%;
    width: 60vw; height: 60vw;
    max-width: 700px; max-height: 700px;
    background: radial-gradient(circle, rgba(167,139,250,0.16), transparent 65%);
    filter: blur(10px);
  }
  .dash-bg::after {
    content: '';
    position: absolute;
    bottom: -25%; right: -12%;
    width: 55vw; height: 55vw;
    max-width: 640px; max-height: 640px;
    background: radial-gradient(circle, rgba(96,165,250,0.13), transparent 65%);
    filter: blur(10px);
  }
  .dash-bg-vignette {
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse at 50% 0%, transparent 40%, rgba(0,0,0,0.55) 100%);
    pointer-events: none;
  }
  .dash-bg-noise {
    position: absolute;
    inset: 0;
    opacity: 0.035;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    pointer-events: none;
  }

  .gs-reveal { opacity: 0; }

  .dash-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2.75rem;
    flex-wrap: wrap;
    gap: 1.5rem;
  }

  .dash-title {
    font-family: "Fraunces", serif;
    font-size: clamp(1.7rem, 3.4vw, 2.5rem);
    font-weight: 500;
    letter-spacing: -0.02em;
    color: var(--dash-ink);
    line-height: 1;
  }
  .dash-eyebrow {
    font-size: 0.68rem;
    font-weight: 600;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--dash-ink-faint);
    margin: 0 0 0.4rem;
  }

  .dash-weather-wrap {
    border-radius: 999px;
    padding: 0.15rem 0.6rem;
    background: var(--dash-glass-bg);
    border: 1px solid var(--dash-glass-border);
    backdrop-filter: blur(14px);
  }

  .dash-btn {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-family: "Geist Mono", monospace;
    font-size: 0.74rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-decoration: none;
    padding: 0.7rem 1.25rem;
    border-radius: 999px;
    background: none;
    cursor: pointer;
    color: var(--dash-ink-dim);
    border: 1px solid var(--dash-glass-border);
    transition: transform 0.25s cubic-bezier(0.22,1,0.36,1), border-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;
    white-space: nowrap;
    overflow: hidden;
  }
  .dash-btn:hover { transform: translateY(-2px); color: var(--dash-ink); }
  .dash-btn:active { transform: translateY(0) scale(0.97); }
  .dash-btn.primary {
    background: linear-gradient(135deg, rgba(167,139,250,0.9), rgba(96,165,250,0.9));
    border-color: transparent;
    color: #08080b;
    font-weight: 700;
    box-shadow: 0 0 0 1px rgba(255,255,255,0.08) inset;
  }
  .dash-btn.primary:hover {
    box-shadow: 0 12px 34px -8px rgba(167,139,250,0.6), 0 0 0 1px rgba(255,255,255,0.15) inset;
  }
  .dash-btn.primary .dash-btn-shine {
    position: absolute;
    top: 0; left: -60%;
    width: 45%; height: 100%;
    background: linear-gradient(115deg, transparent, rgba(255,255,255,0.55), transparent);
    transform: skewX(-18deg);
    transition: left 0.7s cubic-bezier(0.22,1,0.36,1);
    pointer-events: none;
  }
  .dash-btn.primary:hover .dash-btn-shine { left: 130%; }
  .dash-btn.primary .dash-btn-icon { transition: transform 0.3s cubic-bezier(0.22,1,0.36,1); display: flex; }
  .dash-btn.primary:hover .dash-btn-icon { transform: translate(3px, -3px); }
  .dash-btn.ghost:hover { border-color: rgba(167,139,250,0.35); background: rgba(167,139,250,0.06); }

  .dash-cards {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1.1rem;
    margin-bottom: 1.1rem;
  }
  @media (max-width: 900px) { .dash-cards { grid-template-columns: repeat(2, 1fr); } }
  @media (max-width: 500px) { .dash-cards { grid-template-columns: 1fr; } }

  .dash-panel {
    position: relative;
    border-radius: var(--dash-radius);
    background: var(--dash-glass-bg);
    border: 1px solid var(--dash-glass-border);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
    padding: 1.75rem;
    margin-bottom: 1.1rem;
    overflow: hidden;
    box-shadow: 0 1px 0 rgba(255,255,255,0.04) inset, 0 20px 50px -30px rgba(0,0,0,0.6);
    transition: border-color 0.25s ease, transform 0.25s ease;
  }
  .dash-panel:hover { border-color: rgba(255,255,255,0.14); }

  .dash-panel-title {
    font-size: 0.68rem;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--dash-ink-faint);
    margin-bottom: 1.3rem;
    display: flex;
    align-items: center;
    gap: 0.55rem;
  }
  .dash-panel-title::before {
    content: '';
    display: inline-block;
    width: 14px; height: 1px;
    background: linear-gradient(90deg, var(--dash-violet), transparent);
  }

  .dash-rating-value {
    font-family: "Fraunces", serif;
    font-size: clamp(2.6rem, 6vw, 4rem);
    font-weight: 500;
    background: linear-gradient(135deg, #fff, var(--dash-violet) 120%);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    letter-spacing: -0.03em;
    line-height: 1;
    margin-bottom: 1.5rem;
  }

  .dash-tips-label {
    font-size: 0.68rem;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--dash-ink-faint);
    margin-bottom: 0.9rem;
  }
  .dash-tip-item {
    display: flex;
    align-items: flex-start;
    gap: 0.6rem;
    font-size: 0.86rem;
    line-height: 1.5;
    color: var(--dash-ink-dim);
    padding: 0.6rem 0;
    border-top: 1px solid rgba(255,255,255,0.06);
  }
  .dash-tip-item:first-child { border-top: none; }
  .dash-tip-arrow { color: var(--dash-violet); margin-top: 0.2rem; flex-shrink: 0; }

  .dash-charts {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.1rem;
    margin-bottom: 1.1rem;
  }
  @media (max-width: 1000px) { .dash-charts { grid-template-columns: 1fr; } }

  .dash-log-item {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 0.4rem 1rem;
    padding: 0.9rem 0;
    transition: padding-left 0.2s ease;
  }
  .dash-log-item:hover { padding-left: 0.4rem; }
  .dash-logs-divider { height: 1px; background: rgba(255,255,255,0.06); }
  .dash-log-rating {
    font-family: "Fraunces", serif;
    font-size: 1.25rem;
    font-weight: 500;
    color: var(--dash-ink);
    margin: 0;
    min-width: 60px;
  }
  .dash-log-meta { font-size: 0.78rem; color: var(--dash-ink-dim); margin: 0; flex: 1; }
  .dash-log-date { font-size: 0.72rem; color: var(--dash-ink-faint); margin: 0; }

  .dash-empty {
    text-align: center;
    padding: 6rem 1rem;
    border-radius: var(--dash-radius);
    background: var(--dash-glass-bg);
    border: 1px solid var(--dash-glass-border);
    backdrop-filter: blur(18px);
  }
  .dash-empty-icon {
    width: 88px; height: 88px;
    margin: 0 auto 1.75rem;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    background: radial-gradient(circle, rgba(167,139,250,0.18), transparent 70%);
    color: var(--dash-violet);
  }
  .dash-empty-title { font-family: "Fraunces", serif; font-size: 1.6rem; font-weight: 500; color: var(--dash-ink); margin-bottom: 0.6rem; }
  .dash-empty-sub { font-size: 0.85rem; color: var(--dash-ink-dim); margin-bottom: 2.25rem; }
`;

/* ─── DashBtn helper ──────────────────────────────────────────────────────── */
const DashBtn = ({ label, onClick, to, variant = '', className = '' }) => {
  const Tag = onClick ? 'button' : 'a';
  return (
    <Tag onClick={onClick} href={to} className={`dash-btn ${variant} ${className}`}>
      {variant === 'primary' && <span className="dash-btn-shine" />}
      <span>{label}</span>
      <span className="dash-btn-icon"><ArrowUpRight size={14} strokeWidth={2} /></span>
    </Tag>
  );
};

/* ─── Card icon map ───────────────────────────────────────────────────────── */
const CARD_ICONS = {
  'Carbon Footprint': <Globe size={18} strokeWidth={1.8} />,
  'Water Usage':      <Droplets size={18} strokeWidth={1.8} />,
  'Energy Score':     <Zap size={18} strokeWidth={1.8} />,
  'Waste Generated':  <Recycle size={18} strokeWidth={1.8} />,
};

/* ─── Component ───────────────────────────────────────────────────────────── */
const Dashboard = () => {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate               = useNavigate();
  const pageRef                = useRef(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const response = await getHistory(1, 7);
      setData(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  /* GSAP entrance — presentation only, runs after data/loading settles */
  useEffect(() => {
    if (loading || !pageRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        pageRef.current.querySelectorAll('.gs-reveal'),
        { opacity: 0, y: 26 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.08, clearProps: 'transform' }
      );
    }, pageRef);
    return () => ctx.revert();
  }, [loading, data]);

  if (loading) return <LoadingSpinner />;

  const latestLog = data?.data[0];
  const logs      = data?.data || [];

  const carbonData = logs.slice().reverse().map((log) => log.carbon_score);
  const waterData  = logs.map((log) => log.water_score);
  const energyData = logs.map((log) => log.energy_score);
  const labels     = logs.map((_, i) => `Day ${i + 1}`);

  return (
    <>
      <style>{styles}</style>
      <div className="dash-bg">
        <div className="dash-bg-vignette" />
        <div className="dash-bg-noise" />
      </div>

      <div className="dash-page" ref={pageRef}>

        {/* ── Header ── */}
        <div className="dash-header gs-reveal">
          <div>
            <p className="dash-eyebrow">Overview</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <LayoutDashboard size={22} color="#a78bfa" strokeWidth={1.6} />
              <h1 className="dash-title">Dashboard</h1>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div className="dash-weather-wrap">
              <WeatherWidget apiKey={import.meta.env.VITE_OWM_API_KEY} />
            </div>
            <DashBtn label="New Analysis" onClick={() => navigate('/analyzer')} variant="primary" />
          </div>
        </div>

        {latestLog ? (
          <>
            {/* ── Score cards ── */}
            <div className="dash-cards">
              {[
                { title: 'Carbon Footprint', value: latestLog.carbon_score, unit: 'kg CO₂', color: 'text-blue-600' },
                { title: 'Water Usage',      value: latestLog.water_score,  unit: 'L',      color: 'text-cyan-600' },
                { title: 'Energy Score',     value: latestLog.energy_score, unit: 'kWh',    color: 'text-yellow-600' },
                { title: 'Waste Generated',  value: latestLog.waste_score,  unit: 'kg',     color: 'text-gray-600' },
              ].map((card) => (
                <div key={card.title} className="gs-reveal" style={{ height: '100%' }}>
                  <ScoreCard
                    title={card.title}
                    value={card.value}
                    unit={card.unit}
                    icon={CARD_ICONS[card.title]}
                    color={card.color}
                  />
                </div>
              ))}
            </div>

            {/* ── Overall rating + tips ── */}
            <div className="dash-panel gs-reveal">
              <p className="dash-panel-title">Overall Rating</p>
              <p className="dash-rating-value">{latestLog.overall_rating}</p>
              <p className="dash-tips-label">Today's Tips</p>
              <div>
                {latestLog.tips.map((tip, i) => (
                  <div key={i} className="dash-tip-item">
                    <ArrowRight size={13} className="dash-tip-arrow" />
                    {typeof tip === 'object' ? (tip.text ?? JSON.stringify(tip)) : tip}
                  </div>
                ))}
              </div>
            </div>

            {/* ── Trend charts ── */}
            {logs.length > 1 && (
              <div className="dash-charts">
                {[
                  { title: 'Carbon Footprint Trend', data: carbonData, color: '#60a5fa' },
                  { title: 'Water Usage Trend',      data: waterData,  color: '#22d3ee' },
                  { title: 'Energy Usage Trend',     data: energyData, color: '#fbbf24' },
                ].map((chart) => (
                  <div key={chart.title} className="dash-panel gs-reveal" style={{ marginBottom: 0 }}>
                    <TrendChart
                      title={chart.title}
                      labels={labels}
                      data={chart.data}
                      color={chart.color}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* ── Recent logs ── */}
            <div className="dash-panel gs-reveal">
              <p className="dash-panel-title">Recent Logs</p>
              <div>
                {logs.slice(0, 5).slice().reverse().map((log, i, arr) => (
                  <React.Fragment key={log.id}>
                    <div className="dash-log-item">
                      <p className="dash-log-rating">{log.overall_rating}</p>
                      <p className="dash-log-meta">
                        Carbon: {log.carbon_score} kg CO₂&nbsp;&nbsp;|&nbsp;&nbsp;Water: {log.water_score} L
                      </p>
                      <p className="dash-log-date">
                        {new Date(log.created_at).toLocaleDateString(undefined, {
                          year: 'numeric', month: 'short', day: 'numeric'
                        })}
                      </p>
                    </div>
                    {i < arr.length - 1 && <div className="dash-logs-divider" />}
                  </React.Fragment>
                ))}
              </div>

              <div style={{ marginTop: '1.5rem' }}>
                <DashBtn
                  label="View All History"
                  onClick={() => navigate('/history')}
                  variant="ghost"
                />
              </div>
            </div>
          </>
        ) : (
          /* ── Empty state ── */
          <div className="dash-empty gs-reveal">
            <div className="dash-empty-icon">
              <Sprout size={40} strokeWidth={1.4} />
            </div>
            <p className="dash-empty-title">No data yet</p>
            <p className="dash-empty-sub">Start tracking your environmental impact today.</p>
            <DashBtn
              label="Create First Analysis"
              onClick={() => navigate('/analyzer')}
              variant="primary"
            />
          </div>
        )}
      </div>
    </>
  );
};

export default Dashboard;
