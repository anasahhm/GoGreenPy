// frontend/src/components/rewards/RewardUnlockPopup.jsx
import React, { useEffect, useState } from 'react';
import { Award, X, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;600;700&display=swap');

  @keyframes rup-in  { from { opacity:0; transform:translateY(20px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }
  @keyframes rup-bar { from { width:100%; } to { width:0%; } }

  .rup-portal {
    position:fixed; bottom:1.5rem; right:1.5rem;
    z-index:2000; display:flex; flex-direction:column; gap:0.6rem;
    pointer-events:none;
  }
  .rup-card {
    pointer-events:auto;
    font-family:"Geist Mono",monospace;
    background:#fff;
    border:1px solid rgba(22,163,74,0.38);
    border-radius:4px;
    padding:1rem 1.2rem 0;
    width:304px;
    overflow:hidden;
    animation:rup-in 0.45s cubic-bezier(0.22,1,0.36,1) forwards;
    box-shadow:0 8px 32px rgba(0,0,0,0.08);
  }
  .rup-body { display:flex; align-items:flex-start; gap:0.6rem; padding-bottom:0.9rem; }
  .rup-icon {
    width:30px; height:30px; border-radius:50%;
    display:flex; align-items:center; justify-content:center;
    background:rgba(22,163,74,0.1); border:1px solid rgba(22,163,74,0.25); flex-shrink:0;
  }
  .rup-content { flex:1; min-width:0; }
  .rup-label { font-size:0.6rem; font-weight:700; letter-spacing:0.12em; text-transform:uppercase; color:#16a34a; }
  .rup-title { font-size:0.8rem; font-weight:700; color:#111; letter-spacing:-0.01em; margin-top:2px; }
  .rup-meta  { font-size:0.65rem; color:rgba(30,30,30,0.45); margin-top:2px; }
  .rup-close { background:none; border:none; cursor:pointer; color:rgba(30,30,30,0.32); padding:2px; flex-shrink:0; transition:color 0.15s; }
  .rup-close:hover { color:#111; }

  .rup-pills { display:flex; align-items:center; gap:0.4rem; flex-wrap:wrap; padding-bottom:0.75rem; }
  .rup-pill {
    font-size:0.65rem; font-weight:700; letter-spacing:0.07em;
    padding:0.2rem 0.5rem; border-radius:2px;
  }
  .rup-pill-green { background:rgba(22,163,74,0.1); border:1px solid rgba(22,163,74,0.22); color:#16a34a; }
  .rup-pill-grey  { background:rgba(0,0,0,0.04); border:1px solid rgba(0,0,0,0.1); color:rgba(30,30,30,0.5); }

  .rup-link {
    display:flex; align-items:center; gap:0.3rem;
    font-size:0.62rem; font-weight:600; letter-spacing:0.08em; text-transform:uppercase;
    color:rgba(30,30,30,0.38); background:none; border:none; cursor:pointer;
    padding-bottom:0.9rem; transition:color 0.15s;
  }
  .rup-link:hover { color:#16a34a; }

  .rup-progress {
    height:2px; background:rgba(22,163,74,0.18); margin:0 -1.2rem;
  }
  .rup-progress-fill {
    height:100%; background:#16a34a;
    animation:rup-bar 7s linear forwards;
  }
`;

function ToastCard({ coupon, onClose }) {
  const navigate = useNavigate();
  return (
    <div className="rup-card">
      <div className="rup-body">
        <div className="rup-icon">
          <Award size={14} color="#16a34a" strokeWidth={2.2} />
        </div>
        <div className="rup-content">
          <div className="rup-label">Reward Reserved</div>
          <div className="rup-title">{coupon.title}</div>
          <div className="rup-meta">{coupon.category}</div>
        </div>
        <button className="rup-close" onClick={onClose}><X size={13} /></button>
      </div>
      <div className="rup-pills">
        <span className="rup-pill rup-pill-green">{coupon.discount_label}</span>
        {coupon.code && <span className="rup-pill rup-pill-grey">{coupon.code}</span>}
      </div>
      <button className="rup-link" onClick={() => { navigate('/rewards'); onClose(); }}>
        View in My Rewards <ArrowRight size={10} />
      </button>
      <div className="rup-progress">
        <div className="rup-progress-fill" />
      </div>
    </div>
  );
}

export default function RewardUnlockPopup({ newlyCoupons = [] }) {
  const [visible, setVisible] = useState([]);

  useEffect(() => {
    if (newlyCoupons.length) {
      setVisible(newlyCoupons.map(c => c.id));
      const t = setTimeout(() => setVisible([]), 7200);
      return () => clearTimeout(t);
    }
  }, [newlyCoupons]);

  const dismiss = id => setVisible(v => v.filter(x => x !== id));
  const shown   = newlyCoupons.filter(c => visible.includes(c.id));
  if (!shown.length) return null;

  return (
    <>
      <style>{styles}</style>
      <div className="rup-portal">
        {shown.map(c => (
          <ToastCard key={c.id} coupon={c} onClose={() => dismiss(c.id)} />
        ))}
      </div>
    </>
  );
}
