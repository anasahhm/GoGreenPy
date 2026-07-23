// frontend/src/components/rewards/CouponGrid.jsx
import React, { useState } from 'react';
import {
  Lock, Check, Copy, ShoppingBag, Zap, Leaf,
  Sun, Recycle, MapPin, Unlock, RotateCcw
} from 'lucide-react';
import { claimCoupon, redeemCoupon } from '../../services/api';
import MarketplaceEmpty from './MarketplaceEmpty';

const CATEGORY_ICONS = {
  'Sustainable Shopping': ShoppingBag,
  'EV Rides':             Zap,
  'Organic Food':         Leaf,
  'Green Energy':         Sun,
  'Recycling':            Recycle,
  'Eco Travel':           MapPin,
};

const STATUS_META = {
  AVAILABLE: { label: 'Available', border: 'rgba(96,165,250,0.28)',  bg: 'linear-gradient(160deg, rgba(255,255,255,0.05), rgba(255,255,255,0.015))', glow: false },
  LOCKED:    { label: 'Locked',    border: 'rgba(255,255,255,0.08)', bg: 'rgba(255,255,255,0.02)', glow: false },
  RESERVED:  { label: 'Yours',     border: 'rgba(167,139,250,0.45)', bg: 'linear-gradient(160deg, rgba(167,139,250,0.1), rgba(255,255,255,0.02))', glow: true  },
  REDEEMED:  { label: 'Redeemed',  border: 'rgba(255,255,255,0.1)',  bg: 'rgba(255,255,255,0.015)', glow: false },
};

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;500;600;700&display=swap');

  @keyframes cpn-in    { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
  @keyframes cpn-glow  { 0%,100% { box-shadow: 0 0 0 0 rgba(167,139,250,0); } 60% { box-shadow: 0 0 22px 3px rgba(167,139,250,0.16); } }
  @keyframes cpn-spin  { to { transform: rotate(360deg); } }

  .cpn-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(282px, 1fr)); gap: 1.1rem; }
  .cpn-card {
    position: relative;
    border-radius: 16px;
    padding: 1.5rem;
    font-family: "Geist Mono", monospace;
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    transition: border-color 0.22s ease, box-shadow 0.22s ease, transform 0.22s ease;
    animation: cpn-in 0.45s cubic-bezier(0.22,1,0.36,1) both;
    overflow: hidden;
  }
  .cpn-card:hover { transform: translateY(-3px); }
  .cpn-card.status-locked { opacity: 0.5; }
  .cpn-card.status-glow { animation: cpn-in 0.45s both, cpn-glow 2.2s 0.5s ease-in-out; }

  .cpn-header { display:flex; align-items:flex-start; gap:0.75rem; margin-bottom:0.9rem; }
  .cpn-icon {
    width:38px; height:38px; border-radius:11px;
    display:flex; align-items:center; justify-content:center;
    flex-shrink:0;
    border:1px solid rgba(255,255,255,0.1);
    background:rgba(255,255,255,0.03);
    transition:border-color 0.18s;
  }
  .cpn-icon.owned { border-color:rgba(167,139,250,0.35); background:rgba(167,139,250,0.1); }
  .cpn-title { font-size:0.86rem; font-weight:600; color:#f5f5f7; letter-spacing:-0.01em; line-height:1.25; }
  .cpn-cat   { font-size:0.62rem; font-weight:600; letter-spacing:0.1em; text-transform:uppercase; color:rgba(245,245,247,0.4); margin-top:3px; }

  .cpn-badge {
    display:inline-block; padding:0.22rem 0.6rem; border-radius:999px;
    font-size:0.66rem; font-weight:700; letter-spacing:0.06em;
    background:rgba(96,165,250,0.12); border:1px solid rgba(96,165,250,0.28);
    color:#93c5fd; margin-bottom:0.8rem;
  }
  .cpn-desc { font-size:0.75rem; color:rgba(245,245,247,0.55); line-height:1.6; margin-bottom:1rem; }
  .cpn-footer {
    display:flex; justify-content:space-between; align-items:center;
    font-size:0.63rem; color:rgba(245,245,247,0.4);
    letter-spacing:0.04em; flex-wrap:wrap; gap:0.3rem;
  }
  .cpn-pts { font-weight:600; color:rgba(245,245,247,0.6); }

  .cpn-code-row {
    display:flex; align-items:center; gap:0.5rem;
    margin-top:0.9rem; padding:0.6rem 0.8rem;
    background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.09); border-radius:10px;
  }
  .cpn-code { flex:1; font-size:0.74rem; font-weight:700; letter-spacing:0.12em; color:#c4b5fd; }
  .cpn-copy { background:none; border:none; cursor:pointer; padding:2px; color:rgba(245,245,247,0.4); transition:color 0.15s; }
  .cpn-copy:hover { color:#c4b5fd; }

  .cpn-btn {
    width:100%; margin-top:0.8rem;
    padding:0.65rem; border-radius:999px;
    font-family:"Geist Mono",monospace;
    font-size:0.7rem; font-weight:700; letter-spacing:0.08em; text-transform:uppercase;
    cursor:pointer; display:flex; align-items:center; justify-content:center; gap:0.4rem;
    transition:background 0.18s, border-color 0.18s, opacity 0.18s, transform 0.2s;
  }
  .cpn-btn:disabled { opacity:0.45; cursor:not-allowed; }
  .cpn-btn.claim {
    background:linear-gradient(135deg, rgba(167,139,250,0.9), rgba(96,165,250,0.9)); border:none; color:#08080b;
  }
  .cpn-btn.claim:not(:disabled):hover { transform: translateY(-2px); box-shadow: 0 10px 24px -10px rgba(167,139,250,0.55); }
  .cpn-btn.redeem { background:none; border:1px solid rgba(255,255,255,0.14); color:rgba(245,245,247,0.7); }
  .cpn-btn.redeem:not(:disabled):hover { background:rgba(255,255,255,0.04); border-color:rgba(255,255,255,0.26); }

  .cpn-spinner { animation: cpn-spin 0.8s linear infinite; }

  .cpn-lock-row {
    display:flex; align-items:center; gap:0.4rem;
    margin-top:0.85rem; font-size:0.68rem; color:rgba(245,245,247,0.4); letter-spacing:0.05em;
  }
  .cpn-redeemed-row {
    display:flex; align-items:center; gap:0.35rem;
    margin-top:0.75rem; font-size:0.64rem; font-weight:600;
    letter-spacing:0.08em; text-transform:uppercase;
    color:rgba(245,245,247,0.4);
    padding:0.3rem 0.6rem; border:1px solid rgba(255,255,255,0.09); border-radius:999px; width:fit-content;
  }
  .cpn-err { margin-top:0.55rem; font-size:0.68rem; color:#f9a8d4; letter-spacing:0.03em; line-height:1.4; }
`;

function CouponCard({ coupon, totalPoints, onUpdate }) {
  const [loading, setLoading]   = useState(false);
  const [copied,  setCopied]    = useState(false);
  const [error,   setError]     = useState('');
  // optimistic display_status
  const [localStatus, setLocalStatus] = useState(coupon.display_status);
  const [localCode,   setLocalCode]   = useState(coupon.code);

  const meta   = STATUS_META[localStatus] || STATUS_META.AVAILABLE;
  const Icon   = CATEGORY_ICONS[coupon.category] || Leaf;
  const isOwned = localStatus === 'RESERVED' || localStatus === 'REDEEMED';

  const handleCopy = () => {
    navigator.clipboard?.writeText(localCode || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleClaim = async () => {
    setError('');
    setLoading(true);
    // optimistic update
    setLocalStatus('RESERVED');
    try {
      const res = await claimCoupon(coupon.id);
      const updated = res.data?.coupon;
      setLocalStatus(updated?.display_status || 'RESERVED');
      setLocalCode(updated?.code || null);
      onUpdate?.();
    } catch (e) {
      setLocalStatus(coupon.display_status); // rollback
      const msg = e?.response?.data?.detail || 'Claim failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await redeemCoupon(coupon.id);
      setLocalStatus('REDEEMED');
      setLocalCode(res.data?.code || localCode);
      onUpdate?.();
    } catch (e) {
      const msg = e?.response?.data?.detail || 'Redeem failed.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`cpn-card status-${localStatus.toLowerCase()}${meta.glow ? ' status-glow' : ''}`}
      style={{ border: `1px solid ${meta.border}`, background: meta.bg }}
    >
      <div className="cpn-header">
        <div className={`cpn-icon${isOwned ? ' owned' : ''}`}>
          <Icon size={16} color={isOwned ? '#c4b5fd' : 'rgba(245,245,247,0.4)'} strokeWidth={1.8} />
        </div>
        <div>
          <div className="cpn-title">{coupon.title}</div>
          <div className="cpn-cat">{coupon.category}</div>
        </div>
      </div>

      <div className="cpn-badge">{coupon.discount_label}</div>
      <div className="cpn-desc">{coupon.description}</div>

      <div className="cpn-footer">
        <span>{coupon.expiry_note}</span>
        <span className="cpn-pts">{coupon.required_points} pts</span>
      </div>

      {/* Code row — only when owned */}
      {isOwned && localCode && (
        <div className="cpn-code-row">
          <span className="cpn-code">{localCode}</span>
          <button className="cpn-copy" onClick={handleCopy}>
            {copied ? <Check size={13} color="#c4b5fd" /> : <Copy size={13} />}
          </button>
        </div>
      )}

      {/* CTAs */}
      {localStatus === 'AVAILABLE' && (
        <button className="cpn-btn claim" onClick={handleClaim} disabled={loading}>
          {loading
            ? <RotateCcw size={13} className="cpn-spinner" />
            : <><Unlock size={13} /> Claim Reward</>}
        </button>
      )}

      {localStatus === 'RESERVED' && (
        <button className="cpn-btn redeem" onClick={handleRedeem} disabled={loading}>
          {loading
            ? <RotateCcw size={13} className="cpn-spinner" />
            : 'Mark as Redeemed'}
        </button>
      )}

      {localStatus === 'REDEEMED' && (
        <div className="cpn-redeemed-row">
          <Check size={11} /> Redeemed
        </div>
      )}

      {localStatus === 'LOCKED' && (
        <div className="cpn-lock-row">
          <Lock size={11} />
          {coupon.points_gap > 0 ? `${coupon.points_gap} more pts to unlock` : 'Not yet unlocked'}
        </div>
      )}

      {error && <div className="cpn-err">{error}</div>}
    </div>
  );
}

export default function CouponGrid({ coupons = [], totalPoints = 0, onUpdate }) {
  if (!coupons.length) return <MarketplaceEmpty />;

  return (
    <>
      <style>{styles}</style>
      <div className="cpn-grid">
        {coupons.map((c, i) => (
          <CouponCard
            key={c.id}
            coupon={c}
            totalPoints={totalPoints}
            onUpdate={onUpdate}
          />
        ))}
      </div>
    </>
  );
}
