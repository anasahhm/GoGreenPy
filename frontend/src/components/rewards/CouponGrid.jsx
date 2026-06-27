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
  AVAILABLE: { label: 'Available',  border: 'rgba(22,163,74,0.22)', bg: '#fff',                  glow: false },
  LOCKED:    { label: 'Locked',     border: 'rgba(0,0,0,0.08)',     bg: 'rgba(0,0,0,0.015)',     glow: false },
  RESERVED:  { label: 'Yours',      border: 'rgba(22,163,74,0.4)',  bg: 'rgba(22,163,74,0.025)', glow: true  },
  REDEEMED:  { label: 'Redeemed',   border: 'rgba(0,0,0,0.1)',      bg: 'rgba(0,0,0,0.02)',      glow: false },
};

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;600;700&display=swap');

  @keyframes cpn-in    { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
  @keyframes cpn-glow  { 0%,100% { box-shadow: 0 0 0 0 rgba(22,163,74,0); } 60% { box-shadow: 0 0 18px 2px rgba(22,163,74,0.12); } }
  @keyframes cpn-spin  { to { transform: rotate(360deg); } }

  .cpn-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(282px, 1fr));
    gap: 1rem;
  }
  .cpn-card {
    position: relative;
    border-radius: 4px;
    padding: 1.5rem;
    font-family: "Geist Mono", monospace;
    transition: border-color 0.22s ease, box-shadow 0.22s ease, transform 0.22s ease;
    animation: cpn-in 0.4s cubic-bezier(0.22,1,0.36,1) both;
    overflow: hidden;
  }
  .cpn-card::before {
    content: '';
    position: absolute; top:0; left:0;
    width:100%; height:1.5px;
    background: linear-gradient(90deg, transparent, rgba(22,163,74,0.45), transparent);
    opacity: 0;
    transition: opacity 0.22s;
  }
  .cpn-card:hover { transform: translateY(-1px); }
  .cpn-card:hover::before { opacity: 1; }
  .cpn-card.status-locked { opacity: 0.52; }
  .cpn-card.status-glow { animation: cpn-in 0.4s both, cpn-glow 2s 0.5s ease-in-out; }

  .cpn-header { display:flex; align-items:flex-start; gap:0.75rem; margin-bottom:0.85rem; }
  .cpn-icon {
    width:36px; height:36px; border-radius:3px;
    display:flex; align-items:center; justify-content:center;
    flex-shrink:0;
    border:1px solid rgba(0,0,0,0.09);
    background:rgba(0,0,0,0.025);
    transition:border-color 0.18s;
  }
  .cpn-icon.owned { border-color:rgba(22,163,74,0.3); background:rgba(22,163,74,0.05); }
  .cpn-title { font-size:0.82rem; font-weight:700; color:#111; letter-spacing:-0.01em; line-height:1.2; }
  .cpn-cat   { font-size:0.6rem; font-weight:600; letter-spacing:0.1em; text-transform:uppercase; color:rgba(30,30,30,0.38); margin-top:2px; }

  .cpn-badge {
    display:inline-block;
    padding:0.18rem 0.5rem;
    border-radius:2px;
    font-size:0.65rem; font-weight:700; letter-spacing:0.08em;
    background:rgba(22,163,74,0.09);
    border:1px solid rgba(22,163,74,0.22);
    color:#16a34a;
    margin-bottom:0.7rem;
  }
  .cpn-desc {
    font-size:0.72rem; color:rgba(30,30,30,0.58);
    line-height:1.55; margin-bottom:0.9rem;
  }
  .cpn-footer {
    display:flex; justify-content:space-between; align-items:center;
    font-size:0.6rem; color:rgba(30,30,30,0.38);
    letter-spacing:0.04em; flex-wrap:wrap; gap:0.3rem;
  }
  .cpn-pts { font-weight:600; }

  /* code row */
  .cpn-code-row {
    display:flex; align-items:center; gap:0.4rem;
    margin-top:0.85rem; padding:0.5rem 0.7rem;
    background:rgba(0,0,0,0.028); border:1px solid rgba(0,0,0,0.08); border-radius:2px;
  }
  .cpn-code { flex:1; font-size:0.72rem; font-weight:700; letter-spacing:0.12em; color:#16a34a; }
  .cpn-copy { background:none; border:none; cursor:pointer; padding:2px; color:rgba(30,30,30,0.32); transition:color 0.15s; }
  .cpn-copy:hover { color:#16a34a; }

  /* action buttons */
  .cpn-btn {
    width:100%; margin-top:0.7rem;
    padding:0.52rem; border-radius:2px;
    font-family:"Geist Mono",monospace;
    font-size:0.68rem; font-weight:700; letter-spacing:0.1em; text-transform:uppercase;
    cursor:pointer; display:flex; align-items:center; justify-content:center; gap:0.4rem;
    transition:background 0.18s, border-color 0.18s, opacity 0.18s;
  }
  .cpn-btn:disabled { opacity:0.45; cursor:not-allowed; }
  .cpn-btn.claim {
    background:none; border:1px solid rgba(22,163,74,0.35); color:#16a34a;
  }
  .cpn-btn.claim:not(:disabled):hover { background:rgba(22,163,74,0.07); border-color:rgba(22,163,74,0.6); }
  .cpn-btn.redeem {
    background:none; border:1px solid rgba(0,0,0,0.12); color:rgba(30,30,30,0.6);
  }
  .cpn-btn.redeem:not(:disabled):hover { background:rgba(0,0,0,0.03); border-color:rgba(0,0,0,0.22); }

  .cpn-spinner { animation: cpn-spin 0.8s linear infinite; }

  /* lock / status rows */
  .cpn-lock-row {
    display:flex; align-items:center; gap:0.35rem;
    margin-top:0.75rem; font-size:0.65rem; color:rgba(30,30,30,0.38); letter-spacing:0.05em;
  }
  .cpn-redeemed-row {
    display:flex; align-items:center; gap:0.3rem;
    margin-top:0.65rem; font-size:0.63rem; font-weight:600;
    letter-spacing:0.08em; text-transform:uppercase;
    color:rgba(30,30,30,0.35);
    padding:0.25rem 0.5rem; border:1px solid rgba(0,0,0,0.08); border-radius:2px; width:fit-content;
  }
  .cpn-err {
    margin-top:0.5rem; font-size:0.65rem; color:#dc2626; letter-spacing:0.03em; line-height:1.4;
  }
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
          <Icon size={16} color={isOwned ? '#16a34a' : 'rgba(30,30,30,0.38)'} strokeWidth={1.8} />
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
            {copied ? <Check size={13} color="#16a34a" /> : <Copy size={13} />}
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
