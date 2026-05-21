import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  BarChart2,
  TrendingUp,
  Lightbulb,
  Globe,
  BrainCircuit,
  CloudSun,
  Target,
} from 'lucide-react';
import WeatherWidget from '../components/WeatherWidget';

/* ─── Styles ──────────────────────────────────────────────────────────────── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Geist+Mono:wght@300;400;600;700&family=Syne:wght@400;500;600;700;800&display=swap');

  :root {
    --home-nav-h: 68px;
    --home-light: #f0f0eb;
    --home-dark: #0e0e0e;
    --home-green: #16a34a;
    --home-green-light: #22c55e;
    --home-border: rgba(255,255,255,0.12);
    --home-box-bg: rgba(255,255,255,0.06);
  }

  @keyframes home-fade-up {
    from { opacity: 0; transform: translateY(28px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes home-fade-in {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes home-line-grow {
    from { transform: scaleX(0); }
    to   { transform: scaleX(1); }
  }
  @keyframes home-gradient-shift {
    0%   { background-position: 0%; }
    100% { background-position: 300%; }
  }
  @keyframes home-scroll-bounce {
    0%, 100% { transform: translateY(0); }
    50%       { transform: translateY(5px); }
  }
  @keyframes home-card-in {
    from { opacity: 0; transform: translateY(32px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .home-root * { box-sizing: border-box; margin: 0; padding: 0; }

  .home-root {
    font-family: "Geist Mono", monospace;
    background: var(--home-light);
    color: var(--home-dark);
    overflow-x: hidden;
  }

  /* ══ HERO ══ */
  .home-hero {
    position: relative;
    width: 100%;
    height: 100svh;
    min-height: 600px;
    overflow: hidden;
    background: var(--home-dark);
    color: #fff;
  }
  .home-hero-video {
    position: absolute;
    inset: 0; width: 100%; height: 100%;
    object-fit: cover;
    z-index: 0;
  }
  .home-hero::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E");
    opacity: 0.045;
    pointer-events: none;
    z-index: 1;
  }
  .home-hero::after {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse 80% 60% at 50% 100%, rgba(22,163,74,0.18) 0%, transparent 70%);
    pointer-events: none;
    z-index: 1;
  }
  .home-hero-grid {
    position: absolute;
    inset: 0;
    z-index: 1;
    pointer-events: none;
    background-image:
      linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
    background-size: 80px 80px;
    animation: home-fade-in 1.2s 0.3s ease both;
  }
  .home-hero-header {
    position: absolute;
    inset: 0;
    z-index: 2;
    display: flex;
    flex-direction: row;
    padding: 2rem;
    padding-top: calc(var(--home-nav-h) + 1.75rem);
    gap: 2rem;
  }
  .home-hero-col {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-height: 0;
  }
  .home-hero-col--right {
    flex: 0 0 auto;
    width: 260px;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-end;
    padding-top: 0.5rem;
    opacity: 0;
    animation: home-fade-up 0.6s cubic-bezier(0.22,1,0.36,1) 0.9s forwards;
  }
  .home-hero-h1 {
    font-family: "Syne", sans-serif;
    font-size: clamp(2.6rem, 5.5vw, 6rem);
    font-weight: 750;
    line-height: 0.92;
    letter-spacing: -0.03em;
    color: #fff;
    text-shadow: 0 2px 40px rgba(0,0,0,0.5);
    opacity: 0;
    animation: home-fade-up 0.7s cubic-bezier(0.22,1,0.36,1) 0.15s forwards;
  }
  .home-descriptor {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    opacity: 0;
    animation: home-fade-up 0.6s cubic-bezier(0.22,1,0.36,1) 0.45s forwards;
  }
  .home-descriptor-sub {
    font-family: "Syne", sans-serif;
    font-size: 1.15rem;
    font-weight: 700;
    color: #fff;
    line-height: 1.3;
    letter-spacing: -0.01em;
  }
  .home-descriptor-body {
    font-size: 0.82rem;
    font-weight: 400;
    color: rgba(255,255,255,0.65);
    line-height: 1.75;
    max-width: 22rem;
  }
  .home-cta-row {
    display: flex;
    gap: 0.6rem;
    flex-wrap: wrap;
    margin-top: 0.5rem;
    opacity: 0;
    animation: home-fade-up 0.55s cubic-bezier(0.22,1,0.36,1) 0.58s forwards;
  }
  .home-cta {
    position: relative;
    display: inline-flex;
    align-items: center;
    font-family: "Geist Mono", monospace;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.13em;
    text-transform: uppercase;
    text-decoration: none;
    padding: 0.55rem 1.1rem;
    border: 1px solid var(--home-border);
    border-radius: 3px;
    background: var(--home-box-bg);
    cursor: pointer;
    color: rgba(255,255,255,0.8);
    transition: border-color 0.18s ease, background 0.18s ease, color 0.18s ease;
    overflow: hidden;
    backdrop-filter: blur(12px);
  }
  .home-cta:hover { border-color: rgba(255,255,255,0.35); background: rgba(255,255,255,0.1); color: #fff; }
  .home-cta.primary { border-color: rgba(34,197,94,0.45); background: rgba(22,163,74,0.15); color: #86efac; }
  .home-cta.primary:hover { border-color: rgba(34,197,94,0.8); background: rgba(22,163,74,0.28); color: #bbf7d0; }
  .home-cta .corner-tl,
  .home-cta .corner-br { position: absolute; width: 5px; height: 5px; opacity: 0; transition: opacity 0.18s ease; pointer-events: none; }
  .home-cta .corner-tl { top: -1px; left: -1px; border-top: 1px solid rgba(255,255,255,0.55); border-left: 1px solid rgba(255,255,255,0.55); }
  .home-cta .corner-br { bottom: -1px; right: -1px; border-bottom: 1px solid rgba(255,255,255,0.55); border-right: 1px solid rgba(255,255,255,0.55); }
  .home-cta:hover .corner-tl,
  .home-cta:hover .corner-br { opacity: 1; }
  .home-cta .link-text { display: block; overflow: hidden; height: 1em; }
  .home-cta .link-track { display: flex; flex-direction: column; transition: transform 0.4s cubic-bezier(0.76,0,0.24,1); }
  .home-cta:hover .link-track { transform: translateY(-50%); }
  .home-cta .link-track span { display: block; height: 1em; line-height: 1em; }
  .home-cta .link-track span:first-child { color: inherit; }
  .home-cta .link-track span:last-child  { color: #fff; }
  .home-cta.primary .link-track span:last-child { color: #bbf7d0; }

  .home-scroll-hint {
    position: absolute;
    right: 2rem; top: 10rem;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.4rem;
    opacity: 0;
    animation: home-fade-up 0.5s cubic-bezier(0.22,1,0.36,1) 0.85s forwards;
    z-index: 3;
  }
  .home-scroll-row { display: flex; align-items: center; gap: 0.85rem; }
  .home-scroll-line { width: 3rem; height: 1px; background: rgba(36, 34, 34, 0.35); display: block; }
  .home-scroll-label { font-size: 0.6rem; letter-spacing: 0.16em; text-transform: uppercase; color: rgba(66, 58, 58, 0.73); font-weight: 500; }
  .home-scroll-cta   { font-size: 0.6rem; letter-spacing: 0.16em; text-transform: uppercase; color: var(--home-green-light); font-weight: 600; animation: home-scroll-bounce 2s ease-in-out infinite; margin-left: 3.85rem; }

  .home-stats {
    position: absolute;
    right: 2rem; bottom: 2rem;
    display: flex;
    flex-direction: row;
    gap: 2.5rem;
    z-index: 3;
    opacity: 0;
    animation: home-fade-up 0.55s cubic-bezier(0.22,1,0.36,1) 0.75s forwards;
  }
  .home-stat { display: flex; flex-direction: column; align-items: flex-start; gap: 0.2rem; white-space: nowrap; }
  .home-stat-num { font-family: "Syne", sans-serif; font-size: 1.4rem; font-weight: 800; letter-spacing: -0.04em; color: #fff; line-height: 1; }
  .home-stat-num .home-stat-accent { color: var(--home-green-light); }
  .home-stat-label { font-size: 0.55rem; letter-spacing: 0.14em; text-transform: uppercase; color: rgba(255,255,255,0.4); font-weight: 500; }

  /* ══ FEATURES ══ */
  .home-features { background: var(--home-light); padding: 6rem 2rem 5rem; position: relative; }
  .home-features::before { content: ''; position: absolute; top: 0; left: 2rem; right: 2rem; height: 1px; background: rgba(0,0,0,0.1); }
  .home-features-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 3rem; max-width: 1280px; margin-left: auto; margin-right: auto; }
  .home-features-title {
    font-size: clamp(0.6rem, 1vw, 0.72rem);
    font-weight: 700;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: rgba(0,0,0,0.35);
    display: flex;
    align-items: center;
    gap: 0.6rem;
  }
  .home-features-title::before { content: ''; display: inline-block; width: 20px; height: 1px; background: var(--home-green); opacity: 0.8; }
  .home-features-eyebrow {
    font-family: "Syne", sans-serif;
    font-size: clamp(1.2rem, 2.5vw, 1.8rem);
    font-weight: 800;
    letter-spacing: -0.02em;
    color: #111;
    line-height: 1;
    position: relative;
    display: inline-block;
  }
  .home-features-eyebrow::after {
    content: '';
    position: absolute;
    bottom: -5px; left: 0;
    width: 100%; height: 2px;
    background: linear-gradient(90deg, var(--home-green), var(--home-green-light), var(--home-green));
    background-size: 300%;
    animation: home-gradient-shift 2.4s linear infinite,
    home-line-grow 0.6s 0.5s cubic-bezier(0.22,1,0.36,1) both;
    transform-origin: left;
  }
  .home-cards {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1px;
    background: rgba(0,0,0,0.1);
    border: 1px solid rgba(0,0,0,0.1);
    border-radius: 4px;
    overflow: hidden;
    max-width: 1280px;
    margin: 0 auto;
  }
  .home-card {
    background: var(--home-light);
    padding: 2.5rem 2rem;
    display: flex;
    flex-direction: column;
    gap: 1.1rem;
    position: relative;
    overflow: hidden;
    transition: background 0.22s ease;
    opacity: 0;
    animation: home-card-in 0.55s cubic-bezier(0.22,1,0.36,1) forwards;
  }
  .home-card:hover { background: #fff; }
  .home-card::before {
    content: '';
    position: absolute;
    left: 0; top: 0; bottom: 0;
    width: 2px;
    background: linear-gradient(180deg, var(--home-green), var(--home-green-light));
    transform: scaleY(0);
    transform-origin: top;
    transition: transform 0.28s cubic-bezier(0.22,1,0.36,1);
  }
  .home-card:hover::before { transform: scaleY(1); }

  .home-card-icon {
    width: 2.5rem; height: 2.5rem;
    display: flex; align-items: center; justify-content: center;
    border: 1px solid rgba(0,0,0,0.1);
    border-radius: 3px;
    background: rgba(0,0,0,0.025);
    transition: border-color 0.18s ease, background 0.18s ease;
    color: rgba(0,0,0,0.55);
  }
  .home-card:hover .home-card-icon { border-color: rgba(22,163,74,0.3); background: rgba(22,163,74,0.06); color: var(--home-green); }

  .home-card-title { font-family: "Syne", sans-serif; font-size: 0.9rem; font-weight: 700; letter-spacing: -0.01em; color: #111; line-height: 1.2; }
  .home-card-body  { font-size: 0.78rem; font-weight: 400; color: rgba(0,0,0,0.5); line-height: 1.7; flex: 1; }
  .home-card-tag   { font-size: 0.6rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--home-green); display: flex; align-items: center; gap: 0.4rem; }
  .home-card-tag::before { content: ''; display: inline-block; width: 10px; height: 1px; background: var(--home-green); }

  /* ══ DETAILS ══ */
  .home-details { background: var(--home-light); padding: 5rem 2rem 4rem; position: relative; }
  .home-details-container { max-width: 1280px; margin: 0 auto; }
  .home-details-intro { margin-bottom: 3.5rem; max-width: 700px; }
  .home-details-intro-title { font-family: "Syne", sans-serif; font-size: clamp(1.6rem, 2.8vw, 2.1rem); font-weight: 800; color: #111; margin-bottom: 1.2rem; letter-spacing: -0.02em; }
  .home-details-intro-text  { font-size: 0.88rem; color: rgba(0,0,0,0.6); line-height: 1.85; }
  .home-details-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1px;
    background: rgba(0,0,0,0.1);
    border: 1px solid rgba(0,0,0,0.1);
    border-radius: 4px;
    overflow: hidden;
    margin-top: 2rem;
  }
  .home-detail-item {
    background: var(--home-light);
    padding: 2.2rem 1.8rem;
    display: flex;
    flex-direction: column;
    gap: 0.9rem;
    position: relative;
    overflow: hidden;
    transition: background 0.22s ease;
    opacity: 0;
    animation: home-card-in 0.55s cubic-bezier(0.22,1,0.36,1) forwards;
  }
  .home-detail-item:hover { background: #fff; }
  .home-detail-item::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 2px; background: linear-gradient(180deg, var(--home-green), var(--home-green-light)); transform: scaleY(0); transform-origin: top; transition: transform 0.28s cubic-bezier(0.22,1,0.36,1); }
  .home-detail-item:hover::before { transform: scaleY(1); }
  .home-detail-item:nth-child(1) { animation-delay: 0.2s; }
  .home-detail-item:nth-child(2) { animation-delay: 0.3s; }
  .home-detail-item:nth-child(3) { animation-delay: 0.4s; }
  .home-detail-item:nth-child(4) { animation-delay: 0.5s; }

  .home-detail-icon {
    width: 2.2rem; height: 2.2rem;
    display: flex; align-items: center; justify-content: center;
    border: 1px solid rgba(0,0,0,0.09);
    border-radius: 3px;
    background: rgba(0,0,0,0.02);
    color: rgba(0,0,0,0.45);
    transition: border-color 0.18s ease, background 0.18s ease, color 0.18s ease;
  }
  .home-detail-item:hover .home-detail-icon { border-color: rgba(22,163,74,0.28); background: rgba(22,163,74,0.05); color: var(--home-green); }

  .home-detail-title { font-family: "Syne", sans-serif; font-size: 0.95rem; font-weight: 700; color: #111; letter-spacing: -0.01em; line-height: 1.2; }
  .home-detail-text  { font-size: 0.78rem; color: rgba(0,0,0,0.5); line-height: 1.65; }

  .home-details-cta { margin-top: 2.5rem; padding-top: 2.5rem; border-top: 1px solid rgba(0,0,0,0.1); text-align: center; }
  .home-details-cta-text { font-size: 0.88rem; color: rgba(0,0,0,0.6); margin-bottom: 1.2rem; }
  .home-details-cta-button {
    position: relative;
    display: inline-flex;
    align-items: center;
    font-family: "Geist Mono", monospace;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.13em;
    text-transform: uppercase;
    text-decoration: none;
    padding: 0.55rem 1.1rem;
    border: 1px solid var(--home-border);
    border-radius: 3px;
    background: var(--home-box-bg);
    color: rgba(0,0,0,0.7);
    cursor: pointer;
    transition: all 0.18s ease;
    overflow: hidden;
  }
  .home-details-cta-button:hover { border-color: var(--home-green); background: rgba(22,163,74,0.1); color: var(--home-green); }
  .home-details-cta-button .corner-tl,
  .home-details-cta-button .corner-br { position: absolute; width: 5px; height: 5px; opacity: 0; transition: opacity 0.18s ease; pointer-events: none; }
  .home-details-cta-button .corner-tl { top: -1px; left: -1px; border-top: 1px solid rgba(0,0,0,0.2); border-left: 1px solid rgba(0,0,0,0.2); }
  .home-details-cta-button .corner-br { bottom: -1px; right: -1px; border-bottom: 1px solid rgba(0,0,0,0.2); border-right: 1px solid rgba(0,0,0,0.2); }
  .home-details-cta-button:hover .corner-tl,
  .home-details-cta-button:hover .corner-br { opacity: 1; }
  .home-details-cta-button .link-text { display: block; overflow: hidden; height: 1em; }
  .home-details-cta-button .link-track { display: flex; flex-direction: column; transition: transform 0.4s cubic-bezier(0.76,0,0.24,1); }
  .home-details-cta-button:hover .link-track { transform: translateY(-50%); }
  .home-details-cta-button .link-track span { display: block; height: 1em; line-height: 1em; }
  .home-details-cta-button .link-track span:first-child { color: inherit; }
  .home-details-cta-button .link-track span:last-child  { color: var(--home-green); }

  /* ══ RESPONSIVE ══ */
  @media (max-width: 1100px) { .home-hero-col--right { width: 220px; } }
  @media (max-width: 900px) {
    .home-hero-header { flex-direction: column; padding: 1.25rem; padding-top: calc(var(--home-nav-h) + 1rem); }
    .home-hero-col { flex: unset; width: 100%; }
    .home-hero-col--right { display: none; }
    .home-hero-h1 { font-size: clamp(2.2rem, 8vw, 3.5rem); }
    .home-stats { right: 1rem; bottom: 1rem; gap: 1.2rem; }
    .home-cards { grid-template-columns: 1fr; }
    .home-features { padding: 4rem 1.25rem 3rem; }
    .home-features-header { flex-direction: column; align-items: flex-start; gap: 0.75rem; margin-bottom: 2rem; }
    .home-details { padding: 4rem 1.25rem; }
    .home-details-grid { grid-template-columns: 1fr; }
  }
  @media (max-width: 480px) {
    .home-cta-row { gap: 0.5rem; }
    .home-details-intro-title { font-size: clamp(1.3rem, 5vw, 1.6rem); }
    .home-detail-item { padding: 1.5rem 1.25rem; }
    .home-stats { display: none; }
  }
`;

/* ─── CTALink helper ──────────────────────────────────────────────────────── */
const CTALink = ({ to, label, variant = '' }) => (
  <Link to={to} className={`home-cta ${variant}`}>
    <div className="corner-tl" />
    <div className="link-text">
      <div className="link-track">
        <span>{label}</span>
        <span>{label}</span>
      </div>
    </div>
    <div className="corner-br" />
  </Link>
);

/* ─── Feature cards data ──────────────────────────────────────────────────── */
const FEATURES = [
  {
    icon: <BarChart2 size={20} strokeWidth={1.8} />,
    title: 'Track Daily Habits',
    body: 'Monitor transportation, energy usage, diet, and waste generation with our precision impact analyzer.',
    tag: 'Input & log',
    delay: '0.55s',
  },
  {
    icon: <TrendingUp size={20} strokeWidth={1.8} />,
    title: 'Visualize Trends',
    body: 'See your environmental impact shift over time with interactive charts and comprehensive analytics.',
    tag: 'Analyse & compare',
    delay: '0.65s',
  },
  {
    icon: <Lightbulb size={20} strokeWidth={1.8} />,
    title: 'Get Personalized Tips',
    body: 'Receive tailored, weather-aware recommendations to reduce your carbon footprint based on your lifestyle patterns.',
    tag: 'Act & improve',
    delay: '0.75s',
  },
];

/* ─── Details section data ──────────────────────────────────────────────────── */
const DETAILS = [
  {
    icon: <Globe size={18} strokeWidth={1.7} />,
    title: 'Global Impact',
    text: 'Join thousands of users reducing their carbon footprint across 50+ countries.',
    delay: '0.2s',
  },
  {
    icon: <BrainCircuit size={18} strokeWidth={1.7} />,
    title: 'AI-Powered Insights',
    text: 'Advanced algorithms analyze your habits and provide personalized recommendations for maximum impact.',
    delay: '0.3s',
  },
  {
    icon: <CloudSun size={18} strokeWidth={1.7} />,
    title: 'Weather-Aware Tips',
    text: 'Live AQI, UV, humidity and temperature data shapes your daily eco-tips in real time.',
    delay: '0.4s',
  },
  {
    icon: <Target size={18} strokeWidth={1.7} />,
    title: 'Set & Achieve Goals',
    text: 'Define personal sustainability goals and track your progress with visual milestones.',
    delay: '0.5s',
  },
];

/* ─── Component ───────────────────────────────────────────────────────────── */
const Home = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch((err) => {
        console.log('Video autoplay prevented:', err);
      });
    }
  }, []);

  return (
    <>
      <style>{styles}</style>

      <div className="home-root">

        {/* ══════════ HERO ══════════ */}
        <section className="home-hero">
          <video ref={videoRef} className="home-hero-video" autoPlay muted loop playsInline>
            <source src="/home.mp4" type="video/mp4" />
          </video>

          <div className="home-hero-grid" />

          <div className="home-hero-header">
            {/* ── Left col ── */}
            <div className="home-hero-col">
              <h1 className="home-hero-h1">
                Track your<br />
                <span className="accent">impact</span>
              </h1>

              <div className="home-descriptor">
                <p className="home-descriptor-sub">
                  Your habits,<br />our insights
                </p>
                <p className="home-descriptor-body">
                  GoGreenPy analyses your daily carbon footprint — transport,
                  energy, water, diet — and turns raw numbers into
                  actionable steps toward a lighter life.
                </p>

                <div className="home-cta-row">
                  {isAuthenticated ? (
                    <CTALink to="/dashboard" label="Go to Dashboard" variant="primary" />
                  ) : (
                    <>
                      <CTALink to="/signup" label="Get Started" variant="primary" />
                      <CTALink to="/login"  label="Login" />
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* ── Right col ── */}
            <div className="home-hero-col home-hero-col--right">
              <WeatherWidget apiKey={import.meta.env.VITE_OWM_API_KEY} />
            </div>
          </div>

          {/* ── Floating stats ── */}
          <div className="home-stats">
            <div className="home-stat">
              <span className="home-stat-num">4<span className="home-stat-accent">+</span></span>
              <span className="home-stat-label">Impact metrics</span>
            </div>
            <div className="home-stat">
              <span className="home-stat-num">AI<span className="home-stat-accent">-</span>powered</span>
              <span className="home-stat-label">Analysis engine</span>
            </div>
            <div className="home-stat">
              <span className="home-stat-num">Daily<span className="home-stat-accent">.</span></span>
              <span className="home-stat-label">Habit tracking</span>
            </div>
          </div>

          {/* ── Scroll hint ── */}
          <div className="home-scroll-hint">
            <div className="home-scroll-row">
              <span className="home-scroll-line" />
              <span className="home-scroll-label">Scroll to explore</span>
            </div>
            <span className="home-scroll-cta">↓</span>
          </div>
        </section>

        {/* ══════════ FEATURES ══════════ */}
        <section className="home-features">
          <div className="home-features-header">
            <span className="home-features-title">How it works</span>
            <span className="home-features-eyebrow">Three steps to clarity</span>
          </div>

          <div className="home-cards">
            {FEATURES.map((f) => (
              <div key={f.title} className="home-card" style={{ animationDelay: f.delay }}>
                <div className="home-card-icon">{f.icon}</div>
                <h3 className="home-card-title">{f.title}</h3>
                <p className="home-card-body">{f.body}</p>
                <span className="home-card-tag">{f.tag}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════ DETAILS ══════════ */}
        <section className="home-details">
          <div className="home-details-container">
            <div className="home-details-intro">
              <h2 className="home-details-intro-title">Why Choose GoGreenPy?</h2>
              <p className="home-details-intro-text">
                We're not just another carbon tracking app. GoGreenPy combines cutting-edge AI,
                intuitive design, and real-world impact to make sustainability accessible for everyone.
              </p>
            </div>

            <div className="home-details-grid">
              {DETAILS.map((detail) => (
                <div key={detail.title} className="home-detail-item" style={{ animationDelay: detail.delay }}>
                  <div className="home-detail-icon">{detail.icon}</div>
                  <h3 className="home-detail-title">{detail.title}</h3>
                  <p className="home-detail-text">{detail.text}</p>
                </div>
              ))}
            </div>

            <div className="home-details-cta">
              <p className="home-details-cta-text">
                Ready to make a difference? Start your sustainability journey today.
              </p>
              {!isAuthenticated && (
                <Link to="/signup" className="home-details-cta-button">
                  <div className="corner-tl" />
                  <div className="link-text">
                    <div className="link-track">
                      <span>Get Started</span>
                      <span>Get Started</span>
                    </div>
                  </div>
                  <div className="corner-br" />
                </Link>
              )}
            </div>
          </div>
        </section>

      </div>
    </>
  );
};

export default Home;