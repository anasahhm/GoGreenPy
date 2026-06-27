import React from 'react';
import { Shield, Crown, Leaf, Star } from 'lucide-react';

const LEVEL_CONFIG = {
  'Planet Guardian': {
    icon: Crown,
    rank: 4,
    gradient: 'linear-gradient(135deg, #14532d 0%, #166534 40%, #15803d 70%, #22c55e 100%)',
    borderColor: 'rgba(34,197,94,0.55)',
    glowColor: 'rgba(34,197,94,0.18)',
    labelColor: '#22c55e',
  },
  'Sustainability Pro': {
    icon: Shield,
    rank: 3,
    gradient: 'linear-gradient(135deg, #1a1a1a 0%, #16a34a 60%, #22c55e 100%)',
    borderColor: 'rgba(22,163,74,0.45)',
    glowColor: 'rgba(22,163,74,0.13)',
    labelColor: '#16a34a',
  },
  'Green Explorer': {
    icon: Star,
    rank: 2,
    gradient: 'linear-gradient(135deg, #111 0%, #14532d 60%, #16a34a 100%)',
    borderColor: 'rgba(20,83,45,0.45)',
    glowColor: 'rgba(20,83,45,0.12)',
    labelColor: '#4ade80',
  },
  'Eco Starter': {
    icon: Leaf,
    rank: 1,
    gradient: 'linear-gradient(135deg, #0a0a0a 0%, #111 60%, #1a2e1a 100%)',
    borderColor: 'rgba(0,0,0,0.2)',
    glowColor: 'rgba(0,0,0,0.06)',
    labelColor: 'rgba(30,30,30,0.6)',
  },
};

const styles = `
  .eco-badge-wrap {
    display: inline-flex;
    align-items: center;
    gap: 0.6rem;
    position: relative;
  }
  .eco-badge-icon-ring {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    padding: 2px;
    flex-shrink: 0;
  }
  .eco-badge-icon-inner {
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: #fff;
  }
  .eco-badge-label {
    font-family: "Geist Mono", monospace;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }
  .eco-badge-rank-dots {
    display: flex;
    gap: 3px;
    margin-top: 2px;
  }
  .eco-badge-rank-dot {
    width: 5px; height: 5px;
    border-radius: 50%;
    background: currentColor;
    opacity: 0.35;
  }
  .eco-badge-rank-dot.filled { opacity: 1; }
`;

export default function EcoBadge({ level = 'Eco Starter', size = 'md' }) {
  const cfg = LEVEL_CONFIG[level] || LEVEL_CONFIG['Eco Starter'];
  const Icon = cfg.icon;

  const sizes = {
    sm: { ring: 28, inner: 22, icon: 12, font: '0.65rem' },
    md: { ring: 36, inner: 28, icon: 15, font: '0.75rem' },
    lg: { ring: 48, inner: 38, icon: 20, font: '0.9rem' },
    xl: { ring: 64, inner: 52, icon: 26, font: '1.05rem' },
  };
  const s = sizes[size] || sizes.md;

  return (
    <>
      <style>{styles}</style>
      <div className="eco-badge-wrap">
        <div
          className="eco-badge-icon-ring"
          style={{
            width: s.ring,
            height: s.ring,
            background: cfg.gradient,
            boxShadow: `0 0 12px ${cfg.glowColor}, 0 0 0 1px ${cfg.borderColor}`,
          }}
        >
          <div
            className="eco-badge-icon-inner"
            style={{ width: s.inner, height: s.inner }}
          >
            <Icon size={s.icon} color={cfg.labelColor} strokeWidth={2.2} />
          </div>
        </div>

        <div>
          <div
            className="eco-badge-label"
            style={{ fontSize: s.font, color: cfg.labelColor }}
          >
            {level}
          </div>
          <div className="eco-badge-rank-dots" style={{ color: cfg.labelColor }}>
            {[1, 2, 3, 4].map((r) => (
              <div
                key={r}
                className={`eco-badge-rank-dot${r <= cfg.rank ? ' filled' : ''}`}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
