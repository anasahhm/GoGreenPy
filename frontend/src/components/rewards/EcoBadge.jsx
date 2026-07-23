import React from 'react';
import { Shield, Crown, Leaf, Star } from 'lucide-react';

const LEVEL_CONFIG = {
  'Planet Guardian': {
    icon: Crown,
    rank: 4,
    gradient: 'linear-gradient(135deg, #f472b6 0%, #a78bfa 50%, #60a5fa 100%)',
    borderColor: 'rgba(244,114,182,0.55)',
    glowColor: 'rgba(244,114,182,0.28)',
    labelColor: '#f472b6',
  },
  'Sustainability Pro': {
    icon: Shield,
    rank: 3,
    gradient: 'linear-gradient(135deg, #1a1a1f 0%, #a78bfa 70%, #c4b5fd 100%)',
    borderColor: 'rgba(167,139,250,0.5)',
    glowColor: 'rgba(167,139,250,0.22)',
    labelColor: '#a78bfa',
  },
  'Green Explorer': {
    icon: Star,
    rank: 2,
    gradient: 'linear-gradient(135deg, #14141a 0%, #3b3f6b 60%, #60a5fa 100%)',
    borderColor: 'rgba(96,165,250,0.4)',
    glowColor: 'rgba(96,165,250,0.16)',
    labelColor: '#60a5fa',
  },
  'Eco Starter': {
    icon: Leaf,
    rank: 1,
    gradient: 'linear-gradient(135deg, #101014 0%, #1b1b22 100%)',
    borderColor: 'rgba(255,255,255,0.14)',
    glowColor: 'rgba(255,255,255,0.05)',
    labelColor: 'rgba(245,245,247,0.55)',
  },
};

const styles = `
  .eco-badge-wrap { display: inline-flex; align-items: center; gap: 0.65rem; position: relative; }
  .eco-badge-icon-ring {
    position: relative; display: flex; align-items: center; justify-content: center;
    border-radius: 50%; padding: 2px; flex-shrink: 0;
  }
  .eco-badge-icon-inner {
    display: flex; align-items: center; justify-content: center;
    border-radius: 50%; background: #0b0b0f;
  }
  .eco-badge-label {
    font-family: "Geist Mono", monospace;
    font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase;
  }
  .eco-badge-rank-dots { display: flex; gap: 3px; margin-top: 4px; }
  .eco-badge-rank-dot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; opacity: 0.3; }
  .eco-badge-rank-dot.filled { opacity: 1; }
`;

export default function EcoBadge({ level = 'Eco Starter', size = 'md' }) {
  const cfg = LEVEL_CONFIG[level] || LEVEL_CONFIG['Eco Starter'];
  const Icon = cfg.icon;

  const sizes = {
    sm: { ring: 30, inner: 24, icon: 12, font: '0.65rem' },
    md: { ring: 38, inner: 30, icon: 15, font: '0.75rem' },
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
            boxShadow: `0 0 16px ${cfg.glowColor}, 0 0 0 1px ${cfg.borderColor}`,
          }}
        >
          <div className="eco-badge-icon-inner" style={{ width: s.inner, height: s.inner }}>
            <Icon size={s.icon} color={cfg.labelColor} strokeWidth={2.2} />
          </div>
        </div>

        <div>
          <div className="eco-badge-label" style={{ fontSize: s.font, color: cfg.labelColor }}>
            {level}
          </div>
          <div className="eco-badge-rank-dots" style={{ color: cfg.labelColor }}>
            {[1, 2, 3, 4].map((r) => (
              <div key={r} className={`eco-badge-rank-dot${r <= cfg.rank ? ' filled' : ''}`} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
