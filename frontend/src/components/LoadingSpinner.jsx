import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="flex justify-center items-center h-64" style={{ background: 'transparent' }}>
      <div style={{ position: 'relative', width: 56, height: 56 }}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(167,139,250,0.35), transparent 70%)',
            filter: 'blur(10px)',
          }}
        />
        <div
          className="animate-spin"
          style={{
            position: 'relative',
            width: 56,
            height: 56,
            borderRadius: '50%',
            border: '2.5px solid rgba(167,139,250,0.15)',
            borderTopColor: '#a78bfa',
            borderRightColor: '#60a5fa',
          }}
        />
      </div>
    </div>
  );
};

export default LoadingSpinner;
