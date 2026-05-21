import React from 'react';

const ScoreCard = ({ title, value, unit, icon, color }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium">{title}</p>
          <p className={`text-3xl font-bold mt-2 ${color}`}>
            {value} <span className="text-lg">{unit}</span>
          </p>
        </div>
        <div className={`text-5xl ${color}`}>{icon}</div>
      </div>
    </div>
  );
};

export default ScoreCard;