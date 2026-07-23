// frontend/src/components/rewards/MarketplaceEmpty.jsx
import React from 'react';
import { Layers } from 'lucide-react';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;500;600;700&display=swap');

  @keyframes me-fade { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
  @keyframes me-pulse { 0%,100% { opacity:.4; } 50% { opacity:.85; } }

  .me-wrap {
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    padding: 5rem 2rem;
    font-family: "Geist Mono", monospace;
    animation: me-fade 0.6s cubic-bezier(0.22,1,0.36,1) both;
    text-align: center;
  }
  .me-icon-ring {
    width: 68px; height: 68px;
    display: flex; align-items: center; justify-content: center;
    border-radius: 50%;
    border: 1px solid rgba(167,139,250,0.25);
    background: radial-gradient(circle, rgba(167,139,250,0.12), transparent 70%);
    margin-bottom: 1.6rem;
    animation: me-pulse 2.8s ease-in-out infinite;
  }
  .me-title {
    font-size: 0.95rem;
    font-weight: 600;
    letter-spacing: -0.01em;
    color: #f5f5f7;
    margin-bottom: 0.6rem;
  }
  .me-sub {
    font-size: 0.75rem;
    color: rgba(245,245,247,0.45);
    letter-spacing: 0.03em;
    line-height: 1.65;
    max-width: 300px;
  }
  .me-rule { width: 32px; height: 1px; background: rgba(255,255,255,0.14); margin: 1.6rem auto; }
  .me-hint { font-size: 0.65rem; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(167,139,250,0.6); }
`;

export default function MarketplaceEmpty() {
  return (
    <>
      <style>{styles}</style>
      <div className="me-wrap">
        <div className="me-icon-ring">
          <Layers size={22} color="#a78bfa" strokeWidth={1.6} />
        </div>
        <div className="me-title">No rewards available right now</div>
        <div className="me-sub">
          All current reward drops have been claimed. New inventory is added regularly.
        </div>
        <div className="me-rule" />
        <div className="me-hint">Check back for new drops</div>
      </div>
    </>
  );
}
