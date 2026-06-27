// frontend/src/components/rewards/RewardHistory.jsx
import React from 'react';
import { TrendingUp, TrendingDown, Award } from 'lucide-react';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;600;700&display=swap');
  .rh-wrap { font-family:"Geist Mono",monospace; }
  .rh-item {
    display:flex; align-items:flex-start; gap:0.9rem;
    padding:0.9rem 0; border-bottom:1px solid rgba(0,0,0,0.055);
  }
  .rh-item:last-child { border-bottom:none; }
  .rh-dot {
    width:28px; height:28px; border-radius:50%; flex-shrink:0;
    display:flex; align-items:center; justify-content:center; margin-top:1px;
  }
  .rh-dot.pos { background:rgba(22,163,74,0.1); border:1px solid rgba(22,163,74,0.22); }
  .rh-dot.neg { background:rgba(220,38,38,0.07); border:1px solid rgba(220,38,38,0.18); }
  .rh-body  { flex:1; min-width:0; }
  .rh-reason{ font-size:0.75rem; font-weight:600; color:#111; letter-spacing:-0.01em; }
  .rh-meta  { font-size:0.62rem; color:rgba(30,30,30,0.38); margin-top:2px; letter-spacing:0.03em; }
  .rh-tag   {
    display:inline-flex; align-items:center; gap:0.25rem; margin-top:0.3rem;
    font-size:0.58rem; font-weight:600; letter-spacing:0.07em; text-transform:uppercase;
    color:rgba(22,163,74,0.75); background:rgba(22,163,74,0.08);
    border:1px solid rgba(22,163,74,0.18); border-radius:2px; padding:0.15rem 0.4rem;
  }
  .rh-right { text-align:right; flex-shrink:0; }
  .rh-delta { font-size:0.78rem; font-weight:700; letter-spacing:-0.01em; }
  .rh-delta.pos { color:#16a34a; }
  .rh-delta.neg { color:#dc2626; }
  .rh-after { font-size:0.6rem; color:rgba(30,30,30,0.32); margin-top:2px; letter-spacing:0.03em; }
  .rh-empty { text-align:center; font-size:0.75rem; color:rgba(30,30,30,0.38); padding:2.5rem 0; letter-spacing:0.05em; font-family:"Geist Mono",monospace; }
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
                      ? <TrendingUp size={13} color="#16a34a" strokeWidth={2.2} />
                      : <TrendingDown size={13} color="#dc2626" strokeWidth={2.2} />}
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
