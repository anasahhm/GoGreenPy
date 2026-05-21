import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Globe,
  Droplets,
  Zap,
  Recycle,
  Sprout,
  ArrowRight,
  LayoutDashboard,
} from 'lucide-react';
import { getHistory } from '../services/api';
import ScoreCard from '../components/ScoreCard';
import TrendChart from '../components/TrendChart';
import LoadingSpinner from '../components/LoadingSpinner';
import WeatherWidget from '../components/WeatherWidget';

/* ─── Styles ──────────────────────────────────────────────────────────────── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;600;700&display=swap');

  :root {
    --dash-nav-h: 68px;
    --dash-link-color: rgba(30, 30, 30, 0.7);
    --dash-link-hover: #111;
    --dash-box-border: rgba(0, 0, 0, 0.18);
    --dash-box-bg: rgba(0, 0, 0, 0.05);
    --dash-green: #16a34a;
    --dash-green-light: #22c55e;
    --dash-accent: rgba(22, 163, 74, 0.12);
  }

  .dash-page {
    position: relative;
    z-index: 1;
    max-width: 1280px;
    margin: 0 auto;
    padding: calc(var(--dash-nav-h) + 2.5rem) 1.5rem 4rem;
    font-family: "Geist Mono", monospace;
    background: #f9f9f7;
    min-height: 100vh;
  }

  @keyframes dash-fade-up {
    from { opacity: 0; transform: translateY(22px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes dash-fade-in {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes dash-line-grow {
    from { transform: scaleX(0); }
    to   { transform: scaleX(1); }
  }
  @keyframes dash-gradient-shift {
    0%   { background-position: 0%; }
    100% { background-position: 300%; }
  }

  .dash-reveal {
    opacity: 0;
    animation: dash-fade-up 0.55s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  }
  .dash-reveal[data-delay="0"] { animation-delay: 0.05s; }
  .dash-reveal[data-delay="1"] { animation-delay: 0.12s; }
  .dash-reveal[data-delay="2"] { animation-delay: 0.19s; }
  .dash-reveal[data-delay="3"] { animation-delay: 0.26s; }
  .dash-reveal[data-delay="4"] { animation-delay: 0.33s; }
  .dash-reveal[data-delay="5"] { animation-delay: 0.40s; }
  .dash-reveal[data-delay="6"] { animation-delay: 0.47s; }
  .dash-reveal[data-delay="7"] { animation-delay: 0.54s; }
  .dash-reveal[data-delay="8"] { animation-delay: 0.61s; }

  .dash-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2.5rem;
    flex-wrap: wrap;
    gap: 1.5rem;
  }

  .dash-title {
    font-size: clamp(1.4rem, 3vw, 2rem);
    font-weight: 700;
    letter-spacing: -0.02em;
    color: #111;
    line-height: 1;
    position: relative;
    display: inline-block;
  }
  .dash-title::after {
    content: '';
    position: absolute;
    bottom: -6px; left: 0;
    width: 100%; height: 2px;
    background: linear-gradient(90deg, var(--dash-green), var(--dash-green-light), var(--dash-green));
    background-size: 300%;
    animation: dash-gradient-shift 2.4s linear infinite,
               dash-line-grow 0.6s 0.2s cubic-bezier(0.22,1,0.36,1) both;
    transform-origin: left;
  }

  .dash-btn {
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
    padding: 0.55rem 1.1rem;
    border: 1px solid var(--dash-box-border);
    border-radius: 3px;
    background: none;
    cursor: pointer;
    color: var(--dash-link-color);
    transition: border-color 0.18s ease, background 0.18s ease, color 0.18s ease;
    white-space: nowrap;
    overflow: hidden;
  }
  .dash-btn .corner-tl,
  .dash-btn .corner-br {
    position: absolute;
    width: 5px; height: 5px;
    opacity: 0;
    transition: opacity 0.18s ease;
    pointer-events: none;
  }
  .dash-btn .corner-tl { top: -1px; left: -1px; border-top: 1px solid rgba(0,0,0,0.5); border-left: 1px solid rgba(0,0,0,0.5); }
  .dash-btn .corner-br { bottom: -1px; right: -1px; border-bottom: 1px solid rgba(0,0,0,0.5); border-right: 1px solid rgba(0,0,0,0.5); }
  .dash-btn:hover .corner-tl,
  .dash-btn:hover .corner-br { opacity: 1; }
  .dash-btn .link-text { display: block; overflow: hidden; height: 1em; }
  .dash-btn .link-track { display: flex; flex-direction: column; transition: transform 0.4s cubic-bezier(0.76,0,0.24,1); }
  .dash-btn:hover .link-track { transform: translateY(-50%); }
  .dash-btn .link-track span { display: block; height: 1em; line-height: 1em; }
  .dash-btn .link-track span:first-child { color: var(--dash-link-color); }
  .dash-btn .link-track span:last-child  { color: var(--dash-link-hover); }
  .dash-btn.primary { border-color: rgba(22,163,74,0.4); background: rgba(22,163,74,0.06); }
  .dash-btn.primary:hover { border-color: rgba(22,163,74,0.7); background: rgba(22,163,74,0.12); }
  .dash-btn.primary .link-track span:first-child { color: rgba(22,163,74,0.85); }
  .dash-btn.primary .link-track span:last-child  { color: #15803d; }
  .dash-btn.ghost { border-color: transparent; color: var(--dash-green); }
  .dash-btn.ghost:hover { border-color: rgba(22,163,74,0.3); background: rgba(22,163,74,0.05); }
  .dash-btn.ghost .link-track span:first-child { color: rgba(22,163,74,0.7); }
  .dash-btn.ghost .link-track span:last-child  { color: #15803d; }

  .dash-cards {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
    margin-bottom: 1.5rem;
  }
  @media (max-width: 900px) { .dash-cards { grid-template-columns: repeat(2, 1fr); } }
  @media (max-width: 500px) { .dash-cards { grid-template-columns: 1fr; } }

  .dash-panel {
    position: relative;
    border: 1px solid var(--dash-box-border);
    border-radius: 4px;
    background: #fff;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
    overflow: hidden;
    transition: border-color 0.22s ease, box-shadow 0.22s ease;
  }
  .dash-panel:hover { border-color: rgba(0,0,0,0.28); box-shadow: 0 4px 24px rgba(0,0,0,0.06); }
  .dash-panel::before,
  .dash-panel::after {
    content: '';
    position: absolute;
    width: 8px; height: 8px;
    opacity: 0;
    transition: opacity 0.22s ease;
  }
  .dash-panel::before { top: -1px; left: -1px; border-top: 1px solid rgba(22,163,74,0.7); border-left: 1px solid rgba(22,163,74,0.7); }
  .dash-panel::after  { bottom: -1px; right: -1px; border-bottom: 1px solid rgba(22,163,74,0.7); border-right: 1px solid rgba(22,163,74,0.7); }
  .dash-panel:hover::before,
  .dash-panel:hover::after { opacity: 1; }

  .dash-panel-title {
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: rgba(0,0,0,0.4);
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .dash-panel-title::before {
    content: '';
    display: inline-block;
    width: 18px; height: 1px;
    background: var(--dash-green);
  }

  .dash-rating-value {
    font-size: clamp(2rem, 5vw, 3rem);
    font-weight: 700;
    color: var(--dash-green);
    letter-spacing: -0.03em;
    line-height: 1;
    margin-bottom: 1rem;
  }

  .dash-tips-label {
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: rgba(0,0,0,0.4);
    margin-bottom: 0.6rem;
  }

  .dash-tip-item {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    font-size: 0.82rem;
    color: #333;
    line-height: 1.5;
    padding: 0.3rem 0;
    border-bottom: 1px solid rgba(0,0,0,0.05);
    opacity: 0;
    animation: dash-fade-up 0.4s ease forwards;
  }

  .dash-tip-arrow {
    color: var(--dash-green);
    margin-top: 0.1rem;
    flex-shrink: 0;
  }

  .dash-charts {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    margin-bottom: 1.5rem;
  }
  @media (max-width: 900px) { .dash-charts { grid-template-columns: 1fr; } }

  .dash-log-item {
    position: relative;
    padding: 0.75rem 0.75rem 0.75rem 1rem;
    border-radius: 3px;
    transition: background 0.15s ease;
    cursor: default;
  }
  .dash-log-item:hover { background: rgba(0,0,0,0.025); }
  .dash-log-item::before {
    content: '';
    position: absolute;
    left: 0; top: 0; bottom: 0;
    width: 2px;
    background: linear-gradient(180deg, var(--dash-green), var(--dash-green-light));
    border-radius: 1px;
    transform: scaleY(0);
    transform-origin: top;
    transition: transform 0.25s cubic-bezier(0.22,1,0.36,1);
  }
  .dash-log-item:hover::before { transform: scaleY(1); }

  .dash-log-rating { font-size: 0.82rem; font-weight: 700; color: #111; letter-spacing: 0.02em; margin-bottom: 0.2rem; }
  .dash-log-meta   { font-size: 0.72rem; color: rgba(0,0,0,0.5); letter-spacing: 0.04em; }
  .dash-log-date   { font-size: 0.68rem; color: rgba(0,0,0,0.35); letter-spacing: 0.04em; margin-top: 0.15rem; }
  .dash-logs-divider { height: 1px; background: rgba(0,0,0,0.06); margin: 0.1rem 0; }

  .dash-empty {
    border: 1px dashed rgba(0,0,0,0.15);
    border-radius: 4px;
    padding: 5rem 2rem;
    text-align: center;
    animation: dash-fade-in 0.6s ease;
  }
  .dash-empty-icon  { margin-bottom: 1rem; display: flex; justify-content: center; animation: dash-fade-up 0.5s 0.1s ease both; color: var(--dash-green); }
  .dash-empty-title { font-size: 1rem; font-weight: 700; letter-spacing: 0.05em; color: #333; margin-bottom: 0.5rem; text-transform: uppercase; animation: dash-fade-up 0.5s 0.2s ease both; }
  .dash-empty-sub   { font-size: 0.8rem; color: rgba(0,0,0,0.45); margin-bottom: 2rem; animation: dash-fade-up 0.5s 0.3s ease both; }

  .dash-card-wrap {
    position: relative;
    border: 1px solid var(--dash-box-border);
    border-radius: 4px;
    background: #fff;
    padding: 1.25rem;
    overflow: hidden;
    transition: border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
  }
  .dash-card-wrap:hover { border-color: rgba(0,0,0,0.25); transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.07); }
  .dash-card-wrap::after {
    content: '';
    position: absolute;
    bottom: 0; left: 0; right: 0;
    height: 2px;
    background: linear-gradient(90deg, var(--dash-green), var(--dash-green-light));
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.3s cubic-bezier(0.22,1,0.36,1);
  }
  .dash-card-wrap:hover::after { transform: scaleX(1); }
`;

/* ─── DashBtn helper ──────────────────────────────────────────────────────── */
const DashBtn = ({ label, onClick, to, variant = '', className = '' }) => {
  const Tag = onClick ? 'button' : 'a';
  return (
    <Tag onClick={onClick} href={to} className={`dash-btn ${variant} ${className}`}>
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

      <div className="dash-page">

        {/* ── Header ── */}
        <div className="dash-header dash-reveal" data-delay="0">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <LayoutDashboard size={20} color="#16a34a" strokeWidth={1.8} />
            <h1 className="dash-title">Dashboard</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <WeatherWidget apiKey={import.meta.env.VITE_OWM_API_KEY} />
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
              ].map((card, i) => (
                <div
                  key={card.title}
                  className="dash-card-wrap dash-reveal"
                  data-delay={i + 1}
                >
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
            <div className="dash-panel dash-reveal" data-delay="5">
              <p className="dash-panel-title">Overall Rating</p>
              <p className="dash-rating-value">{latestLog.overall_rating}</p>
              <p className="dash-tips-label">Today's Tips</p>
              <div>
                {latestLog.tips.map((tip, i) => (
                  <div key={i} className="dash-tip-item" style={{ animationDelay: `${0.5 + i * 0.08}s` }}>
                    <ArrowRight size={12} className="dash-tip-arrow" />
                    {typeof tip === 'object' ? (tip.text ?? JSON.stringify(tip)) : tip}
                  </div>
                ))}
              </div>
            </div>

            {/* ── Trend charts ── */}
            {logs.length > 1 && (
              <div className="dash-charts">
                {[
                  { title: 'Carbon Footprint Trend', data: carbonData, color: 'rgb(59,130,246)' },
                  { title: 'Water Usage Trend',      data: waterData,  color: 'rgb(6,182,212)' },
                  { title: 'Energy Usage Trend',     data: energyData, color: 'rgb(251,191,36)' },
                ].map((chart, i) => (
                  <div
                    key={chart.title}
                    className="dash-panel dash-reveal"
                    data-delay={6 + i}
                    style={{ marginBottom: 0 }}
                  >
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
            <div className="dash-panel dash-reveal" data-delay="8">
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

              <div style={{ marginTop: '1.25rem' }}>
                <DashBtn
                  label="View All History →"
                  onClick={() => navigate('/history')}
                  variant="ghost"
                />
              </div>
            </div>
          </>
        ) : (
          /* ── Empty state ── */
          <div className="dash-empty">
            <div className="dash-empty-icon">
              <Sprout size={48} strokeWidth={1.4} />
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