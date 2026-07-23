import React from 'react';
import { Line } from 'react-chartjs-2';
import { TrendingUp } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

/* Scriptable gradient fill — purely presentational, chart.js reads the
   canvas context it's already given. Data/labels are untouched. */
const gradientFill = (color) => (context) => {
  const { ctx, chartArea } = context.chart;
  if (!chartArea) return `${color}00`;
  const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
  gradient.addColorStop(0, `${color}40`);
  gradient.addColorStop(1, `${color}00`);
  return gradient;
};

const TrendChart = ({ title, labels, data, color }) => {
  const chartData = {
    labels,
    datasets: [
      {
        label: title,
        data,
        borderColor: color,
        backgroundColor: gradientFill(color),
        borderWidth: 2.5,
        tension: 0.45,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: color,
        pointHoverBorderColor: 'rgba(9,9,11,0.9)',
        pointHoverBorderWidth: 2,
        fill: true,
        cubicInterpolationMode: 'monotone',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 900, easing: 'easeOutQuart' },
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: {
        backgroundColor: 'rgba(20,20,24,0.92)',
        titleColor: 'rgba(245,245,247,0.55)',
        bodyColor: '#f5f5f7',
        borderColor: 'rgba(255,255,255,0.10)',
        borderWidth: 1,
        padding: 12,
        titleFont: { family: '"Geist Mono", monospace', size: 10, weight: '600' },
        bodyFont: { family: '"Geist Mono", monospace', size: 13, weight: '700' },
        cornerRadius: 10,
        displayColors: false,
        caretSize: 5,
      },
    },
    scales: {
      x: {
        grid: { display: false, drawBorder: false },
        ticks: {
          font: { family: '"Geist Mono", monospace', size: 10 },
          color: 'rgba(245,245,247,0.3)',
          maxRotation: 0,
        },
        border: { display: false },
      },
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(255,255,255,0.05)', drawBorder: false },
        ticks: {
          font: { family: '"Geist Mono", monospace', size: 10 },
          color: 'rgba(245,245,247,0.3)',
          maxTicksLimit: 5,
        },
        border: { display: false },
      },
    },
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <p
        style={{
          fontSize: '0.68rem',
          fontWeight: 600,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'rgba(245,245,247,0.45)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          margin: 0,
          fontFamily: '"Geist Mono", monospace',
        }}
      >
        <TrendingUp size={13} color={color} strokeWidth={2.2} />
        {title}
      </p>

      <div style={{ flex: 1, minHeight: 0, height: '220px' }}>
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export default TrendChart;
