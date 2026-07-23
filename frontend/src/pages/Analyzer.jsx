import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import {
  Sparkles,
  Car,
  Zap,
  Utensils,
  Droplets,
  ShoppingBag,
  BrainCircuit,
  ArrowRight,
  ArrowUpRight,
  Loader2,
} from 'lucide-react';
import { calculateImpact } from '../services/api';

/* ─── Styles ──────────────────────────────────────────────────────────────── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;500;600;700&family=Fraunces:opsz,wght@9..144,300;9..144,500&display=swap');

  :root {
    --az-nav-h: 68px;
    --az-ink: #f5f5f7;
    --az-ink-dim: rgba(245,245,247,0.55);
    --az-ink-faint: rgba(245,245,247,0.32);
    --az-glass-bg: linear-gradient(160deg, rgba(255,255,255,0.055), rgba(255,255,255,0.015));
    --az-glass-border: rgba(255,255,255,0.08);
    --az-violet: #a78bfa;
    --az-blue: #60a5fa;
    --az-pink: #f472b6;
    --az-radius: 20px;
  }

  .az-page {
    position: relative;
    z-index: 1;
    max-width: 1040px;
    margin: 0 auto;
    padding: calc(var(--az-nav-h) + 3rem) 1.75rem 5rem;
    font-family: "Geist Mono", monospace;
    color: var(--az-ink);
    min-height: 100vh;
  }

  .az-bg {
    position: fixed;
    inset: 0;
    z-index: -1;
    background: #06060a;
    overflow: hidden;
  }
  .az-bg::before {
    content: '';
    position: absolute;
    top: -18%; right: -12%;
    width: 55vw; height: 55vw;
    max-width: 650px; max-height: 650px;
    background: radial-gradient(circle, rgba(244,114,182,0.12), transparent 65%);
    filter: blur(10px);
  }
  .az-bg::after {
    content: '';
    position: absolute;
    bottom: -22%; left: -10%;
    width: 55vw; height: 55vw;
    max-width: 620px; max-height: 620px;
    background: radial-gradient(circle, rgba(96,165,250,0.13), transparent 65%);
    filter: blur(10px);
  }
  .az-bg-vignette {
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse at 50% 0%, transparent 40%, rgba(0,0,0,0.55) 100%);
    pointer-events: none;
  }

  .gs-reveal { opacity: 0; }

  .az-hero { margin-bottom: 2.5rem; }
  .az-eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    font-size: 0.66rem;
    font-weight: 600;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--az-violet);
    padding: 0.35rem 0.75rem;
    border-radius: 999px;
    background: rgba(167,139,250,0.1);
    border: 1px solid rgba(167,139,250,0.22);
    margin-bottom: 1rem;
  }
  .az-title {
    font-family: "Fraunces", serif;
    font-size: clamp(2rem, 4.4vw, 3.1rem);
    font-weight: 500;
    letter-spacing: -0.02em;
    color: var(--az-ink);
    line-height: 1.05;
    margin: 0 0 0.6rem;
  }
  .az-subtitle {
    font-size: 0.88rem;
    color: var(--az-ink-dim);
    max-width: 540px;
    line-height: 1.6;
  }

  .az-panel {
    position: relative;
    border-radius: var(--az-radius);
    background: var(--az-glass-bg);
    border: 1px solid var(--az-glass-border);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
    padding: 2rem;
    margin-bottom: 1.1rem;
    overflow: hidden;
    box-shadow: 0 1px 0 rgba(255,255,255,0.04) inset, 0 20px 50px -30px rgba(0,0,0,0.6);
  }

  .az-section-label {
    font-size: 0.68rem;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--az-ink);
    display: flex;
    align-items: center;
    gap: 0.6rem;
    margin-bottom: 1.4rem;
  }
  .az-section-icon {
    width: 26px; height: 26px;
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    background: linear-gradient(135deg, rgba(167,139,250,0.18), rgba(96,165,250,0.18));
    color: var(--az-violet);
  }

  .az-subsection {
    margin-top: 1.75rem;
    padding-top: 1.5rem;
    border-top: 1px solid rgba(255,255,255,0.07);
  }

  .az-form-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.25rem;
    margin-bottom: 0.5rem;
  }
  @media (max-width: 900px) { .az-form-grid { grid-template-columns: repeat(2, 1fr); } }
  @media (max-width: 600px) { .az-form-grid { grid-template-columns: 1fr; } }

  .az-field { display: flex; flex-direction: column; gap: 0.5rem; }

  .az-label {
    font-size: 0.66rem;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--az-ink-dim);
  }
  .az-label-hint { font-size: 0.6rem; font-weight: 400; color: var(--az-ink-faint); }

  .az-input, .az-select {
    font-family: "Geist Mono", monospace;
    font-size: 0.85rem;
    font-weight: 500;
    color: var(--az-ink);
    width: 100%;
    padding: 0.65rem 0.85rem;
    border: 1px solid var(--az-glass-border);
    border-radius: 10px;
    background: rgba(255,255,255,0.03);
    outline: none;
    transition: border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
    box-sizing: border-box;
  }
  .az-input:focus, .az-select:focus {
    border-color: rgba(167,139,250,0.55);
    box-shadow: 0 0 0 3px rgba(167,139,250,0.14);
    background: rgba(255,255,255,0.05);
  }
  .az-select option { background: #111114; color: var(--az-ink); }

  .az-range { flex: 1; accent-color: var(--az-violet); height: 4px; }

  .az-error { color: var(--az-pink); font-size: 0.68rem; margin-top: 0.1rem; }

  .az-submit {
    position: relative;
    width: 100%;
    padding: 0.95rem 1.2rem;
    margin-top: 2rem;
    font-family: "Geist Mono", monospace;
    font-size: 0.76rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    border: none;
    border-radius: 999px;
    background: linear-gradient(135deg, #a78bfa, #60a5fa);
    color: #08080b;
    cursor: pointer;
    overflow: hidden;
    transition: transform 0.25s cubic-bezier(0.22,1,0.36,1), box-shadow 0.25s ease, opacity 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.6rem;
    box-shadow: 0 0 0 1px rgba(255,255,255,0.08) inset;
  }
  .az-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 14px 34px -12px rgba(167,139,250,0.55), 0 0 0 1px rgba(255,255,255,0.15) inset; }
  .az-submit:active:not(:disabled) { transform: translateY(0) scale(0.98); }
  .az-submit:disabled { opacity: 0.65; cursor: not-allowed; }
  .az-submit-shine {
    position: absolute;
    top: 0; left: -60%;
    width: 40%; height: 100%;
    background: linear-gradient(115deg, transparent, rgba(255,255,255,0.55), transparent);
    transform: skewX(-18deg);
    transition: left 0.7s cubic-bezier(0.22,1,0.36,1);
    pointer-events: none;
  }
  .az-submit:hover:not(:disabled) .az-submit-shine { left: 130%; }
  .az-submit .az-submit-icon { transition: transform 0.3s cubic-bezier(0.22,1,0.36,1); display: flex; }
  .az-submit:hover:not(:disabled) .az-submit-icon { transform: translateX(3px); }
  .az-spin { animation: az-spin 0.8s linear infinite; }
  @keyframes az-spin { to { transform: rotate(360deg); } }

  .az-error-box {
    border: 1px solid rgba(244,114,182,0.25);
    border-radius: 14px;
    background: rgba(244,114,182,0.06);
    padding: 1.1rem 1.3rem;
    font-size: 0.75rem;
    color: #fbcfe8;
    margin-bottom: 1.5rem;
  }
  .az-error-box h4 { margin: 0 0 0.5rem 0; font-weight: 700; color: var(--az-pink); font-size: 0.72rem; letter-spacing: 0.05em; text-transform: uppercase; }

  .az-result-score {
    font-family: "Fraunces", serif;
    font-size: clamp(2.8rem, 6vw, 4.2rem);
    font-weight: 500;
    line-height: 1;
    letter-spacing: -0.03em;
    background: linear-gradient(135deg, #fff, var(--az-violet) 130%);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }
  .az-result-rating { font-size: 0.85rem; color: var(--az-ink-dim); margin-top: 0.6rem; }

  .az-ai-box {
    position: relative;
    background: linear-gradient(160deg, rgba(167,139,250,0.1), rgba(96,165,250,0.04));
    border: 1px solid rgba(167,139,250,0.22);
    border-radius: 16px;
    padding: 1.4rem 1.5rem;
    margin: 1.75rem 0;
  }
  .az-ai-label {
    display: flex; align-items: center; gap: 0.5rem;
    font-size: 0.68rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
    color: var(--az-violet); margin-bottom: 0.7rem;
  }
  .az-ai-text { font-size: 0.86rem; line-height: 1.75; color: var(--az-ink-dim); margin: 0; }

  .az-tip-row {
    display: flex; align-items: flex-start; gap: 0.65rem;
    font-size: 0.84rem; color: var(--az-ink-dim);
    padding: 0.75rem 0; border-top: 1px solid rgba(255,255,255,0.06);
  }
  .az-tip-row:first-child { border-top: none; }

  .az-dash-link {
    margin-top: 1.75rem;
    display: inline-flex; align-items: center; gap: 0.5rem;
    padding: 0.75rem 1.3rem;
    border-radius: 999px;
    border: 1px solid var(--az-glass-border);
    background: rgba(255,255,255,0.03);
    color: var(--az-ink);
    font-size: 0.74rem; font-weight: 600; letter-spacing: 0.06em;
    cursor: pointer;
    transition: transform 0.25s cubic-bezier(0.22,1,0.36,1), border-color 0.2s ease;
  }
  .az-dash-link:hover { transform: translateY(-2px); border-color: rgba(167,139,250,0.35); }
`;

/**
 * Analyzer - Impact Calculator
 *
 * CRITICAL: Field names MUST match backend ImpactInput schema:
 * - transport_method (NOT transport_type)
 * - transport_km (NOT distance_km)
 * - NO frequency_days_per_week, car_type, public_transport_km
 * - Must include: screen_hours (default 4)
 */
const Analyzer = () => {
  const navigate = useNavigate();
  const pageRef = useRef(null);

  // ✅ Schema matches backend ImpactInput exactly
  const [formData, setFormData] = useState({
    transport_method: 'car',
    transport_km: 0,
    electricity_kwh: 0,
    water_liters: 100,
    diet_type: 'mixed',
    waste_kg: 0.5,
    renewable_pct: 0,
    flights_per_year: 0,
    heating_fuel: 'none',
    heating_hours: 0,
    meat_meals_per_week: 7,
    plant_based_swaps: 0,
    new_clothing_items: 0,
    online_orders: 0,
    screen_hours: 4,
    recycling_pct: 50,
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (!pageRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        pageRef.current.querySelectorAll('.gs-reveal'),
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.09, clearProps: 'transform' }
      );
    }, pageRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!result || !pageRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        pageRef.current.querySelectorAll('.gs-result'),
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', stagger: 0.08, clearProps: 'transform' }
      );
    }, pageRef);
    return () => ctx.revert();
  }, [result]);

  /**
   * Validate form data before submission
   */
  const validateForm = () => {
    const errors = {};

    if (formData.transport_km < 0) errors.transport_km = 'Must be >= 0';
    if (formData.electricity_kwh < 0) errors.electricity_kwh = 'Must be >= 0';
    if (formData.water_liters < 0) errors.water_liters = 'Must be >= 0';
    if (formData.waste_kg < 0) errors.waste_kg = 'Must be >= 0';
    if (formData.renewable_pct < 0 || formData.renewable_pct > 100) {
      errors.renewable_pct = 'Must be 0-100';
    }
    if (formData.flights_per_year < 0) errors.flights_per_year = 'Must be >= 0';
    if (formData.heating_hours < 0 || formData.heating_hours > 24) {
      errors.heating_hours = 'Must be 0-24';
    }
    if (formData.meat_meals_per_week < 0 || formData.meat_meals_per_week > 21) {
      errors.meat_meals_per_week = 'Must be 0-21';
    }
    if (formData.plant_based_swaps < 0 || formData.plant_based_swaps > 3) {
      errors.plant_based_swaps = 'Must be 0-3';
    }
    if (formData.new_clothing_items < 0) errors.new_clothing_items = 'Must be >= 0';
    if (formData.online_orders < 0) errors.online_orders = 'Must be >= 0';
    if (formData.screen_hours < 0 || formData.screen_hours > 24) {
      errors.screen_hours = 'Must be 0-24';
    }
    if (formData.recycling_pct < 0 || formData.recycling_pct > 100) {
      errors.recycling_pct = 'Must be 0-100';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }

    const numericFields = [
      'transport_km', 'electricity_kwh', 'water_liters', 'waste_kg',
      'renewable_pct', 'flights_per_year', 'heating_hours',
      'meat_meals_per_week', 'plant_based_swaps', 'new_clothing_items',
      'online_orders', 'screen_hours', 'recycling_pct'
    ];

    const numValue = numericFields.includes(name) ? parseFloat(value) || 0 : value;

    setFormData(prev => ({
      ...prev,
      [name]: numValue
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!validateForm()) {
      setError('Please fix validation errors below');
      setLoading(false);
      return;
    }

    try {
      // ✅ CRITICAL: Ensure all values match backend schema
      const cleanData = {
        transport_method: formData.transport_method || 'car',
        transport_km: Number(formData.transport_km) || 0,
        electricity_kwh: Number(formData.electricity_kwh) || 0,
        water_liters: Number(formData.water_liters) || 100,
        diet_type: formData.diet_type || 'mixed',
        waste_kg: Number(formData.waste_kg) || 0.5,
        renewable_pct: Number(formData.renewable_pct) || 0,
        flights_per_year: Number(formData.flights_per_year) || 0,
        heating_fuel: formData.heating_fuel || 'none',
        heating_hours: Number(formData.heating_hours) || 0,
        meat_meals_per_week: Number(formData.meat_meals_per_week) || 7,
        plant_based_swaps: Number(formData.plant_based_swaps) || 0,
        new_clothing_items: Number(formData.new_clothing_items) || 0,
        online_orders: Number(formData.online_orders) || 0,
        screen_hours: Number(formData.screen_hours) || 4,
        recycling_pct: Number(formData.recycling_pct) || 50,
      };

      console.log('✅ Sending correct schema:', cleanData);

      const response = await calculateImpact(cleanData);
      setResult(response.data);
    } catch (err) {
      console.error('❌ Error:', err);

      if (err.response?.status === 422) {
        const errorData = err.response?.data;
        let errorMsg = '⚠️ Validation Error\n\nBackend rejected these fields:\n\n';

        if (errorData?.detail) {
          if (Array.isArray(errorData.detail)) {
            errorData.detail.forEach(e => {
              errorMsg += `• ${e.loc?.[1] || 'Field'}: ${e.msg}\n`;
            });
          } else {
            errorMsg += errorData.detail;
          }
        }

        setError(errorMsg);
      } else {
        setError(err.response?.data?.detail || err.message || 'Failed to calculate impact');
      }
    } finally {
      setLoading(false);
    }
  };

  const Field = ({ label, hint, name, type = 'number', min = 0, max, step = 'any', children, error }) => (
    <div className="az-field">
      <label className="az-label">
        {label}
        {hint && <span className="az-label-hint"> ({hint})</span>}
      </label>
      {children || (
        <input
          type={type}
          name={name}
          min={min}
          max={max}
          step={step}
          value={formData[name] ?? 0}
          onChange={handleChange}
          className="az-input"
        />
      )}
      {error && <span className="az-error">{error}</span>}
    </div>
  );

  return (
    <>
      <style>{styles}</style>
      <div className="az-bg">
        <div className="az-bg-vignette" />
      </div>

      <div className="az-page" ref={pageRef}>

        <div className="az-hero gs-reveal">
          <span className="az-eyebrow"><Sparkles size={12} /> AI Impact Workspace</span>
          <h1 className="az-title">Impact Analyzer</h1>
          <p className="az-subtitle">
            Log a day of your habits across transport, energy, diet and waste — the model turns it
            into a carbon score and a short list of things worth changing.
          </p>
        </div>

        {error && (
          <div className="az-error-box gs-reveal">
            <h4>Error</h4>
            <p style={{ whiteSpace: 'pre-wrap', margin: 0, fontSize: '0.75rem' }}>{error}</p>
          </div>
        )}

        <div className="az-panel gs-reveal">
          <form onSubmit={handleSubmit}>
            {/* Transport */}
            <p className="az-section-label"><span className="az-section-icon"><Car size={14} /></span>Transport</p>
            <div className="az-form-grid">
              <Field label="Method" name="transport_method">
                <select name="transport_method" value={formData.transport_method} onChange={handleChange} className="az-select">
                  <option value="car">Car</option>
                  <option value="ev">Electric Vehicle</option>
                  <option value="bus">Bus</option>
                  <option value="metro">Metro / Train</option>
                  <option value="bike">Bike</option>
                  <option value="walk">Walk</option>
                  <option value="motorcycle">Motorcycle</option>
                </select>
              </Field>
              <Field label="Distance" hint="km" name="transport_km" error={fieldErrors.transport_km} />
              <Field label="Flights/Year" hint="per year" name="flights_per_year" error={fieldErrors.flights_per_year} />
            </div>

            {/* Energy */}
            <div className="az-subsection">
              <p className="az-section-label"><span className="az-section-icon"><Zap size={14} /></span>Energy & Heating</p>
              <div className="az-form-grid">
                <Field label="Electricity" hint="kWh/day" name="electricity_kwh" error={fieldErrors.electricity_kwh} />
                <Field label="Heating Fuel" name="heating_fuel">
                  <select name="heating_fuel" value={formData.heating_fuel} onChange={handleChange} className="az-select">
                    <option value="none">None</option>
                    <option value="natural_gas">Natural Gas</option>
                    <option value="lpg">LPG</option>
                    <option value="wood">Wood</option>
                  </select>
                </Field>
                <Field label="Heating Hours" hint="hrs/day" name="heating_hours" max={24} error={fieldErrors.heating_hours} />
              </div>
              <div className="az-field" style={{ marginTop: '1.1rem' }}>
                <label className="az-label">Renewable Energy %</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <input
                    type="range"
                    name="renewable_pct"
                    min="0"
                    max="100"
                    step="5"
                    value={formData.renewable_pct}
                    onChange={handleChange}
                    className="az-range"
                  />
                  <span style={{ minWidth: '45px', textAlign: 'right', fontSize: '0.82rem' }}>{formData.renewable_pct}%</span>
                </div>
                {fieldErrors.renewable_pct && <span className="az-error">{fieldErrors.renewable_pct}</span>}
              </div>
            </div>

            {/* Diet */}
            <div className="az-subsection">
              <p className="az-section-label"><span className="az-section-icon"><Utensils size={14} /></span>Diet & Food</p>
              <div className="az-form-grid">
                <Field label="Diet Type" name="diet_type">
                  <select name="diet_type" value={formData.diet_type} onChange={handleChange} className="az-select">
                    <option value="vegan">Vegan</option>
                    <option value="veg">Vegetarian</option>
                    <option value="mixed">Mixed</option>
                    <option value="heavy_meat">Heavy Meat</option>
                  </select>
                </Field>
                <Field label="Meat Meals/Week" hint="meals" name="meat_meals_per_week" max={21} error={fieldErrors.meat_meals_per_week} />
                <Field label="Plant Swaps" hint="meals/day" name="plant_based_swaps" max={3} error={fieldErrors.plant_based_swaps} />
              </div>
            </div>

            {/* Water & Waste */}
            <div className="az-subsection">
              <p className="az-section-label"><span className="az-section-icon"><Droplets size={14} /></span>Water & Waste</p>
              <div className="az-form-grid">
                <Field label="Water" hint="litres/day" name="water_liters" error={fieldErrors.water_liters} />
                <Field label="Waste" hint="kg/day" name="waste_kg" step="0.1" error={fieldErrors.waste_kg} />
                <Field label="Recycling %" hint="%" name="recycling_pct" max={100} error={fieldErrors.recycling_pct} />
              </div>
            </div>

            {/* Consumption & Screen Time */}
            <div className="az-subsection">
              <p className="az-section-label"><span className="az-section-icon"><ShoppingBag size={14} /></span>Consumption & Digital</p>
              <div className="az-form-grid">
                <Field label="New Clothing" hint="items/week" name="new_clothing_items" error={fieldErrors.new_clothing_items} />
                <Field label="Online Orders" hint="per week" name="online_orders" error={fieldErrors.online_orders} />
                <Field label="Screen Time" hint="hrs/day" name="screen_hours" max={24} error={fieldErrors.screen_hours} />
              </div>
            </div>

            <button type="submit" disabled={loading} className="az-submit">
              <span className="az-submit-shine" />
              {loading ? (
                <>
                  <Loader2 size={15} className="az-spin" />
                  <span>Calculating…</span>
                </>
              ) : (
                <>
                  <span>Calculate My Impact</span>
                  <span className="az-submit-icon"><ArrowRight size={15} /></span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results */}
        {result && (
          <div className="az-panel gs-result">
            <p className="az-section-label"><span className="az-section-icon"><Sparkles size={14} /></span>Your Impact</p>
            <div style={{ marginBottom: '0.5rem' }}>
              <p className="az-result-score">{result.carbon_score || 0} <span style={{ fontSize: '1.1rem', WebkitTextFillColor: 'var(--az-ink-dim)' }}>kg CO₂</span></p>
              <p className="az-result-rating">{result.overall_rating}</p>
            </div>

            {result.ai_analysis && (
              <div className="az-ai-box">
                <p className="az-ai-label"><BrainCircuit size={14} /> AI Analysis</p>
                <p className="az-ai-text">{result.ai_analysis}</p>
              </div>
            )}

            {result.tips && (
              <div>
                <p className="az-section-label" style={{ marginBottom: '0.25rem' }}>Tips</p>
                {result.tips.map((tip, i) => (
                  <div key={i} className="az-tip-row">
                    <ArrowRight size={13} style={{ color: 'var(--az-violet)', marginTop: '0.15rem', flexShrink: 0 }} />
                    <span>{typeof tip === 'string' ? tip : tip.text || tip}</span>
                  </div>
                ))}
              </div>
            )}

            <button onClick={() => navigate('/dashboard')} className="az-dash-link">
              View Dashboard <ArrowUpRight size={14} />
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default Analyzer;
