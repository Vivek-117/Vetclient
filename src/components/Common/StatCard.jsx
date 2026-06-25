import React from 'react';

const StatCard = ({ title, value, icon, color, subtitle }) => (
  <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500 mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-800">{value}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
      </div>
      <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg`}>
        {icon}
      </div>
    </div>
  </div>
);

export default StatCard;