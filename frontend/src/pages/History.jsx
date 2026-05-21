import React, { useEffect, useState } from 'react';
import { getHistory } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

/* ─── Styles ──────────────────────────────────────────────────────────────── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;600;700&display=swap');

  :root {
    --hist-nav-h: 68px;
    --hist-green: #16a34a;
    --hist-green-light: #22c55e;
    --hist-border: rgba(0, 0, 0, 0.12);
    --hist-box-bg: rgba(0, 0, 0, 0.04);
    --hist-link: rgba(30, 30, 30, 0.65);
    --hist-link-hover: #111;
  }

  /* ── Keyframes ── */
  @keyframes hist-fade-up {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes hist-line-grow {
    from { transform: scaleX(0); }
    to   { transform: scaleX(1); }
  }
  @keyframes hist-gradient-shift {
    0%   { background-position: 0%; }
    100% { background-position: 300%; }
  }
  @keyframes hist-row-in {
    from { opacity: 0; transform: translateX(-10px); }
    to   { opacity: 1; transform: translateX(0); }
  }

  /* ── Page shell ── */
  .hist-page {
    max-width: 1280px;
    margin: 0 auto;
    padding: calc(var(--hist-nav-h) + 2.5rem) 1.5rem 4rem;
    font-family: "Geist Mono", monospace;
  }

  /* ── Stagger reveal ── */
  .hist-reveal {
    opacity: 0;
    animation: hist-fade-up 0.55s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  }
  .hist-reveal[data-delay="0"] { animation-delay: 0.05s; }
  .hist-reveal[data-delay="1"] { animation-delay: 0.12s; }
  .hist-reveal[data-delay="2"] { animation-delay: 0.19s; }
  .hist-reveal[data-delay="3"] { animation-delay: 0.26s; }

  /* ── Header ── */
  .hist-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2.5rem;
  }

  .hist-title {
    font-size: clamp(1.4rem, 3vw, 2rem);
    font-weight: 700;
    letter-spacing: -0.02em;
    color: #111;
    line-height: 1;
    position: relative;
    display: inline-block;
  }
  .hist-title::after {
    content: '';
    position: absolute;
    bottom: -6px; left: 0;
    width: 100%; height: 2px;
    background: linear-gradient(90deg, var(--hist-green), var(--hist-green-light), var(--hist-green));
    background-size: 300%;
    animation: hist-gradient-shift 2.4s linear infinite,
               hist-line-grow 0.6s 0.15s cubic-bezier(0.22,1,0.36,1) both;
    transform-origin: left;
  }

  /* ── Meta badge (page count) ── */
  .hist-meta {
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: rgba(0,0,0,0.35);
    border: 1px solid var(--hist-border);
    border-radius: 3px;
    padding: 0.3rem 0.7rem;
  }

  /* ── Panel wrapper ── */
  .hist-panel {
    position: relative;
    border: 1px solid var(--hist-border);
    border-radius: 4px;
    background: #fff;
    overflow: hidden;
    transition: border-color 0.22s ease, box-shadow 0.22s ease;
    margin-bottom: 1.25rem;
  }
  .hist-panel:hover {
    border-color: rgba(0,0,0,0.22);
    box-shadow: 0 4px 24px rgba(0,0,0,0.05);
  }
  .hist-panel::before,
  .hist-panel::after {
    content: '';
    position: absolute;
    width: 8px; height: 8px;
    opacity: 0;
    transition: opacity 0.22s ease;
    pointer-events: none;
    z-index: 2;
  }
  .hist-panel::before {
    top: -1px; left: -1px;
    border-top: 1px solid rgba(22,163,74,0.65);
    border-left: 1px solid rgba(22,163,74,0.65);
  }
  .hist-panel::after {
    bottom: -1px; right: -1px;
    border-bottom: 1px solid rgba(22,163,74,0.65);
    border-right: 1px solid rgba(22,163,74,0.65);
  }
  .hist-panel:hover::before,
  .hist-panel:hover::after { opacity: 1; }

  /* ── Table ── */
  .hist-table {
    width: 100%;
    border-collapse: collapse;
  }

  /* thead */
  .hist-thead {
    border-bottom: 1px solid var(--hist-border);
    background: rgba(0,0,0,0.018);
  }
  .hist-th {
    padding: 0.7rem 1.25rem;
    text-align: left;
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: rgba(0,0,0,0.38);
    white-space: nowrap;
  }
  .hist-th:first-child { padding-left: 1.5rem; }
  .hist-th:last-child  { padding-right: 1.5rem; }

  /* column accent line in thead */
  .hist-th-inner {
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }
  .hist-th-inner::before {
    content: '';
    display: inline-block;
    width: 10px; height: 1px;
    background: var(--hist-green);
    opacity: 0.5;
  }

  /* tbody rows */
  .hist-tr {
    border-bottom: 1px solid rgba(0,0,0,0.055);
    opacity: 0;
    animation: hist-row-in 0.38s cubic-bezier(0.22,1,0.36,1) forwards;
    transition: background 0.14s ease;
  }
  .hist-tr:last-child { border-bottom: none; }
  .hist-tr:hover { background: rgba(0,0,0,0.022); }

  /* left accent bar on row hover */
  .hist-tr td:first-child {
    position: relative;
  }
  .hist-tr td:first-child::before {
    content: '';
    position: absolute;
    left: 0; top: 0; bottom: 0;
    width: 2px;
    background: linear-gradient(180deg, var(--hist-green), var(--hist-green-light));
    transform: scaleY(0);
    transform-origin: top;
    transition: transform 0.22s cubic-bezier(0.22,1,0.36,1);
  }
  .hist-tr:hover td:first-child::before { transform: scaleY(1); }

  .hist-td {
    padding: 0.85rem 1.25rem;
    font-size: 0.78rem;
    color: #222;
    white-space: nowrap;
  }
  .hist-td:first-child { padding-left: 1.5rem; }
  .hist-td:last-child  { padding-right: 1.5rem; }

  /* ── Rating badge ── */
  .hist-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    padding: 0.2rem 0.6rem;
    border-radius: 3px;
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    border: 1px solid;
  }
  .hist-badge.excellent { color: #15803d; background: rgba(22,163,74,0.08); border-color: rgba(22,163,74,0.25); }
  .hist-badge.good      { color: #1d4ed8; background: rgba(59,130,246,0.08); border-color: rgba(59,130,246,0.25); }
  .hist-badge.moderate  { color: #b45309; background: rgba(251,191,36,0.10); border-color: rgba(251,191,36,0.3); }
  .hist-badge.poor      { color: #b91c1c; background: rgba(239,68,68,0.08);  border-color: rgba(239,68,68,0.25); }

  /* ── Pagination row ── */
  .hist-pagination {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
  }

  .hist-page-info {
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: rgba(0,0,0,0.38);
  }

  /* ── Pagination buttons (same nav-link pattern) ── */
  .hist-page-btn {
    position: relative;
    display: inline-flex;
    align-items: center;
    font-family: "Geist Mono", monospace;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.13em;
    text-transform: uppercase;
    padding: 0.45rem 1rem;
    border: 1px solid var(--hist-border);
    border-radius: 3px;
    background: none;
    cursor: pointer;
    transition: border-color 0.18s ease, background 0.18s ease;
    overflow: hidden;
  }
  .hist-page-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
    pointer-events: none;
  }
  .hist-page-btn:not(:disabled):hover {
    border-color: rgba(0,0,0,0.28);
    background: var(--hist-box-bg);
  }

  .hist-page-btn .corner-tl,
  .hist-page-btn .corner-br {
    position: absolute;
    width: 5px; height: 5px;
    opacity: 0;
    transition: opacity 0.18s ease;
    pointer-events: none;
  }
  .hist-page-btn .corner-tl {
    top: -1px; left: -1px;
    border-top: 1px solid rgba(0,0,0,0.45);
    border-left: 1px solid rgba(0,0,0,0.45);
  }
  .hist-page-btn .corner-br {
    bottom: -1px; right: -1px;
    border-bottom: 1px solid rgba(0,0,0,0.45);
    border-right: 1px solid rgba(0,0,0,0.45);
  }
  .hist-page-btn:not(:disabled):hover .corner-tl,
  .hist-page-btn:not(:disabled):hover .corner-br { opacity: 1; }

  .hist-page-btn .link-text {
    display: block; overflow: hidden; height: 1em;
  }
  .hist-page-btn .link-track {
    display: flex;
    flex-direction: column;
    transition: transform 0.4s cubic-bezier(0.76,0,0.24,1);
  }
  .hist-page-btn:not(:disabled):hover .link-track { transform: translateY(-50%); }
  .hist-page-btn .link-track span {
    display: block; height: 1em; line-height: 1em;
  }
  .hist-page-btn .link-track span:first-child { color: var(--hist-link); }
  .hist-page-btn .link-track span:last-child  { color: var(--hist-link-hover); }

  /* ── Empty state ── */
  .hist-empty {
    border: 1px dashed rgba(0,0,0,0.14);
    border-radius: 4px;
    padding: 5rem 2rem;
    text-align: center;
    animation: hist-fade-up 0.5s ease both;
  }
  .hist-empty-icon {
    font-size: 2.5rem;
    display: block;
    margin-bottom: 1rem;
    animation: hist-fade-up 0.5s 0.1s ease both;
  }
  .hist-empty-title {
    font-size: 0.85rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: rgba(0,0,0,0.45);
    animation: hist-fade-up 0.5s 0.2s ease both;
  }

  /* ── Responsive ── */
  @media (max-width: 700px) {
    .hist-th:nth-child(3),
    .hist-td:nth-child(3),
    .hist-th:nth-child(4),
    .hist-td:nth-child(4) { display: none; }
  }
`;

/* ─── helpers ─────────────────────────────────────────────────────────────── */
const ratingClass = (r) => {
  if (r === 'Excellent') return 'excellent';
  if (r === 'Good')      return 'good';
  if (r === 'Moderate')  return 'moderate';
  return 'poor';
};

const PageBtn = ({ label, onClick, disabled }) => (
  <button className="hist-page-btn" onClick={onClick} disabled={disabled}>
    <div className="corner-tl" />
    <div className="link-text">
      <div className="link-track">
        <span>{label}</span>
        <span>{label}</span>
      </div>
    </div>
    <div className="corner-br" />
  </button>
);

/* ─── Component ───────────────────────────────────────────────────────────── */
const History = () => {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage]       = useState(1);

  useEffect(() => { fetchHistory(); }, [page]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await getHistory(page, 10);
      setData(response.data);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  const totalPages = Math.ceil((data?.total || 0) / (data?.page_size || 10));

  const COLS = [
    { label: 'Date' },
    { label: 'Carbon (kg CO₂)' },
    { label: 'Water (L)' },
    { label: 'Energy (kWh)' },
    { label: 'Waste (kg)' },
    { label: 'Rating' },
  ];

  return (
    <>
      <style>{styles}</style>

      <div className="hist-page">

        {/* ── Header ── */}
        <div className="hist-header hist-reveal" data-delay="0">
          <h1 className="hist-title">Impact History</h1>
          {data?.total > 0 && (
            <span className="hist-meta">{data.total} records</span>
          )}
        </div>

        {data?.data?.length > 0 ? (
          <>
            {/* ── Table panel ── */}
            <div className="hist-panel hist-reveal" data-delay="1">
              <table className="hist-table">
                <thead className="hist-thead">
                  <tr>
                    {COLS.map((col) => (
                      <th key={col.label} className="hist-th">
                        <div className="hist-th-inner">{col.label}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.data.map((log, i) => (
                    <tr
                      key={log.id}
                      className="hist-tr"
                      style={{ animationDelay: `${0.15 + i * 0.045}s` }}
                    >
                      <td className="hist-td">
                        {new Date(log.created_at).toLocaleString(undefined, {
                          year: 'numeric', month: 'short', day: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </td>
                      <td className="hist-td">{log.carbon_score}</td>
                      <td className="hist-td">{log.water_score}</td>
                      <td className="hist-td">{log.energy_score}</td>
                      <td className="hist-td">{log.waste_score}</td>
                      <td className="hist-td">
                        <span className={`hist-badge ${ratingClass(log.overall_rating)}`}>
                          {log.overall_rating}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ── Pagination ── */}
            <div className="hist-pagination hist-reveal" data-delay="2">
              <PageBtn
                label="← Previous"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              />
              <span className="hist-page-info">
                Page {page} / {totalPages}
              </span>
              <PageBtn
                label="Next →"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              />
            </div>
          </>
        ) : (
          /* ── Empty state ── */
          <div className="hist-empty">
            <span className="hist-empty-icon">📭</span>
            <p className="hist-empty-title">No history available</p>
          </div>
        )}
      </div>
    </>
  );
};

export default History;