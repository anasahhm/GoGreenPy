import React, { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';
import { History as HistoryIcon, RotateCcw, Inbox, ChevronLeft, ChevronRight } from 'lucide-react';
import { getHistory } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

/* ─── Styles ──────────────────────────────────────────────────────────────── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;500;600;700&family=Fraunces:opsz,wght@9..144,300;9..144,500&display=swap');

  :root {
    --hist-nav-h: 68px;
    --hist-ink: #f5f5f7;
    --hist-ink-dim: rgba(245,245,247,0.55);
    --hist-ink-faint: rgba(245,245,247,0.32);
    --hist-glass-bg: linear-gradient(160deg, rgba(255,255,255,0.055), rgba(255,255,255,0.015));
    --hist-glass-border: rgba(255,255,255,0.08);
    --hist-violet: #a78bfa;
    --hist-blue: #60a5fa;
    --hist-pink: #f472b6;
    --hist-radius: 20px;
  }

  .hist-page {
    position: relative;
    z-index: 1;
    max-width: 1240px;
    margin: 0 auto;
    padding: calc(var(--hist-nav-h) + 3rem) 1.75rem 5rem;
    font-family: "Geist Mono", monospace;
    color: var(--hist-ink);
    min-height: 100vh;
  }

  .hist-bg { position: fixed; inset: 0; z-index: -1; background: #06060a; overflow: hidden; }
  .hist-bg::before {
    content: ''; position: absolute; top: -18%; left: -10%;
    width: 55vw; height: 55vw; max-width: 640px; max-height: 640px;
    background: radial-gradient(circle, rgba(96,165,250,0.14), transparent 65%);
    filter: blur(10px);
  }
  .hist-bg::after {
    content: ''; position: absolute; bottom: -22%; right: -10%;
    width: 55vw; height: 55vw; max-width: 620px; max-height: 620px;
    background: radial-gradient(circle, rgba(167,139,250,0.13), transparent 65%);
    filter: blur(10px);
  }
  .hist-bg-vignette { position: absolute; inset: 0; background: radial-gradient(ellipse at 50% 0%, transparent 40%, rgba(0,0,0,0.55) 100%); pointer-events: none; }

  .gs-reveal { opacity: 0; }

  /* ── Header ── */
  .hist-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    flex-wrap: wrap;
    gap: 1.25rem;
    margin-bottom: 2.5rem;
  }
  .hist-eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    font-size: 0.66rem;
    font-weight: 600;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--hist-blue);
    padding: 0.35rem 0.75rem;
    border-radius: 999px;
    background: rgba(96,165,250,0.1);
    border: 1px solid rgba(96,165,250,0.22);
    margin-bottom: 1rem;
  }
  .hist-title {
    font-family: "Fraunces", serif;
    font-size: clamp(1.9rem, 4vw, 2.7rem);
    font-weight: 500;
    letter-spacing: -0.02em;
    color: var(--hist-ink);
    line-height: 1.05;
    margin: 0;
  }
  .hist-meta {
    font-size: 0.68rem;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--hist-ink-faint);
    border: 1px solid var(--hist-glass-border);
    border-radius: 999px;
    padding: 0.5rem 1rem;
    white-space: nowrap;
    background: var(--hist-glass-bg);
    backdrop-filter: blur(14px);
  }

  /* ── Panel ── */
  .hist-panel {
    position: relative;
    border-radius: var(--hist-radius);
    background: var(--hist-glass-bg);
    border: 1px solid var(--hist-glass-border);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
    padding: 2rem;
    margin-bottom: 1.1rem;
    overflow: hidden;
    box-shadow: 0 1px 0 rgba(255,255,255,0.04) inset, 0 20px 50px -30px rgba(0,0,0,0.6);
    transition: border-color 0.25s ease;
  }
  .hist-panel:hover { border-color: rgba(255,255,255,0.14); }

  .hist-section-label {
    font-size: 0.66rem;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--hist-ink-faint);
    display: flex;
    align-items: center;
    gap: 0.6rem;
    margin-bottom: 1.4rem;
  }
  .hist-section-label::after { content: ''; flex: 1; height: 1px; background: rgba(255,255,255,0.07); }

  /* ── Table ── */
  .hist-table-wrap { overflow-x: auto; }
  .hist-table {
    width: 100%;
    border-collapse: collapse;
    min-width: 620px;
  }
  .hist-table th {
    padding: 0 1rem 0.9rem;
    font-size: 0.62rem;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--hist-ink-faint);
    text-align: left;
    border-bottom: 1px solid rgba(255,255,255,0.08);
  }
  .hist-table td {
    padding: 1rem;
    border-bottom: 1px solid rgba(255,255,255,0.05);
    font-size: 0.82rem;
    color: var(--hist-ink);
  }
  .hist-table tbody tr {
    opacity: 0;
    animation: hist-row-in 0.4s cubic-bezier(0.22,1,0.36,1) forwards;
    transition: background 0.18s ease;
  }
  .hist-table tbody tr:hover { background: rgba(255,255,255,0.025); }
  .hist-table tbody tr:last-child td { border-bottom: none; }
  @keyframes hist-row-in {
    from { opacity: 0; transform: translateX(-8px); }
    to   { opacity: 1; transform: translateX(0); }
  }

  .hist-date { color: var(--hist-ink-dim); font-weight: 600; white-space: nowrap; }
  .hist-category {
    display: inline-block;
    font-size: 0.6rem;
    font-weight: 700;
    letter-spacing: 0.09em;
    text-transform: uppercase;
    padding: 0.32rem 0.7rem;
    border-radius: 999px;
    white-space: nowrap;
  }
  .hist-value { font-weight: 700; color: var(--hist-ink); }
  .hist-unit { font-size: 0.7rem; color: var(--hist-ink-faint); font-weight: 600; margin-left: 0.15rem; }
  .hist-note {
    font-size: 0.78rem;
    color: var(--hist-ink-dim);
    max-width: 260px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* ── Empty state ── */
  .hist-empty { text-align: center; padding: 4.5rem 1.5rem; }
  .hist-empty-icon {
    width: 72px; height: 72px;
    margin: 0 auto 1.5rem;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    background: radial-gradient(circle, rgba(96,165,250,0.16), transparent 70%);
    color: var(--hist-blue);
  }
  .hist-empty-title { font-family: "Fraunces", serif; font-size: 1.4rem; font-weight: 500; color: var(--hist-ink); margin: 0 0 0.5rem; }
  .hist-empty-text { font-size: 0.85rem; color: var(--hist-ink-dim); margin: 0; }

  /* ── Error ── */
  .hist-error {
    border: 1px solid rgba(244,114,182,0.28);
    border-radius: 16px;
    background: rgba(244,114,182,0.07);
    padding: 1.4rem;
    font-size: 0.78rem;
    color: #fbcfe8;
    letter-spacing: 0.02em;
  }
  .hist-retry {
    display: inline-flex; align-items: center; gap: 0.4rem;
    background: none; border: 1px solid rgba(244,114,182,0.35); border-radius: 999px;
    font-family: "Geist Mono", monospace; font-size: 0.68rem; font-weight: 700;
    letter-spacing: 0.06em; text-transform: uppercase;
    color: #f9a8d4; cursor: pointer; padding: 0.45rem 1rem; margin-top: 0.9rem;
    transition: background 0.15s ease;
  }
  .hist-retry:hover { background: rgba(244,114,182,0.1); }

  /* ── Loading ── */
  .hist-loading { display: flex; justify-content: center; align-items: center; min-height: 200px; }

  /* ── Pagination ── */
  .hist-pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.4rem;
    margin-top: 2rem;
    padding-top: 1.5rem;
    border-top: 1px solid rgba(255,255,255,0.07);
  }
  .hist-page-btn {
    display: flex; align-items: center; justify-content: center;
    min-width: 34px; height: 34px;
    padding: 0 0.6rem;
    border: 1px solid var(--hist-glass-border);
    border-radius: 999px;
    background: rgba(255,255,255,0.02);
    font-family: "Geist Mono", monospace;
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.03em;
    color: var(--hist-ink-dim);
    cursor: pointer;
    transition: border-color 0.18s ease, color 0.18s ease, background 0.18s ease, transform 0.18s ease;
  }
  .hist-page-btn:hover:not(:disabled) {
    border-color: rgba(167,139,250,0.4);
    color: var(--hist-ink);
    background: rgba(167,139,250,0.08);
    transform: translateY(-1px);
  }
  .hist-page-btn.active {
    border-color: transparent;
    background: linear-gradient(135deg, var(--hist-violet), var(--hist-blue));
    color: #08080b;
  }
  .hist-page-btn:disabled { opacity: 0.35; cursor: not-allowed; }

  @media (max-width: 768px) {
    .hist-page { padding: calc(var(--hist-nav-h) + 1.5rem) 1rem 3rem; }
    .hist-panel { padding: 1.5rem 1.25rem; }
    .hist-note { display: none; }
  }
`;

/* ─── Category → accent map (mirrors ScoreCard's palette) ────────────────── */
const CATEGORY_STYLE = {
  transport: { label: 'Transport', bg: 'rgba(96,165,250,0.14)',  color: '#93c5fd' },
  energy:    { label: 'Energy',    bg: 'rgba(251,191,36,0.14)',  color: '#fde68a' },
  diet:      { label: 'Diet',      bg: 'rgba(167,139,250,0.14)', color: '#c4b5fd' },
  water:     { label: 'Water',     bg: 'rgba(34,211,238,0.14)',  color: '#67e8f9' },
  waste:     { label: 'Waste',     bg: 'rgba(244,114,182,0.14)', color: '#f9a8d4' },
  shopping:  { label: 'Shopping',  bg: 'rgba(244,114,182,0.14)', color: '#f9a8d4' },
  other:     { label: 'Other',     bg: 'rgba(245,245,247,0.08)', color: 'rgba(245,245,247,0.6)' },
};

const History = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageRef = useRef(null);

  const loadHistory = async (p = 1) => {
    setLoading(true);
    setError('');
    try {
      const response = await getHistory(p, 20);
      setData(response.data?.data || []);
      setTotalPages(response.data?.pages || 1);
      setPage(p);
    } catch (err) {
      setError('Failed to load history');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory(1);
  }, []);

  /* GSAP entrance — presentation only, runs after data/loading settles */
  useEffect(() => {
    if (loading || !pageRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        pageRef.current.querySelectorAll('.gs-reveal'),
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.08, clearProps: 'transform' }
      );
    }, pageRef);
    return () => ctx.revert();
  }, [loading, data]);

  const formatDate = (dateStr) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const getCategoryTag = (category) => CATEGORY_STYLE[category] || CATEGORY_STYLE.other;

  return (
    <>
      <style>{styles}</style>
      <div className="hist-bg"><div className="hist-bg-vignette" /></div>

      <div className="hist-page" ref={pageRef}>

        {/* Header */}
        <div className="hist-header gs-reveal">
          <div>
            <span className="hist-eyebrow"><HistoryIcon size={12} /> Your Timeline</span>
            <h1 className="hist-title">Impact History</h1>
          </div>
          <div className="hist-meta">
            {loading ? '···' : `${data.length} ${data.length === 1 ? 'entry' : 'entries'}`}
          </div>
        </div>

        {/* Error */}
        {error && !loading && (
          <div className="hist-panel hist-error gs-reveal">
            {error}
            <br />
            <button className="hist-retry" onClick={() => loadHistory(page)}>
              <RotateCcw size={12} /> Retry
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="hist-panel hist-loading">
            <LoadingSpinner />
          </div>
        )}

        {/* Data */}
        {!loading && !error && data.length > 0 && (
          <div className="hist-panel gs-reveal">
            <p className="hist-section-label">Recent Entries</p>
            <div className="hist-table-wrap">
              <table className="hist-table">
                <thead>
                  <tr>
                    <th>Date &amp; Time</th>
                    <th>Category</th>
                    <th>Carbon</th>
                    <th>Water</th>
                    <th>Energy</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((entry, idx) => {
                    const cat = getCategoryTag(entry.category || 'other');
                    return (
                      <tr key={entry.id || idx} style={{ animationDelay: `${0.08 + idx * 0.04}s` }}>
                        <td className="hist-date">{formatDate(entry.created_at)}</td>
                        <td>
                          <span className="hist-category" style={{ background: cat.bg, color: cat.color }}>
                            {cat.label}
                          </span>
                        </td>
                        <td>
                          <span className="hist-value">{(entry.carbon_score || 0).toFixed(1)}</span>
                          <span className="hist-unit">kg</span>
                        </td>
                        <td>
                          <span className="hist-value">{(entry.water_score || 0).toFixed(0)}</span>
                          <span className="hist-unit">L</span>
                        </td>
                        <td>
                          <span className="hist-value">{(entry.energy_score || 0).toFixed(1)}</span>
                          <span className="hist-unit">kWh</span>
                        </td>
                        <td className="hist-note">{entry.notes || '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="hist-pagination">
                <button
                  className="hist-page-btn"
                  onClick={() => loadHistory(page - 1)}
                  disabled={page === 1}
                  aria-label="Previous page"
                >
                  <ChevronLeft size={14} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    className={`hist-page-btn ${p === page ? 'active' : ''}`}
                    onClick={() => loadHistory(p)}
                  >
                    {p}
                  </button>
                ))}
                <button
                  className="hist-page-btn"
                  onClick={() => loadHistory(page + 1)}
                  disabled={page === totalPages}
                  aria-label="Next page"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && data.length === 0 && (
          <div className="hist-panel hist-empty gs-reveal">
            <div className="hist-empty-icon">
              <Inbox size={30} strokeWidth={1.6} />
            </div>
            <p className="hist-empty-title">No impact records yet</p>
            <p className="hist-empty-text">Start tracking your carbon footprint today.</p>
          </div>
        )}
      </div>
    </>
  );
};

export default History;
