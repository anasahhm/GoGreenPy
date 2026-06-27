// frontend/src/components/rewards/MarketplaceEmpty.jsx
import React from 'react';
import { Layers } from 'lucide-react';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;600;700&display=swap');

  @keyframes me-fade { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
  @keyframes me-pulse { 0%,100% { opacity:.35; } 50% { opacity:.7; } }

  .me-wrap {
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    padding: 5rem 2rem;
    font-family: "Geist Mono", monospace;
    animation: me-fade 0.6s cubic-bezier(0.22,1,0.36,1) both;
    text-align: center;
  }
  .me-icon-ring {
    width: 64px; height: 64px;
    display: flex; align-items: center; justify-content: center;
    border-radius: 50%;
    border: 1px solid rgba(0,0,0,0.1);
    background: rgba(0,0,0,0.02);
    margin-bottom: 1.5rem;
    animation: me-pulse 2.8s ease-in-out infinite;
  }
  .me-title {
    font-size: 0.92rem;
    font-weight: 700;
    letter-spacing: -0.01em;
    color: #111;
    margin-bottom: 0.5rem;
  }
  .me-sub {
    font-size: 0.72rem;
    color: rgba(30,30,30,0.42);
    letter-spacing: 0.04em;
    line-height: 1.6;
    max-width: 280px;
  }
  .me-rule {
    width: 32px; height: 1px;
    background: rgba(0,0,0,0.1);
    margin: 1.5rem auto;
  }
  .me-hint {
    font-size: 0.62rem;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: rgba(30,30,30,0.3);
  }
`;

export default function MarketplaceEmpty() {
  return (
    <>
      <style>{styles}</style>
      <div className="me-wrap">
        <div className="me-icon-ring">
          <Layers size={22} color="rgba(30,30,30,0.3)" strokeWidth={1.6} />
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
