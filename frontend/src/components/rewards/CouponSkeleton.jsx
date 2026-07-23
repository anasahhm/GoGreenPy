// frontend/src/components/rewards/CouponSkeleton.jsx
import React from 'react';

const styles = `
  @keyframes skshimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }
  .sk-base {
    border-radius: 6px;
    background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.09) 50%, rgba(255,255,255,0.04) 75%);
    background-size: 800px 100%;
    animation: skshimmer 1.4s infinite linear;
  }
  .sk-card {
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 16px;
    padding: 1.5rem;
    background: linear-gradient(160deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01));
  }
  .sk-row { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem; }
  .sk-circle { width: 36px; height: 36px; border-radius: 50%; flex-shrink: 0; }
  .sk-line { height: 10px; border-radius: 4px; }
  .sk-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem; }
`;

function SkCard() {
  return (
    <div className="sk-card">
      <div className="sk-row">
        <div className="sk-base sk-circle" />
        <div style={{ flex: 1 }}>
          <div className="sk-base sk-line" style={{ width: '60%', marginBottom: 8 }} />
          <div className="sk-base sk-line" style={{ width: '35%', height: 8 }} />
        </div>
      </div>
      <div className="sk-base sk-line" style={{ width: '30%', height: 20, marginBottom: 12 }} />
      <div className="sk-base sk-line" style={{ width: '100%', marginBottom: 6 }} />
      <div className="sk-base sk-line" style={{ width: '80%', marginBottom: 6 }} />
      <div className="sk-base sk-line" style={{ width: '60%' }} />
    </div>
  );
}

export default function CouponSkeleton({ count = 6 }) {
  return (
    <>
      <style>{styles}</style>
      <div className="sk-grid">
        {Array.from({ length: count }).map((_, i) => <SkCard key={i} />)}
      </div>
    </>
  );
}
