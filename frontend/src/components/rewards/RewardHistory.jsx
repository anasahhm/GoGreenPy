// frontend/src/components/rewards/RewardHistory.jsx
import React from 'react';
import { TrendingUp, TrendingDown, Award } from 'lucide-react';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;500;600;700&display=swap');
  .rh-wrap { font-family:"Geist Mono",monospace; }
  .rh-item {
    display:flex; align-items:flex-start; gap:0.9rem;
    padding:1rem 0; border-top:1px solid rgba(255,255,255,0.06);
  }
  .rh-item:first-child { border-top:none; }
  .rh-dot {
    width:30px; height:30px; border-radius:50%; flex-shrink:0;
    display:flex; align-items:center; justify-content:center; margin-top:1px;
  }
  .rh-dot.pos { background:rgba(167,139,250,0.12); border:1px solid rgba(167,139,250,0.3); }
  .rh-dot.neg { background:rgba(244,114,182,0.1); border:1px solid rgba(244,114,182,0.25); }
  .rh-body  { flex:1; min-width:0; }
  .rh-reason{ font-size:0.8rem; font-weight:600; color:#f5f5f7; letter-spacing:-0.01em; }
  .rh-meta  { font-size:0.65rem; color:rgba(245,245,247,0.4); margin-top:3px; letter-spacing:0.03em; }
  .rh-tag   {
    display:inline-flex; align-items:center; gap:0.3rem; margin-top:0.4rem;
    font-size:0.6rem; font-weight:600; letter-spacing:0.07em; text-transform:uppercase;
    color:#c4b5fd; background:rgba(167,139,250,0.1);
    border:1px solid rgba(167,139,250,0.25); border-radius:999px; padding:0.2rem 0.55rem;
  }
  .rh-right { text-align:right; flex-shrink:0; }
  .rh-delta { font-size:0.85rem; font-weight:700; letter-spacing:-0.01em; }
  .rh-delta.pos { color:#c4b5fd; }
  .rh-delta.neg { color:#f9a8d4; }
  .rh-after { font-size:0.62rem; color:rgba(245,245,247,0.35); margin-top:3px; letter-spacing:0.03em; }
  .rh-empty { text-align:center; font-size:0.8rem; color:rgba(245,245,247,0.4); padding:3rem 0; letter-spacing:0.05em; font-family:"Geist Mono",monospace; }
`;

function fmt(ds) {
  return new Date(ds).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' });
}

export default function RewardHistory({ transactions = [] }) {
  return (
    <>
      <style>{styles}</style>
      {!transactions.length
        ? <div className="rh-empty">No transactions yet. Run an impact analysis to earn points.</div>
        : (
          <div className="rh-wrap">
            {transactions.map((t, i) => {
              const pos = t.points_delta >= 0;
              return (
                <div className="rh-item" key={t.id || i}>
                  <div className={`rh-dot ${pos ? 'pos' : 'neg'}`}>
                    {pos
                      ? <TrendingUp size={13} color="#c4b5fd" strokeWidth={2.2} />
                      : <TrendingDown size={13} color="#f9a8d4" strokeWidth={2.2} />}
                  </div>
                  <div className="rh-body">
                    <div className="rh-reason">{t.reason}</div>
                    <div className="rh-meta">{fmt(t.created_at)}</div>
                    {t.newly_claimed_coupons?.length > 0 && (
                      <div className="rh-tag">
                        <Award size={9} />
                        {t.newly_claimed_coupons.length} reward{t.newly_claimed_coupons.length > 1 ? 's' : ''} reserved
                      </div>
                    )}
                  </div>
                  <div className="rh-right">
                    <div className={`rh-delta ${pos ? 'pos' : 'neg'}`}>{pos ? '+' : ''}{t.points_delta}</div>
                    <div className="rh-after">{t.points_after} total</div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      }
    </>
  );
}
