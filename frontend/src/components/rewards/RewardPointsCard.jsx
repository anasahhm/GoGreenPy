import React from 'react';
import { TrendingUp, TrendingDown, Coins } from 'lucide-react';
import EcoBadge from './EcoBadge';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;500;600;700&family=Fraunces:opsz,wght@9..144,500&display=swap');

  .rpc-card {
    position: relative;
    border-radius: 20px;
    background: linear-gradient(160deg, rgba(255,255,255,0.055), rgba(255,255,255,0.015));
    border: 1px solid rgba(255,255,255,0.08);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
    padding: 2rem;
    overflow: hidden;
    font-family: "Geist Mono", monospace;
    box-shadow: 0 1px 0 rgba(255,255,255,0.04) inset, 0 20px 50px -30px rgba(0,0,0,0.6);
  }
  .rpc-glow {
    position: absolute; top: -40px; right: -40px;
    width: 160px; height: 160px;
    background: radial-gradient(circle, rgba(167,139,250,0.18), transparent 70%);
    pointer-events: none;
  }
  .rpc-top { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 1.6rem; flex-wrap: wrap; gap: 1rem; position: relative; }
  .rpc-label { font-size: 0.66rem; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; color: rgba(245,245,247,0.45); margin-bottom: 0.5rem; }
  .rpc-points-value {
    font-family: "Fraunces", serif;
    font-size: clamp(2.2rem, 5vw, 3.2rem);
    font-weight: 500;
    letter-spacing: -0.03em;
    line-height: 1;
    background: linear-gradient(135deg, #fff, #a78bfa 130%);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }
  .rpc-points-unit { font-size: 0.8rem; font-weight: 500; color: rgba(245,245,247,0.45); letter-spacing: 0.08em; margin-left: 0.4rem; }
  .rpc-progress-track { width: 100%; height: 5px; background: rgba(255,255,255,0.07); border-radius: 999px; overflow: hidden; margin: 1.4rem 0 0.6rem; }
  .rpc-progress-fill { height: 100%; border-radius: 999px; background: linear-gradient(90deg, #a78bfa, #60a5fa); transition: width 0.9s cubic-bezier(0.22,1,0.36,1); }
  .rpc-progress-labels { display: flex; justify-content: space-between; font-size: 0.66rem; color: rgba(245,245,247,0.4); letter-spacing: 0.05em; }
  .rpc-delta-pill { display: inline-flex; align-items: center; gap: 0.35rem; padding: 0.3rem 0.65rem; border-radius: 999px; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.04em; }
  .rpc-delta-positive { background: rgba(167,139,250,0.12); border: 1px solid rgba(167,139,250,0.3); color: #c4b5fd; }
  .rpc-delta-negative { background: rgba(244,114,182,0.1); border: 1px solid rgba(244,114,182,0.28); color: #f9a8d4; }
  .rpc-icon-bg {
    width: 46px; height: 46px; display: flex; align-items: center; justify-content: center;
    border-radius: 13px; border: 1px solid rgba(255,255,255,0.1);
    background: linear-gradient(135deg, rgba(167,139,250,0.14), rgba(96,165,250,0.1));
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
        <div className="rpc-glow" />
        <div className="rpc-top">
          <div>
            <div className="rpc-label">Eco Points</div>
            <div>
              <span className="rpc-points-value">{totalPoints}</span>
              <span className="rpc-points-unit">pts</span>
            </div>
            {lastDelta !== null && (
              <div style={{ marginTop: '0.6rem' }}>
                <span className={`rpc-delta-pill ${lastDelta >= 0 ? 'rpc-delta-positive' : 'rpc-delta-negative'}`}>
                  {lastDelta >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                  {lastDelta >= 0 ? '+' : ''}{lastDelta} last calc
                </span>
              </div>
            )}
          </div>
          <div className="rpc-icon-bg">
            <Coins size={20} color="#a78bfa" strokeWidth={1.8} />
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
          <div style={{ marginTop: '0.9rem', fontSize: '0.7rem', color: '#c4b5fd', letterSpacing: '0.08em', fontFamily: '"Geist Mono", monospace', fontWeight: 600 }}>
            MAX LEVEL REACHED
          </div>
        )}
      </div>
    </>
  );
}
