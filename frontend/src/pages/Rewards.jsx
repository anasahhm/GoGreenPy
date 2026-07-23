import React, { useState, useEffect, useCallback, useRef } from 'react';
import gsap from 'gsap';
import { Trophy, RotateCcw, Gift } from 'lucide-react';
import { getMyRewardsSummary, getMarketplace, getRewardHistory } from '../services/api';
import RewardPointsCard  from '../components/rewards/RewardPointsCard';
import CouponGrid        from '../components/rewards/CouponGrid';
import CouponSkeleton    from '../components/rewards/CouponSkeleton';
import RewardHistory     from '../components/rewards/RewardHistory';
import EcoBadge          from '../components/rewards/EcoBadge';
import MarketplaceEmpty  from '../components/rewards/MarketplaceEmpty';

/* ── Styles ─────────────────────────────────────────────────────────────── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;500;600;700&family=Fraunces:opsz,wght@9..144,300;9..144,500&display=swap');

  :root { --rw-nav-h: 68px; }

  .rw-page {
    position: relative;
    z-index: 1;
    max-width: 1240px;
    margin: 0 auto;
    padding: calc(var(--rw-nav-h) + 3rem) 1.75rem 5rem;
    font-family: "Geist Mono", monospace;
    color: #f5f5f7;
    min-height: 100vh;
  }

  .rw-bg { position: fixed; inset: 0; z-index: -1; background: #06060a; overflow: hidden; }
  .rw-bg::before {
    content: ''; position: absolute; top: -18%; left: -8%;
    width: 55vw; height: 55vw; max-width: 650px; max-height: 650px;
    background: radial-gradient(circle, rgba(244,114,182,0.13), transparent 65%);
    filter: blur(10px);
  }
  .rw-bg::after {
    content: ''; position: absolute; bottom: -22%; right: -10%;
    width: 55vw; height: 55vw; max-width: 620px; max-height: 620px;
    background: radial-gradient(circle, rgba(167,139,250,0.14), transparent 65%);
    filter: blur(10px);
  }
  .rw-bg-vignette { position: absolute; inset: 0; background: radial-gradient(ellipse at 50% 0%, transparent 40%, rgba(0,0,0,0.55) 100%); pointer-events: none; }

  .gs-reveal { opacity: 0; }

  .rw-eyebrow {
    display:inline-flex; align-items:center; gap:0.45rem;
    font-size: 0.66rem; font-weight: 600; letter-spacing: 0.16em; text-transform: uppercase;
    color: #f472b6; padding: 0.35rem 0.75rem; border-radius: 999px;
    background: rgba(244,114,182,0.1); border: 1px solid rgba(244,114,182,0.24);
    margin-bottom: 1rem;
  }
  .rw-title {
    font-family: "Fraunces", serif;
    font-size: clamp(2rem, 4.2vw, 2.9rem);
    font-weight: 500;
    letter-spacing: -0.02em;
    line-height: 1.05;
    margin: 0 0 2.5rem;
  }

  .rw-panel {
    position: relative;
    border-radius: 20px;
    background: linear-gradient(160deg, rgba(255,255,255,0.055), rgba(255,255,255,0.015));
    border: 1px solid rgba(255,255,255,0.08);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
    padding: 2rem;
    margin-bottom: 1.1rem;
    overflow: hidden;
    box-shadow: 0 1px 0 rgba(255,255,255,0.04) inset, 0 20px 50px -30px rgba(0,0,0,0.6);
  }

  .rw-section-lbl {
    font-size: 0.66rem; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase;
    color: rgba(245,245,247,0.4); margin-bottom: 1.3rem;
    display: flex; align-items: center; gap: 0.5rem;
  }
  .rw-section-lbl::after { content:''; flex:1; height:1px; background: rgba(255,255,255,0.07); }

  .rw-top { display:grid; grid-template-columns: 1fr 1fr; gap:1.1rem; margin-bottom: 1.1rem; }
  @media(max-width:900px) { .rw-top { grid-template-columns:1fr; } }

  .rw-tiers { display:grid; grid-template-columns:repeat(2, 1fr); gap:0.85rem; }
  @media(max-width:600px) { .rw-tiers { grid-template-columns:1fr; } }

  .rw-tier-card {
    border:1px solid rgba(255,255,255,0.07); border-radius: 14px; padding:1.1rem;
    display:flex; flex-direction:column; gap:0.6rem; transition: border-color 0.2s, background 0.2s;
    background: rgba(255,255,255,0.015);
  }
  .rw-tier-card:hover { border-color: rgba(255,255,255,0.16); }
  .rw-tier-card.active { border-color: rgba(167,139,250,0.4); background: rgba(167,139,250,0.06); }
  .rw-tier-pts { font-size:0.62rem; font-weight:600; color: rgba(245,245,247,0.4); letter-spacing:0.05em; }

  .rw-tabs { display:flex; border-bottom:1px solid rgba(255,255,255,0.08); margin-bottom:1.75rem; gap: 0.4rem; }
  .rw-tab {
    padding:0.65rem 1.25rem;
    font-family:"Geist Mono",monospace; font-size:0.72rem; font-weight:600;
    letter-spacing:0.08em; text-transform:uppercase;
    color: rgba(245,245,247,0.45); background:none; border:none;
    border-bottom:2px solid transparent; cursor:pointer; margin-bottom:-1px;
    transition:color 0.18s, border-color 0.18s;
  }
  .rw-tab:hover { color: #f5f5f7; }
  .rw-tab.active { color: #f5f5f7; border-bottom-color: #a78bfa; }

  .rw-tab-cnt {
    display:inline-flex; align-items:center; justify-content:center;
    min-width:19px; height:19px; border-radius:999px;
    background: rgba(255,255,255,0.08); font-size:0.6rem; font-weight:700;
    padding:0 5px; margin-left:0.45rem; vertical-align:middle; letter-spacing:0;
  }
  .rw-tab.active .rw-tab-cnt { background: rgba(167,139,250,0.22); color: #c4b5fd; }

  .rw-loading { text-align:center; padding:3rem 2rem; font-size:0.8rem; color: rgba(245,245,247,0.4); letter-spacing:0.08em; }
  .rw-error {
    border:1px solid rgba(244,114,182,0.28); border-radius: 16px;
    background: rgba(244,114,182,0.07); padding:1.4rem; font-size:0.78rem; color:#fbcfe8; letter-spacing:0.02em;
  }
  .rw-retry {
    display:inline-flex; align-items:center; gap:0.4rem;
    background:none; border:1px solid rgba(244,114,182,0.35); border-radius:999px;
    font-family:"Geist Mono",monospace; font-size:0.68rem; font-weight:700; letter-spacing:0.06em; text-transform:uppercase;
    color:#f9a8d4; cursor:pointer; padding:0.45rem 1rem; margin-top:0.9rem; transition:background 0.15s;
  }
  .rw-retry:hover { background: rgba(244,114,182,0.1); }

  .rw-empty { text-align: center; padding: 3rem 2.5rem; color: rgba(245,245,247,0.45); }
  .rw-empty-icon {
    width: 56px; height: 56px; margin: 0 auto 1.1rem;
    border-radius: 50%; display:flex; align-items:center; justify-content:center;
    background: radial-gradient(circle, rgba(167,139,250,0.16), transparent 70%);
    color: #a78bfa;
  }
  .rw-empty-text { font-size: 0.85rem; line-height: 1.65; }
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
  const pageRef = useRef(null);

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

  useEffect(() => {
    if (loading || !pageRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        pageRef.current.querySelectorAll('.gs-reveal'),
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.08, clearProps: 'transform' }
      );
    }, pageRef);
    return () => ctx.revert();
  }, [loading, summary, tab]);

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
      <div className="rw-bg"><div className="rw-bg-vignette" /></div>

      <div className="rw-page" ref={pageRef}>

        {/* Title */}
        <div className="gs-reveal">
          <span className="rw-eyebrow"><Trophy size={12} /> Achievement Center</span>
          <h1 className="rw-title">Eco Rewards</h1>
        </div>

        {/* Error */}
        {error && !loading && (
          <div className="rw-error gs-reveal">
            {error}
            <br />
            <button className="rw-retry" onClick={load}><RotateCcw size={12} /> Retry</button>
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
            {/* Top row - Points + Tiers side by side */}
            <div className="rw-top gs-reveal">
              <RewardPointsCard
                totalPoints={totalPoints}
                ecoLevel={summary.eco_level}
              />
              <div className="rw-panel">
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

            {/* Tabbed panel - Full width */}
            <div className="rw-panel gs-reveal">
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
                      <div className="rw-empty">
                        <div className="rw-empty-icon"><Gift size={24} strokeWidth={1.6} /></div>
                        <p className="rw-empty-text">
                          No rewards claimed yet.<br />
                          <span style={{ fontSize: '0.8rem' }}>Earn points and claim from the Marketplace.</span>
                        </p>
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
