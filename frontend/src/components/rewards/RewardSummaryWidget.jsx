// frontend/src/components/rewards/RewardSummaryWidget.jsx
import React from 'react';
import { TrendingUp, TrendingDown, Award } from 'lucide-react';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;600;700&display=swap');
  @keyframes rsw-in { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }

  .rsw-card {
    border:1px solid rgba(0,0,0,0.1); border-radius:4px; background:#fff;
    padding:1.4rem 1.6rem; font-family:"Geist Mono",monospace;
    animation:rsw-in 0.5s cubic-bezier(0.22,1,0.36,1) forwards;
    position:relative; overflow:hidden;
  }
  .rsw-card::before {
    content:''; position:absolute; top:0; left:0;
    width:100%; height:1.5px;
    background:linear-gradient(90deg,transparent,rgba(22,163,74,0.5),transparent);
  }
  .rsw-row { display:flex; align-items:center; gap:0.75rem; margin-bottom:0.9rem; }
  .rsw-dot {
    width:36px; height:36px; border-radius:50%; display:flex; align-items:center; justify-content:center; flex-shrink:0;
  }
  .rsw-dot.pos { background:rgba(22,163,74,0.1); border:1px solid rgba(22,163,74,0.25); }
  .rsw-dot.neg { background:rgba(220,38,38,0.07); border:1px solid rgba(220,38,38,0.18); }
  .rsw-label  { font-size:0.6rem; font-weight:600; letter-spacing:0.1em; text-transform:uppercase; color:rgba(30,30,30,0.42); }
  .rsw-delta  { font-size:1.22rem; font-weight:700; letter-spacing:-0.02em; line-height:1; }
  .rsw-delta.pos { color:#16a34a; }
  .rsw-delta.neg { color:#dc2626; }
  .rsw-total  { font-size:0.7rem; color:rgba(30,30,30,0.5); display:flex; gap:0.3rem; align-items:baseline; }
  .rsw-total b { font-size:0.88rem; font-weight:700; color:#111; }
  .rsw-level  { font-size:0.64rem; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; color:rgba(22,163,74,0.8); margin-top:0.45rem; display:flex; align-items:center; gap:0.28rem; }
  .rsw-new    { margin-top:0.7rem; font-size:0.68rem; font-weight:600; color:#16a34a; letter-spacing:0.02em; }
`;

export default function RewardSummaryWidget({ rewardSummary }) {
  if (!rewardSummary) return null;
  const { points_delta, total_points, eco_level, newly_claimed_coupons } = rewardSummary;
  const isPos = points_delta >= 0;

  return (
    <>
      <style>{styles}</style>
      <div className="rsw-card">
        <div className="rsw-row">
          <div className={`rsw-dot ${isPos ? 'pos' : 'neg'}`}>
            {isPos
              ? <TrendingUp size={16} color="#16a34a" strokeWidth={2.2} />
              : <TrendingDown size={16} color="#dc2626" strokeWidth={2.2} />}
          </div>
          <div>
            <div className="rsw-label">Points {isPos ? 'Earned' : 'Lost'}</div>
            <div className={`rsw-delta ${isPos ? 'pos' : 'neg'}`}>
              {isPos ? '+' : ''}{points_delta}
            </div>
          </div>
        </div>
        <div className="rsw-total">Total: <b>{total_points}</b> pts</div>
        <div className="rsw-level"><Award size={11} />{eco_level}</div>
        {newly_claimed_coupons?.length > 0 && (
          <div className="rsw-new">
            {newly_claimed_coupons.length} reward{newly_claimed_coupons.length > 1 ? 's' : ''} reserved — view in Rewards
          </div>
        )}
      </div>
    </>
  );
}
