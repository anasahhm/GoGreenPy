import React from 'react';
import { TrendingUp, TrendingDown, Coins } from 'lucide-react';
import EcoBadge from './EcoBadge';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;600;700&display=swap');

  .rpc-card {
    position: relative;
    border: 1px solid rgba(0,0,0,0.12);
    border-radius: 4px;
    background: #fff;
    padding: 2rem;
    overflow: hidden;
    transition: border-color 0.22s ease, box-shadow 0.22s ease;
    font-family: "Geist Mono", monospace;
  }
  .rpc-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0;
    width: 100%; height: 2px;
    background: linear-gradient(90deg, transparent, rgba(22,163,74,0.6), transparent);
  }
  .rpc-card:hover {
    border-color: rgba(0,0,0,0.22);
    box-shadow: 0 4px 24px rgba(0,0,0,0.05);
  }
  .rpc-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
    gap: 1rem;
  }
  .rpc-label {
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: rgba(30,30,30,0.45);
    margin-bottom: 0.4rem;
  }
  .rpc-points-value {
    font-size: clamp(2rem, 5vw, 3rem);
    font-weight: 700;
    letter-spacing: -0.03em;
    color: #111;
    line-height: 1;
  }
  .rpc-points-unit {
    font-size: 0.8rem;
    font-weight: 600;
    color: rgba(30,30,30,0.45);
    letter-spacing: 0.08em;
    margin-left: 0.3rem;
  }
  .rpc-progress-track {
    width: 100%;
    height: 4px;
    background: rgba(0,0,0,0.07);
    border-radius: 2px;
    overflow: hidden;
    margin: 1.2rem 0 0.5rem;
  }
  .rpc-progress-fill {
    height: 100%;
    border-radius: 2px;
    background: linear-gradient(90deg, #16a34a, #22c55e);
    transition: width 0.8s cubic-bezier(0.22,1,0.36,1);
  }
  .rpc-progress-labels {
    display: flex;
    justify-content: space-between;
    font-size: 0.62rem;
    color: rgba(30,30,30,0.4);
    letter-spacing: 0.06em;
  }
  .rpc-delta-pill {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    padding: 0.25rem 0.6rem;
    border-radius: 2px;
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.06em;
  }
  .rpc-delta-positive {
    background: rgba(22,163,74,0.1);
    border: 1px solid rgba(22,163,74,0.25);
    color: #16a34a;
  }
  .rpc-delta-negative {
    background: rgba(220,38,38,0.07);
    border: 1px solid rgba(220,38,38,0.2);
    color: #dc2626;
  }
  .rpc-icon-bg {
    width: 44px; height: 44px;
    display: flex; align-items: center; justify-content: center;
    border-radius: 3px;
    border: 1px solid rgba(0,0,0,0.1);
    background: rgba(0,0,0,0.03);
    flex-shrink: 0;
  }
`;

export default function RewardPointsCard({ totalPoints = 0, ecoLevel, lastDelta = null }) {
  const label = ecoLevel?.label || 'Eco Starter';
  const pct   = ecoLevel?.progress_pct ?? 0;
  const nextLabel   = ecoLevel?.next_label;
  const pointsNeeded = ecoLevel?.points_needed ?? 0;

  return (
    <>
      <style>{styles}</style>
      <div className="rpc-card">
        <div className="rpc-top">
          <div>
            <div className="rpc-label">Eco Points</div>
            <div>
              <span className="rpc-points-value">{totalPoints}</span>
              <span className="rpc-points-unit">pts</span>
            </div>
            {lastDelta !== null && (
              <div style={{ marginTop: '0.5rem' }}>
                <span className={`rpc-delta-pill ${lastDelta >= 0 ? 'rpc-delta-positive' : 'rpc-delta-negative'}`}>
                  {lastDelta >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                  {lastDelta >= 0 ? '+' : ''}{lastDelta} last calc
                </span>
              </div>
            )}
          </div>
          <div className="rpc-icon-bg">
            <Coins size={20} color="rgba(30,30,30,0.4)" strokeWidth={1.8} />
          </div>
        </div>

        <EcoBadge level={label} size="md" />

        {nextLabel && (
          <>
            <div className="rpc-progress-track">
              <div className="rpc-progress-fill" style={{ width: `${pct}%` }} />
            </div>
            <div className="rpc-progress-labels">
              <span>{label}</span>
              <span>{pointsNeeded} pts to {nextLabel}</span>
            </div>
          </>
        )}
        {!nextLabel && (
          <div style={{ marginTop: '0.8rem', fontSize: '0.68rem', color: 'rgba(22,163,74,0.7)', letterSpacing: '0.08em', fontFamily: '"Geist Mono", monospace' }}>
            MAX LEVEL REACHED
          </div>
        )}
      </div>
    </>
  );
}
