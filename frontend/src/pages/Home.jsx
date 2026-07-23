import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import {
  BarChart2,
  TrendingUp,
  Lightbulb,
  Globe,
  BrainCircuit,
  CloudSun,
  Target,
  CheckCircle,
  MessageCircle,
} from 'lucide-react';
import WeatherWidget from '../components/WeatherWidget';
import Globe3D from '../components/Globe3D';

gsap.registerPlugin(ScrollTrigger);

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
  @keyframes home-scroll-bounce {
    0%, 100% { transform: translateY(0); }
    50%       { transform: translateY(5px); }
  }
  @keyframes home-card-in {
    from { opacity: 0; transform: translateY(32px) scale(0.98); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes home-float-in {
    from { opacity: 0; transform: translateY(20px) scale(0.95); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes wa-pulse {
    0%   { opacity: 1; transform: scale(1); }
    100% { opacity: 0; transform: scale(1.22); }
  }
  @keyframes dot-blink {
    0%, 100% { opacity: 1;   transform: scale(1);    box-shadow: 0 0 6px rgba(74, 222, 128, 0.8); }
    50%       { opacity: 0.3; transform: scale(0.65); box-shadow: 0 0 2px rgba(74, 222, 128, 0.3); }
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
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    z-index: 0;
  }

  .home-hero::before {
    content: '';
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.55);
    z-index: 1;
    pointer-events: none;
  }

  .home-hero::after {
    content: '';
    position: absolute;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E");
    opacity: 0.02;
    pointer-events: none;
    z-index: 2;
  }

  .home-hero-grid {
    position: absolute;
    inset: 0;
    z-index: 2;
    pointer-events: none;
    background-image:
      linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px);
    background-size: 100px 100px;
    animation: home-fade-in 1.2s 0.3s ease both;
  }

  .home-hero-container {
    position: absolute;
    margin-top: 0;
    inset: 0;
    z-index: 3;
    display: flex;
    align-items: stretch;
    padding: 2rem;
    padding-top: calc(var(--home-nav-h) + 1rem);
    padding-bottom: 2rem;
    gap: 2rem;
  }

  /* Left side: Text content (35%) */
  .home-hero-left {
    flex: 0 0 35%;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    padding-top: 3rem;
    gap: 1.5rem;
    max-width: 450px;
    z-index: 5;
  }

  .home-hero-h1 {
    font-family: "Syne", sans-serif;
    font-size: clamp(2.2rem, 4.5vw, 4.2rem);
    font-weight: 800;
    line-height: 1.05;
    letter-spacing: -0.03em;
    color: #fff;
    text-shadow: 0 2px 40px rgba(0,0,0,0.5);
    opacity: 0;
    animation: home-fade-up 0.7s cubic-bezier(0.22,1,0.36,1) 0.1s forwards;
  }

  .home-descriptor {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    opacity: 0;
    animation: home-fade-up 0.6s cubic-bezier(0.22,1,0.36,1) 0.25s forwards;
  }

  .home-descriptor-sub {
    font-family: "Syne", sans-serif;
    font-size: 1.05rem;
    font-weight: 700;
    color: #fff;
    line-height: 1.3;
    letter-spacing: -0.01em;
  }

  .home-descriptor-body {
    font-size: 0.8rem;
    font-weight: 400;
    color: rgba(255,255,255,0.68);
    line-height: 1.75;
    max-width: 320px;
  }

  .home-cta-row {
    display: flex;
    gap: 0.6rem;
    flex-wrap: wrap;
    margin-top: 0rem;
    opacity: 0;
    animation: home-fade-up 0.55s cubic-bezier(0.22,1,0.36,1) 0.38s forwards;
    position: relative;
    z-index: 15;
  }

  .home-cta {
    position: relative;
    display: inline-flex;
    align-items: center;
    font-family: "Geist Mono", monospace;
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.12em;
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

  .home-cta:hover {
    border-color: rgba(255,255,255,0.35);
    background: rgba(255,255,255,0.1);
    color: #fff;
  }

  .home-cta.primary {
    border-color: rgba(34,197,94,0.45);
    background: rgba(22,163,74,0.15);
    color: #86efac;
  }

  .home-cta.primary:hover {
    border-color: rgba(34,197,94,0.8);
    background: rgba(22,163,74,0.28);
    color: #bbf7d0;
  }

  /* Right side: Globe area (75%) */
  .home-hero-right {
    flex: 0 0 75%;
    position: relative;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 4;
  }

  /* 3D Globe container */
  .home-globe-container {
    position: relative;
    width: 85%;
    max-width: 700px;
    aspect-ratio: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    animation: home-float-in 0.8s cubic-bezier(0.22,1,0.36,1) 0.6s forwards;
    z-index: 4;
  }

  /* Weather widget */
  .home-weather-card {
    position: fixed;
    bottom: 2rem;
    left: 2rem;
    opacity: 0;
    animation: home-float-in 0.6s cubic-bezier(0.22,1,0.36,1) 0.5s forwards;
    z-index: 20;
  }

  .home-weather-glass {
    background: rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(20px) saturate(120%);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 20px;
    padding: 1.25rem;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.25);
  }

  .home-scroll-hint {
    position: fixed;
    right: 2rem;
    bottom: 2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.6rem;
    opacity: 0;
    animation: home-fade-up 0.5s cubic-bezier(0.22,1,0.36,1) 0.7s forwards;
    z-index: 6;
  }

  .home-scroll-label {
    font-size: 0.7rem;
    font-weight: 600;
    color: rgba(255,255,255,0.5);
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .home-scroll-cta {
    font-size: 1.2rem;
    color: rgba(255,255,255,0.6);
    animation: home-scroll-bounce 2s ease-in-out infinite;
  }

/* ══ DETAILS ══ */
  .home-details {
    position: relative;
    width: 100%;
    background: var(--home-dark);
    color: #fff;
    padding: 8rem 2rem;
    overflow: hidden;
  }

  .home-details::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 20% 50%, rgba(22,163,74,0.04) 0%, transparent 50%);
    pointer-events: none;
    z-index: 0;
  }

  .home-details-container {
    max-width: 1200px;
    margin: 0 auto;
    position: relative;
    z-index: 1;
  }

  .home-details-intro {
    text-align: center;
    margin-bottom: 6rem;
  }

  .home-details-intro-title {
    font-family: "Syne", sans-serif;
    font-size: clamp(2rem, 3.5vw, 3.2rem);
    font-weight: 800;
    margin-bottom: 1.5rem;
    letter-spacing: -0.02em;
    background: linear-gradient(135deg, #fff 0%, #86efac 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .home-details-intro-text {
    font-size: 1rem;
    color: rgba(255,255,255,0.7);
    max-width: 700px;
    margin: 0 auto;
    line-height: 1.8;
  }

  .home-details-grid {
    display: flex;
    gap: 2.5rem;
    margin-bottom: 4rem;
    overflow-x: auto;
    padding-bottom: 1rem;
    scroll-behavior: smooth;
  }
  
  .home-details-grid::-webkit-scrollbar {
    height: 6px;
  }
  
  .home-details-grid::-webkit-scrollbar-track {
    background: rgba(255,255,255,0.05);
    border-radius: 10px;
  }
  
  .home-details-grid::-webkit-scrollbar-thumb {
    background: rgba(34,197,94,0.3);
    border-radius: 10px;
  }
  
  .home-details-grid::-webkit-scrollbar-thumb:hover {
    background: rgba(34,197,94,0.5);
  }

  .home-detail-item {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 2rem;
    border: 1px solid rgba(34,197,94,0.15);
    border-radius: 12px;
    background: linear-gradient(135deg, rgba(22,163,74,0.03) 0%, transparent 100%);
    backdrop-filter: blur(8px);
    transition: all 0.4s cubic-bezier(0.22,1,0.36,1);
    position: relative;
    overflow: hidden;
    opacity: 0;
    width: 340px;
    height: 340px;
    flex-shrink: 0;
    aspect-ratio: 1 / 1;
  }

  .home-detail-item::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(34,197,94,0.05) 0%, transparent 100%);
    opacity: 0;
    transition: opacity 0.4s ease;
    pointer-events: none;
  }

  .home-detail-item:hover {
    border-color: rgba(34,197,94,0.3);
    background: linear-gradient(135deg, rgba(22,163,74,0.06) 0%, rgba(22,163,74,0.02) 100%);
    transform: translateY(-4px);
    box-shadow: 0 8px 20px rgba(22,163,74,0.1);
  }

  .home-detail-item:hover::before {
    opacity: 1;
  }

  .home-detail-icon {
    width: 45px;
    height: 45px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, rgba(34,197,94,0.15) 0%, rgba(34,197,94,0.05) 100%);
    border-radius: 10px;
    color: #86efac;
    border: 1px solid rgba(34,197,94,0.2);
    transition: all 0.4s ease;
  }

  .home-detail-item:hover .home-detail-icon {
    transform: scale(1.12) rotate(8deg);
    background: linear-gradient(135deg, rgba(34,197,94,0.25) 0%, rgba(34,197,94,0.1) 100%);
  }

  .home-detail-title {
    font-family: "Syne", sans-serif;
    font-size: 1.1rem;
    font-weight: 700;
    letter-spacing: -0.01em;
    position: relative;
    z-index: 2;
  }

  .home-detail-title::after {
    content: '';
    position: absolute;
    bottom: -6px;
    left: 0;
    width: 0;
    height: 2px;
    background: var(--home-green);
    transition: width 0.4s ease;
  }

  .home-detail-item:hover .home-detail-title::after {
    width: 25px;
  }

  .home-detail-text {
    font-size: 0.85rem;
    color: rgba(255,255,255,0.65);
    line-height: 1.6;
    position: relative;
    z-index: 2;
  }

  .home-details-cta {
    text-align: center;
    padding-top: 2rem;
    border-top: 1px solid rgba(255,255,255,0.1);
  }

  .home-details-cta-text {
    font-size: 0.95rem;
    color: rgba(255,255,255,0.75);
    margin-bottom: 1.5rem;
    line-height: 1.6;
  }

  .home-details-cta-button {
    position: relative;
    display: inline-flex;
    align-items: center;
    font-family: "Geist Mono", monospace;
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    text-decoration: none;
    padding: 0.55rem 1.1rem;
    border: 1px solid rgba(34,197,94,0.45);
    border-radius: 3px;
    background: rgba(22,163,74,0.15);
    cursor: pointer;
    color: #86efac;
    transition: all 0.18s ease;
    overflow: hidden;
  }

  .home-details-cta-button:hover {
    border-color: rgba(34,197,94,0.8);
    background: rgba(22,163,74,0.28);
    color: #bbf7d0;
  }

  /* ══ STEPS (PINNED STORYTELLING) ══ */
  .home-steps {
    position: relative;
    width: 100%;
    background: var(--home-dark);
    color: #fff;
    padding: 0;
    min-height: 250vh;
  }

  .home-steps-container {
    position: relative;
    width: 100%;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 0;
    padding: 0 2rem;
    padding-left: 5rem;
  }

  .home-steps-progress-column {
    position: fixed;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    width: 60px;
    height: 600px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    z-index: 10;
  }

  .home-steps-progress-track {
    position: absolute;
    left: 50%;
    top: 0;
    width: 3px;
    height: 100%;
    background: rgba(255, 255, 255, 0.15);
    transform: translateX(-50%);
    border-radius: 2px;
  }

  .home-steps-progress-fill {
    position: absolute;
    left: 50%;
    top: 0;
    width: 3px;
    height: 0%;
    background: linear-gradient(180deg, var(--home-green) 0%, var(--home-green-light) 100%);
    transform: translateX(-50%);
    border-radius: 2px;
  }

  .home-steps-dots-container {
    position: absolute;
    left: 50%;
    top: 0;
    width: 100%;
    height: 100%;
    transform: translateX(-50%);
  }

  .home-steps-dot {
    position: absolute;
    left: 50%;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    background: rgba(255, 255, 255, 0.2);
    border: 2px solid rgba(255, 255, 255, 0.3);
    transition: all 0.4s ease;
  }

  .home-steps-dot.active {
    width: 24px;
    height: 24px;
    background: var(--home-green);
    border-color: var(--home-green-light);
    box-shadow: 0 0 20px rgba(34, 197, 94, 0.6);
  }

  .home-steps-cards-area {
    position: relative;
    flex: 1;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    max-width: 700px;
    width: 100%;
  }

  .home-steps-card-stack {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .home-steps-card {
    position: absolute;
    width: 100%;
    max-width: 600px;
    opacity: 0;
    filter: blur(0px);
    pointer-events: none;
    transition: all 0.6s cubic-bezier(0.22, 1, 0.36, 1);
    transform: scale(0.9) translateY(40px);
  }

  .home-steps-card.active {
    opacity: 1;
    filter: blur(0px);
    pointer-events: auto;
    transform: scale(1) translateY(0);
  }

  .home-steps-card-number {
    font-family: "Syne", sans-serif;
    font-size: 5rem;
    font-weight: 800;
    color: rgba(255, 255, 255, 0.08);
    line-height: 1;
    margin-bottom: 0.5rem;
    transition: color 0.4s ease;
  }

  .home-steps-card.active .home-steps-card-number {
    color: var(--home-green);
  }

  .home-steps-card-label {
    font-family: "Syne", sans-serif;
    font-size: 0.85rem;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.5);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin-bottom: 1rem;
    transition: color 0.4s ease;
  }

  .home-steps-card.active .home-steps-card-label {
    color: #fff;
  }

  .home-steps-card-title {
    font-family: "Syne", sans-serif;
    font-size: clamp(1.8rem, 3vw, 2.5rem);
    font-weight: 800;
    color: #fff;
    margin-bottom: 1.5rem;
    letter-spacing: -0.01em;
    line-height: 1.2;
  }

  .home-steps-card-text {
    font-size: 1rem;
    color: rgba(255, 255, 255, 0.75);
    line-height: 1.8;
    margin-bottom: 2.5rem;
  }

  .home-steps-card-features {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .home-steps-card-feature {
    display: flex;
    gap: 1rem;
    font-size: 0.95rem;
    color: rgba(255, 255, 255, 0.7);
    align-items: flex-start;
  }

  .home-steps-card-feature svg {
    color: var(--home-green);
    flex-shrink: 0;
    margin-top: 4px;
  }

  /* ══ FOOTER ══ */
  footer {
    position: relative;
    width: 100%;
    height: 100svh;
    background-color: var(--home-dark);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 4rem 2.5rem;
    color: #fff;
  }

  .footer-container {
    position: relative;
    width: 100%;
    max-width: 1400px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100%;
  }

  .footer-content {
    position: relative;
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    flex: 1;
    z-index: 1;
  }

  /* Top row */
  .footer-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 4rem;
  }

  .footer-row:first-child .footer-col:nth-child(1) {
    flex: 0 0 50%;
  }

  .footer-row:first-child .footer-col:nth-child(2) {
    flex: 0 0 40%;
    display: flex;
    gap: 2rem;
  }

  .footer-col h2 {
    font-family: "Syne", sans-serif;
    font-size: clamp(2rem, 4vw, 3.5rem);
    font-weight: 800;
    line-height: 1.2;
    color: #fff;
    letter-spacing: -0.02em;
    margin-bottom: 1.5rem;
  }

  .footer-col h3 {
    font-family: "Syne", sans-serif;
    font-size: clamp(0.9rem, 1.5vw, 1.1rem);
    font-weight: 700;
    color: #fff;
    margin-bottom: 0.8rem;
    letter-spacing: -0.01em;
  }

  .footer-col a {
    display: block;
    text-decoration: none;
    color: rgba(255,255,255,0.55);
    font-size: 0.95rem;
    line-height: 1.6;
    transition: color 0.2s ease;
    font-family: "Geist Mono", monospace;
    font-weight: 400;
  }

  .footer-col a:hover {
    color: #fff;
  }

  .footer-sub-col {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .footer-location-label {
    font-family: "Geist Mono", monospace;
    font-size: 0.7rem;
    color: rgba(255,255,255,0.4);
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin-top: 0.5rem;
  }

  /* Centre CTA */
  .footer-cta {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 2rem 0;
  }

  .footer-cta-button {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.9rem 2.25rem;
    border: 1px solid rgba(34,197,94,0.45);
    border-radius: 3px;
    background: rgba(22,163,74,0.15);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
    color: #86efac;
    font-family: "Geist Mono", monospace;
    font-size: 0.7rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    text-decoration: none;
    cursor: pointer;
    transition: all 0.3s ease;
    z-index: 2;
  }

  .footer-cta-button:hover {
    border-color: rgba(34,197,94,0.8);
    background: rgba(22,163,74,0.28);
    color: #bbf7d0;
    transform: translateY(-2px);
    box-shadow: 0 6px 24px rgba(22,163,74,0.3);
  }

  /* Divider */
  .footer-divider {
    width: 100%;
    height: 1px;
    background: rgba(255,255,255,0.1);
    margin: 2rem 0;
  }

  /* Bottom */
  .footer-row.footer-bottom {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 1rem;
  }

  .footer-row.footer-bottom p {
    font-family: "Geist Mono", monospace;
    font-size: 0.8rem;
    color: rgba(255,255,255,0.4);
    font-weight: 400;
  }

  /* Responsive */
  @media (max-width: 1280px) {
    .home-hero-container {
      gap: 2rem;
      padding: 2rem;
      padding-bottom: 2rem;
    }

    .home-globe-container {
      max-width: 800px;
    }

    .home-hero-left {
      flex: 0 0 38%;
      gap: 1.2rem;
    }

    .home-hero-right {
      flex: 0 0 62%;
    }

    .home-steps-content {
      gap: 4rem;
    }
  }

  @media (max-width: 1024px) {
    .home-hero-container {
      flex-direction: column;
      justify-content: flex-start;
      padding-top: calc(var(--home-nav-h) + 2rem);
      padding-bottom: 2rem;
      gap: 2rem;
      align-items: flex-start;
    }

    .home-hero-left {
      flex: 0 0 auto;
      width: 100%;
      max-width: 100%;
      gap: 1.5rem;
    }

    .home-hero-right {
      flex: 0 0 auto;
      width: 100%;
      max-width: 100%;
      align-items: center;
      justify-content: center;
      height: auto;
      min-height: 400px;
    }

    .home-globe-container {
      max-width: 100%;
      width: 100%;
      max-width: 500px;
    }

    .home-scroll-hint {
      display: none;
    }

    .home-weather-card {
      position: static;
      margin-top: 2rem;
      width: fit-content;
    }

    .home-steps {
      min-height: 300vh;
    }

    .home-steps-container {
      flex-direction: column;
      gap: 2rem;
      align-items: center;
      padding: 2rem;
      padding-left: 5rem;
    }

    .home-steps-progress-column {
      width: 100%;
      height: 400px;
      margin-bottom: 2rem;
      position: relative;
      left: auto;
      top: auto;
      transform: none;
    }

    .home-steps-cards-area {
      width: 100%;
      max-width: 100%;
    }

    .home-steps-card {
      max-width: 100%;
    }

    .home-steps-card-title {
      font-size: 1.5rem;
    }

    .footer-row {
      gap: 2rem;
    }

    .footer-row:first-child .footer-col:nth-child(2) {
      flex-direction: column;
      gap: 1.5rem;
    }
  }

  @media (max-width: 768px) {
    .home-hero {
      min-height: 800px;
    }

    .home-hero-container {
      padding: 1.5rem;
      padding-top: calc(var(--home-nav-h) + 1rem);
      gap: 1.5rem;
    }

    .home-hero-h1 {
      font-size: 2rem;
    }

    .home-hero-left {
      gap: 1rem;
    }

    .home-globe-container {
      max-width: 350px;
      width: 100%;
    }

    .home-cards {
      grid-template-columns: 1fr;
    }

    .home-details-grid {
      grid-template-columns: 1fr;
    }

    .home-weather-card {
      position: fixed;
      bottom: 2rem;
      left: 2rem;
      z-index: 20;
    }

    footer {
      height: auto;
      padding: 2rem 1.5rem;
    }

    .footer-row {
      flex-direction: column;
      gap: 2rem;
    }

    .footer-row:first-child .footer-col:nth-child(1) {
      flex: 1;
    }

    .footer-row:first-child .footer-col:nth-child(2) {
      flex: 1;
      gap: 1.5rem;
    }

    .footer-col h2 {
      font-size: 1.5rem;
    }

    .home-steps {
      min-height: 300vh;
    }

    .home-steps-container {
      gap: 1.5rem;
      padding: 1.5rem;
      padding-left: 4rem;
    }

    .home-steps-progress-column {
      height: 350px;
    }

    .home-steps-cards-area {
      max-width: 90vw;
    }

    .home-steps-card-number {
      font-size: 3rem;
    }

    .home-steps-card-title {
      font-size: 1.4rem;
    }

    .home-steps-card-text {
      font-size: 0.9rem;
    }
  }

  @media (max-width: 480px) {
    .home-hero-container {
      padding: 1rem;
      padding-top: calc(var(--home-nav-h) + 0.75rem);
    }

    .home-hero-h1 {
      font-size: 1.5rem;
    }

    .home-globe-container {
      max-width: 280px;
    }

    .home-descriptor-body {
      font-size: 0.75rem;
    }

    .home-cta {
      font-size: 0.65rem;
      padding: 0.45rem 0.9rem;
    }

    footer {
      padding: 1.5rem 1rem;
    }

    .footer-col h2 {
      font-size: 1.2rem;
    }

    .home-steps {
      min-height: 350vh;
    }

    .home-steps-container {
      gap: 1rem;
      padding: 1rem;
      padding-left: 3.5rem;
    }

    .home-steps-progress-column {
      width: 50px;
      height: 300px;
      left: 0.5rem;
    }

    .home-steps-card-number {
      font-size: 2.5rem;
    }

    .home-steps-card-title {
      font-size: 1.2rem;
    }

    .home-steps-card-text {
      font-size: 0.85rem;
      margin-bottom: 1.5rem;
    }

    .home-steps-card-features {
      gap: 0.8rem;
    }

    .home-steps-card-feature {
      font-size: 0.8rem;
    }
  }
`;

/* ─── Steps data ──────────────────────────────────────────────────────────── */
const STEPS = [
  {
    number: '01',
    label: 'Track',
    title: 'Log Your Daily Activities',
    text: 'Record your transportation, energy consumption, diet choices, and waste habits. Our intuitive interface makes data entry quick and effortless.',
    features: [
      'Transportation logging',
      'Energy consumption tracking',
      'Diet & waste records',
      'Automatic calculations'
    ]
  },
  {
    number: '02',
    label: 'Analyze',
    title: 'Get AI-Powered Insights',
    text: 'Our advanced algorithms analyze your patterns and provide personalized recommendations tailored to your lifestyle and location.',
    features: [
      'Pattern recognition',
      'Predictive analytics',
      'Personalized suggestions',
      'Weather-aware tips'
    ]
  },
  {
    number: '03',
    label: 'Act',
    title: 'Take Sustainable Action',
    text: 'Implement our recommendations and see your carbon footprint decrease. Every small action contributes to global environmental goals.',
    features: [
      'Actionable step-by-step guides',
      'Progress tracking',
      'Achievement badges',
      'Community impact metrics'
    ]
  },
  {
    number: '04',
    label: 'Impact',
    title: 'Visualize Your Difference',
    text: 'Watch your positive impact grow with interactive charts and global comparisons. Join thousands making a real difference today.',
    features: [
      'Interactive dashboards',
      'Global leaderboards',
      'Monthly reports',
      'Carbon savings summary'
    ]
  }
];

/* ─── Feature cards data ──────────────────────────────────────────────── */
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

/* ─── Details section data ──────────────────────────────────────────────– */
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

/* ─── Details Animated Component ─────────────────────────────────────────── */
const DetailsSection = ({ details }) => {
  const sectionRef = useRef(null);
  const itemsRef = useRef([]);
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!sectionRef.current) return;

    const items = itemsRef.current.filter(Boolean);
    if (!items.length) return;

    // Kill any existing animations
    items.forEach(item => {
      gsap.killTweensOf(item);
    });

    items.forEach((item, idx) => {
      // Set initial state
      gsap.set(item, {
        opacity: 0,
        y: 60,
        rotateX: -15,
        scale: 0.9,
      });

      // Scroll-triggered entrance animation
      gsap.to(item, {
        opacity: 1,
        y: 0,
        rotateX: 0,
        scale: 1,
        duration: 0.8,
        ease: 'back.out(1.2)',
        scrollTrigger: {
          trigger: item,
          start: 'top 85%',
          end: 'top 45%',
          scrub: 0.5,
          markers: false,
        },
      });

      // Parallax effect on scroll
      gsap.to(item, {
        y: -20,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top center',
          end: 'bottom center',
          scrub: 1.5,
          markers: false,
        },
      });
    });

    return () => {
      items.forEach(item => {
        gsap.killTweensOf(item);
      });
    };
  }, []);

  return (
    <section className="home-details" ref={sectionRef}>
      <div className="home-details-container">
        <div className="home-details-intro">
          <h2 className="home-details-intro-title">Why Choose GoGreenPy?</h2>
          <p className="home-details-intro-text">
            We're not just another carbon tracking app. GoGreenPy combines cutting-edge AI,
            intuitive design, and real-world impact to make sustainability accessible for everyone.
          </p>
        </div>

        <div className="home-details-grid">
          {details.map((detail, idx) => (
            <div 
              key={detail.title} 
              className="home-detail-item"
              ref={(el) => {
                if (el) itemsRef.current[idx] = el;
              }}
            >
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
              Get Started
            </Link>
          )}
        </div>
      </div>
    </section>
  );
};
const StorytellingSteps = () => {
  const sectionRef = useRef(null);
  const containerRef = useRef(null);
  const cardsRef = useRef([]);
  const dotsRef = useRef([]);
  const progressFillRef = useRef(null);
  const timelineRef = useRef(null);

  useEffect(() => {
    if (!sectionRef.current || !containerRef.current) return;

    const section = sectionRef.current;
    const container = containerRef.current;
    const cards = cardsRef.current.filter(Boolean);
    const dots = dotsRef.current.filter(Boolean);

    if (!cards.length || !dots.length) return;

    // Kill existing animations
    if (timelineRef.current) {
      timelineRef.current.kill();
    }
    ScrollTrigger.getAll().forEach((trigger) => {
      if (trigger.vars.trigger === section) {
        trigger.kill();
      }
    });

    const totalSteps = STEPS.length;
    const STEP_DURATION = 1;

    // ═══ INITIALIZATION - Start with Step 1 active ═══
    cards.forEach((card, idx) => {
      gsap.set(card, {
        opacity: idx === 0 ? 1 : 0,
        filter: 'blur(0px)',
        transform: idx === 0 ? 'scale(1) translateY(0)' : 'scale(0.9) translateY(40px)',
        pointerEvents: idx === 0 ? 'auto' : 'none',
      });
    });

    dots.forEach((dot, idx) => {
      gsap.set(dot, {
        background: idx === 0 ? 'var(--home-green)' : 'rgba(255, 255, 255, 0.2)',
        borderColor: idx === 0 ? 'var(--home-green-light)' : 'rgba(255, 255, 255, 0.3)',
        boxShadow: idx === 0 ? '0 0 20px rgba(34, 197, 94, 0.6)' : 'none',
      });
    });

    gsap.set(progressFillRef.current, { height: '0%' });

    // ═══ CREATE MASTER TIMELINE ═══
    timelineRef.current = gsap.timeline();
    const timelineDuration = totalSteps * STEP_DURATION;

    // ═══ BUILD ANIMATION SEQUENCE ═══
    for (let step = 0; step < totalSteps; step++) {
      const timelinePosition = step * STEP_DURATION;

      cards.forEach((card, cardIdx) => {
        const isActive = cardIdx === step;

        timelineRef.current.to(
          card,
          {
            opacity: isActive ? 1 : 0,
            filter: 'blur(0px)',
            transform: isActive ? 'scale(1) translateY(0)' : 'scale(0.9) translateY(40px)',
            pointerEvents: isActive ? 'auto' : 'none',
            duration: STEP_DURATION,
            ease: 'power2.inOut',
          },
          timelinePosition
        );

        const numberEl = card.querySelector('.home-steps-card-number');
        const labelEl = card.querySelector('.home-steps-card-label');

        if (numberEl) {
          timelineRef.current.to(
            numberEl,
            {
              color: isActive ? 'var(--home-green)' : 'rgba(255, 255, 255, 0.08)',
              duration: STEP_DURATION,
            },
            timelinePosition
          );
        }

        if (labelEl) {
          timelineRef.current.to(
            labelEl,
            {
              color: isActive ? '#fff' : 'rgba(255, 255, 255, 0.5)',
              duration: STEP_DURATION,
            },
            timelinePosition
          );
        }
      });

      dots.forEach((dot, dotIdx) => {
        const isActive = dotIdx === step;

        timelineRef.current.to(
          dot,
          {
            background: isActive ? 'var(--home-green)' : 'rgba(255, 255, 255, 0.2)',
            borderColor: isActive ? 'var(--home-green-light)' : 'rgba(255, 255, 255, 0.3)',
            boxShadow: isActive ? '0 0 20px rgba(34, 197, 94, 0.6)' : 'none',
            duration: STEP_DURATION,
          },
          timelinePosition
        );
      });

      timelineRef.current.to(
        progressFillRef.current,
        {
          height: ((step + 1) / totalSteps) * 100 + '%',
          duration: STEP_DURATION,
          ease: 'none',
        },
        timelinePosition
      );
    }

    // ═══ ATTACH SCROLL TRIGGER (Optimized for speed) ═══
    gsap.to(timelineRef.current, {
      duration: timelineDuration,
      progress: 1,
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: `+=${totalSteps * window.innerHeight * 1.2}`,
        scrub: 0.8,
        pin: container,
        pinSpacing: true,
        markers: false,
      },
      ease: 'none',
    });

    return () => {
      if (timelineRef.current) {
        timelineRef.current.kill();
      }
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.vars.trigger === section) {
          trigger.kill();
        }
      });
    };
  }, []);

  return (
    <section className="home-steps" ref={sectionRef}>
      <div className="home-steps-container" ref={containerRef}>
        <div className="home-steps-progress-column">
          <div className="home-steps-progress-track">
            <div className="home-steps-progress-fill" ref={progressFillRef} />
          </div>

          <div className="home-steps-dots-container">
            {STEPS.map((_, idx) => (
              <div
                key={idx}
                className="home-steps-dot"
                ref={(el) => {
                  if (el) dotsRef.current[idx] = el;
                }}
                style={{
                  top: `${(idx / (STEPS.length - 1)) * 100}%`,
                }}
              />
            ))}
          </div>
        </div>

        <div className="home-steps-cards-area">
          <div className="home-steps-card-stack">
            {STEPS.map((step, idx) => (
              <div
                key={idx}
                className={`home-steps-card ${idx === 0 ? 'active' : ''}`}
                ref={(el) => {
                  if (el) cardsRef.current[idx] = el;
                }}
              >
                <div className="home-steps-card-number">{step.number}</div>
                <div className="home-steps-card-label">{step.label}</div>
                <h3 className="home-steps-card-title">{step.title}</h3>
                <p className="home-steps-card-text">{step.text}</p>
                <div className="home-steps-card-features">
                  {step.features.map((feature) => (
                    <div key={feature} className="home-steps-card-feature">
                      <CheckCircle size={16} />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

/* ─── Main Component ───────────────────────────────────────────────────────── */
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

          <div className="home-hero-container">
            <div className="home-hero-left">
              <h1 className="home-hero-h1">
                Track your<br />
                <span style={{ color: '#86efac' }}>impact</span>
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
                    <Link to="/dashboard" className="home-cta primary">
                      Go to Dashboard
                    </Link>
                  ) : (
                    <>
                      <Link to="/signup" className="home-cta primary">
                        Get Started
                      </Link>
                      <Link to="/login" className="home-cta">
                        Login
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="home-hero-right">
              <div className="home-globe-container">
                <Globe3D 
                  modelPath="/models/earth.glb"
                  rotationSpeed={0.0015}
                  autoRotate={true}
                />
              </div>
            </div>
          </div>

          <div className="home-weather-card">
            <div className="home-weather-glass">
              <WeatherWidget apiKey={import.meta.env.VITE_OWM_API_KEY} />
            </div>
          </div>

          <div className="home-scroll-hint">
            <span className="home-scroll-label">Scroll to explore</span>
            <span className="home-scroll-cta">↓</span>
          </div>
        </section>



        {/* ══════════ DETAILS (PREMIUM ANIMATIONS) ══════════ */}
        <DetailsSection details={DETAILS} />

        {/* ══════════ STEPS (SCROLL-DRIVEN STORYTELLING) ══════════ */}
        <StorytellingSteps />

        {/* ══════════ FOOTER ══════════ */}
        <footer>
          <div className="footer-container">
            <div className="footer-content">
              <div className="footer-row">
                <div className="footer-col">
                  <h2>Start tracking<br />your carbon footprint</h2>
                  <p style={{ 
                    fontSize: '0.9rem', 
                    color: 'rgba(255,255,255,0.6)',
                    lineHeight: '1.6',
                    marginTop: '1rem',
                    maxWidth: '400px'
                  }}>
                    A minimal side project to help you understand and reduce your environmental impact. Built with passion for a sustainable future.
                  </p>
                </div>
                
                <div className="footer-col">
                  <div className="footer-sub-col">
                    <h3>Get in Touch</h3>
                    <a href="mailto:anas@gogreenpy.com">anas@gogreenpy.com</a>
                  </div>
                  <div className="footer-sub-col" style={{ marginTop: '-0.1rem' }}>
                    <h3>Resources</h3>
                    <a href="#github">GitHub</a>
                    <a href="#privacy">Privacy Policy</a>
                  </div>
                </div>
              </div>

              <div className="footer-cta">
                <Link 
                  to="/signup" 
                  className="footer-cta-button"
                >
                  Get Started
                </Link>
              </div>

              <div className="footer-divider" />

              <div className="footer-row footer-bottom">
                <p>© 2024 GoGreenPy</p>
                <p>Crafted by <span style={{ color: '#86efac'}}>Anas Ahmed</span></p>
              </div>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
};

export default Home;