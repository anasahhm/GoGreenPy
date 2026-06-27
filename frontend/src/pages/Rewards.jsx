// frontend/src/pages/Rewards.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { getMyRewardsSummary, getMarketplace, getRewardHistory } from '../services/api';
import RewardPointsCard  from '../components/rewards/RewardPointsCard';
import CouponGrid        from '../components/rewards/CouponGrid';
import CouponSkeleton    from '../components/rewards/CouponSkeleton';
import RewardHistory     from '../components/rewards/RewardHistory';
import EcoBadge          from '../components/rewards/EcoBadge';
import MarketplaceEmpty  from '../components/rewards/MarketplaceEmpty';

/* ── Styles ─────────────────────────────────────────────────────────────── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;600;700&display=swap');

  :root { --rw-nav-h: 68px; }

  @keyframes rw-up     { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
  @keyframes rw-line   { from { transform:scaleX(0); } to { transform:scaleX(1); } }
  @keyframes rw-shift  { 0% { background-position:0%; } 100% { background-position:300%; } }

  .rw-page {
    max-width: 1020px; margin: 0 auto;
    padding: calc(var(--rw-nav-h) + 2.5rem) 1.5rem 5rem;
    font-family: "Geist Mono", monospace;
  }

  .rw-reveal { opacity:0; animation: rw-up 0.52s cubic-bezier(0.22,1,0.36,1) forwards; }
  .rw-reveal[data-d="0"] { animation-delay:0.04s; }
  .rw-reveal[data-d="1"] { animation-delay:0.11s; }
  .rw-reveal[data-d="2"] { animation-delay:0.18s; }
  .rw-reveal[data-d="3"] { animation-delay:0.25s; }

  .rw-title {
    font-size:clamp(1.4rem,3vw,2rem); font-weight:700; letter-spacing:-0.02em;
    color:#111; line-height:1; display:inline-block; margin-bottom:2.5rem; position:relative;
  }
  .rw-title::after {
    content:''; position:absolute; bottom:-6px; left:0;
    width:100%; height:2px; transform-origin:left;
    background:linear-gradient(90deg,#16a34a,#22c55e,#16a34a);
    background-size:300%;
    animation: rw-shift 2.4s linear infinite, rw-line 0.55s 0.1s cubic-bezier(0.22,1,0.36,1) both;
  }

  /* panels */
  .rw-panel {
    position:relative; border:1px solid rgba(0,0,0,0.1); border-radius:4px;
    background:#fff; padding:2rem; margin-bottom:1.5rem; overflow:hidden;
    transition: border-color 0.22s, box-shadow 0.22s;
  }
  .rw-panel:hover { border-color:rgba(0,0,0,0.18); box-shadow:0 4px 20px rgba(0,0,0,0.04); }
  .rw-panel::before {
    content:''; position:absolute; top:0; left:0; width:100%; height:1.5px;
    background:linear-gradient(90deg,transparent,rgba(22,163,74,0.32),transparent);
  }

  .rw-section-lbl {
    font-size:0.62rem; font-weight:700; letter-spacing:0.14em; text-transform:uppercase;
    color:rgba(30,30,30,0.38); margin-bottom:1.2rem;
    display:flex; align-items:center; gap:0.5rem;
  }
  .rw-section-lbl::after { content:''; flex:1; height:1px; background:rgba(0,0,0,0.055); }

  /* top grid */
  .rw-top { display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1.5rem; }
  @media(max-width:600px) { .rw-top { grid-template-columns:1fr; } }

  /* tiers */
  .rw-tiers { display:grid; grid-template-columns:repeat(auto-fill,minmax(178px,1fr)); gap:0.7rem; }
  .rw-tier-card {
    border:1px solid rgba(0,0,0,0.08); border-radius:3px; padding:0.9rem;
    display:flex; flex-direction:column; gap:0.4rem; transition:border-color 0.18s;
  }
  .rw-tier-card:hover { border-color:rgba(0,0,0,0.18); }
  .rw-tier-card.active { border-color:rgba(22,163,74,0.38); background:rgba(22,163,74,0.025); }
  .rw-tier-pts { font-size:0.6rem; font-weight:600; color:rgba(30,30,30,0.35); letter-spacing:0.05em; }

  /* tabs */
  .rw-tabs { display:flex; border-bottom:1px solid rgba(0,0,0,0.09); margin-bottom:1.5rem; }
  .rw-tab {
    padding:0.52rem 1.1rem;
    font-family:"Geist Mono",monospace; font-size:0.68rem; font-weight:700;
    letter-spacing:0.1em; text-transform:uppercase;
    color:rgba(30,30,30,0.42); background:none; border:none;
    border-bottom:2px solid transparent; cursor:pointer; margin-bottom:-1px;
    transition:color 0.18s, border-color 0.18s;
  }
  .rw-tab:hover { color:#111; }
  .rw-tab.active { color:#111; border-bottom-color:#16a34a; }

  /* tab count badge */
  .rw-tab-cnt {
    display:inline-flex; align-items:center; justify-content:center;
    min-width:18px; height:18px; border-radius:9px;
    background:rgba(0,0,0,0.07); font-size:0.58rem; font-weight:700;
    padding:0 5px; margin-left:0.4rem; vertical-align:middle;
    letter-spacing:0;
  }
  .rw-tab.active .rw-tab-cnt { background:rgba(22,163,74,0.15); color:#16a34a; }

  /* states */
  .rw-loading { text-align:center; padding:3rem; font-size:0.75rem; color:rgba(30,30,30,0.38); letter-spacing:0.08em; }
  .rw-error   { border:1px solid rgba(220,38,38,0.2); border-radius:3px; background:rgba(220,38,38,0.04); padding:1rem 1.2rem; font-size:0.72rem; color:#dc2626; letter-spacing:0.03em; }
  .rw-retry   { background:none; border:1px solid rgba(220,38,38,0.3); border-radius:2px; font-family:"Geist Mono",monospace; font-size:0.65rem; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; color:#dc2626; cursor:pointer; padding:0.35rem 0.7rem; margin-top:0.6rem; transition:background 0.15s; }
  .rw-retry:hover { background:rgba(220,38,38,0.06); }
`;

const TIERS = [
  { label:'Eco Starter',        pts:'0–19 pts'  },
  { label:'Green Explorer',     pts:'20–49 pts' },
  { label:'Sustainability Pro', pts:'50–99 pts' },
  { label:'Planet Guardian',    pts:'100+ pts'  },
];

export default function Rewards() {
  const [summary,     setSummary]     = useState(null);
  const [marketplace, setMarketplace] = useState([]);
  const [history,     setHistory]     = useState([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');
  const [tab,         setTab]         = useState('marketplace');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [sumRes, mktRes, hisRes] = await Promise.all([
        getMyRewardsSummary(),
        getMarketplace(),
        getRewardHistory(1, 20),
      ]);

      const pts = sumRes.data?.total_points ?? 0;
      setSummary(sumRes.data);
      setTotalPoints(pts);
      setMarketplace(mktRes.data?.coupons ?? []);
      setHistory(hisRes.data?.data ?? []);
    } catch {
      setError('Failed to load rewards. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // counts for tab badges
  const ownedCount     = marketplace.filter(c => c.display_status === 'RESERVED' || c.display_status === 'REDEEMED').length;
  const availableCount = marketplace.filter(c => c.display_status === 'AVAILABLE' || c.display_status === 'LOCKED').length;

  // split coupons by ownership
  const marketplaceCoupons = marketplace.filter(
    c => c.display_status === 'AVAILABLE' || c.display_status === 'LOCKED'
  );
  const ownedCoupons = marketplace.filter(
    c => c.display_status === 'RESERVED' || c.display_status === 'REDEEMED'
  );

  return (
    <>
      <style>{styles}</style>
      <div className="rw-page">

        {/* Title */}
        <div className="rw-reveal" data-d="0">
          <h1 className="rw-title">Eco Rewards</h1>
        </div>

        {/* Error */}
        {error && !loading && (
          <div className="rw-reveal rw-error" data-d="1">
            {error}
            <br />
            <button className="rw-retry" onClick={load}>Retry</button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div>
            <div className="rw-top">
              <div className="rw-panel" style={{ minHeight: 160 }} />
              <div className="rw-panel" style={{ minHeight: 160 }} />
            </div>
            <div className="rw-panel">
              <CouponSkeleton count={6} />
            </div>
          </div>
        )}

        {/* Content */}
        {!loading && !error && summary && (
          <>
            {/* Top row */}
            <div className="rw-top rw-reveal" data-d="1">
              <RewardPointsCard
                totalPoints={totalPoints}
                ecoLevel={summary.eco_level}
              />
              <div className="rw-panel" style={{ padding: '1.5rem' }}>
                <div className="rw-section-lbl">Level Tiers</div>
                <div className="rw-tiers">
                  {TIERS.map(tier => (
                    <div
                      key={tier.label}
                      className={`rw-tier-card${summary.eco_level?.label === tier.label ? ' active' : ''}`}
                    >
                      <EcoBadge level={tier.label} size="sm" />
                      <div className="rw-tier-pts">{tier.pts}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Tabbed panel */}
            <div className="rw-panel rw-reveal" data-d="2">
              <div className="rw-tabs">
                <button
                  className={`rw-tab${tab === 'marketplace' ? ' active' : ''}`}
                  onClick={() => setTab('marketplace')}
                >
                  Marketplace
                  <span className="rw-tab-cnt">{availableCount}</span>
                </button>
                <button
                  className={`rw-tab${tab === 'owned' ? ' active' : ''}`}
                  onClick={() => setTab('owned')}
                >
                  My Rewards
                  <span className="rw-tab-cnt">{ownedCount}</span>
                </button>
                <button
                  className={`rw-tab${tab === 'history' ? ' active' : ''}`}
                  onClick={() => setTab('history')}
                >
                  History
                </button>
              </div>

              {tab === 'marketplace' && (
                <>
                  <div className="rw-section-lbl">Available Drops</div>
                  {marketplaceCoupons.length === 0
                    ? <MarketplaceEmpty />
                    : <CouponGrid
                        coupons={marketplaceCoupons}
                        totalPoints={totalPoints}
                        onUpdate={load}
                      />
                  }
                </>
              )}

              {tab === 'owned' && (
                <>
                  <div className="rw-section-lbl">Your Reserved Rewards</div>
                  {ownedCoupons.length === 0
                    ? (
                      <div style={{ textAlign:'center', padding:'2.5rem 0', fontFamily:'"Geist Mono",monospace', fontSize:'0.75rem', color:'rgba(30,30,30,0.38)', letterSpacing:'0.05em' }}>
                        No rewards claimed yet. Earn points and claim from the Marketplace.
                      </div>
                    )
                    : <CouponGrid
                        coupons={ownedCoupons}
                        totalPoints={totalPoints}
                        onUpdate={load}
                      />
                  }
                </>
              )}

              {tab === 'history' && (
                <>
                  <div className="rw-section-lbl">Transaction Log</div>
                  <RewardHistory transactions={history} />
                </>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
