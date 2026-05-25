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

const TrendChart = ({ title, labels, data, color }) => {
  const chartData = {
    labels,
    datasets: [
      {
        label: title,
        data,
        borderColor: color,
        backgroundColor: `${color}18`,
        borderWidth: 1.5,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 5,
        pointBackgroundColor: color,
        pointBorderColor: '#fff',
        pointBorderWidth: 1.5,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title:  { display: false },
      tooltip: {
        backgroundColor: 'rgba(255,255,255,0.96)',
        titleColor: '#111',
        bodyColor: '#555',
        borderColor: 'rgba(0,0,0,0.10)',
        borderWidth: 1,
        padding: 10,
        titleFont: { family: '"Geist Mono", monospace', size: 11, weight: '700' },
        bodyFont:  { family: '"Geist Mono", monospace', size: 11 },
        cornerRadius: 3,
        displayColors: false,
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(0,0,0,0.04)', drawBorder: false },
        ticks: {
          font: { family: '"Geist Mono", monospace', size: 10 },
          color: 'rgba(0,0,0,0.35)',
          maxRotation: 0,
        },
        border: { display: false },
      },
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0,0,0,0.04)', drawBorder: false },
        ticks: {
          font: { family: '"Geist Mono", monospace', size: 10 },
          color: 'rgba(0,0,0,0.35)',
          maxTicksLimit: 5,
        },
        border: { display: false },
      },
    },
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      {/* Panel title row */}
      <p
        style={{
          fontSize: '0.72rem',
          fontWeight: 700,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'rgba(0,0,0,0.4)',
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

      {/* Chart */}
      <div style={{ flex: 1, minHeight: 0, height: '220px' }}>
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export default TrendChart;