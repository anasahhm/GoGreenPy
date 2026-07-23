import React from 'react';

/* Accent gradients keyed by card title — purely presentational, chosen to
   satisfy the "premium monochrome + violet/blue/pink accent" palette. */
const ACCENTS = {
  'Carbon Footprint': { from: '#60a5fa', to: '#a78bfa', glow: 'rgba(96,165,250,0.25)' },
  'Water Usage':      { from: '#22d3ee', to: '#60a5fa', glow: 'rgba(34,211,238,0.22)' },
  'Energy Score':     { from: '#fbbf24', to: '#f472b6', glow: 'rgba(251,191,36,0.22)' },
  'Waste Generated':  { from: '#a78bfa', to: '#f472b6', glow: 'rgba(167,139,250,0.22)' },
};

const ScoreCard = ({ title, value, unit, icon, color }) => {
  const accent = ACCENTS[title] || { from: '#a78bfa', to: '#60a5fa', glow: 'rgba(167,139,250,0.2)' };

  return (
    <div
      style={{
        position: 'relative',
        borderRadius: 18,
        padding: '1.4rem 1.35rem',
        background: 'linear-gradient(160deg, rgba(255,255,255,0.055), rgba(255,255,255,0.015))',
        border: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        overflow: 'hidden',
        height: '100%',
      }}
    >
      {/* ambient glow */}
      <div
        style={{
          position: 'absolute',
          top: -30, right: -30,
          width: 110, height: 110,
          background: `radial-gradient(circle, ${accent.glow}, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative' }}>
        <div>
          <p
            style={{
              fontSize: '0.68rem',
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'rgba(245,245,247,0.45)',
              margin: 0,
            }}
          >
            {title}
          </p>
          <p
            style={{
              marginTop: '0.65rem',
              fontSize: '2rem',
              fontWeight: 700,
              letterSpacing: '-0.03em',
              lineHeight: 1,
              backgroundImage: `linear-gradient(135deg, ${accent.from}, ${accent.to})`,
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            {value}
            <span style={{ fontSize: '0.85rem', marginLeft: '0.35rem', color: 'rgba(245,245,247,0.5)', fontWeight: 500, WebkitTextFillColor: 'rgba(245,245,247,0.5)' }}>
              {unit}
            </span>
          </p>
        </div>

        <div
          style={{
            width: 38, height: 38,
            borderRadius: 11,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: `linear-gradient(135deg, ${accent.from}22, ${accent.to}22)`,
            border: `1px solid ${accent.from}33`,
            color: accent.from,
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
};

export default ScoreCard;
