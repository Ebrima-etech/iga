import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  trend?: string;
  trendUp?: boolean;
  icon?: React.ReactNode;
  onClick?: () => void;
}

export default function StatCard({ label, value, trend, trendUp = true, icon, onClick }: StatCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg border border-gray-200 p-5 hover:border-gray-300 transition-colors duration-150 cursor-pointer"
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        {icon && <span className="text-gray-400">{icon}</span>}
      </div>

      <p className="text-3xl font-semibold text-gray-900 tracking-tight font-mono">{value}</p>

      {trend && (
        <div className="flex items-center gap-1.5 mt-2">
          <span className={`text-xs font-semibold ${trendUp ? 'text-emerald-600' : 'text-rose-600'}`}>
            {trendUp ? '↑' : '↓'} {trend}
          </span>
          <span className="text-xs text-gray-400">vs last month</span>
        </div>
      )}
    </div>
  );
}
