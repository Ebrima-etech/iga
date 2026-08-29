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
      className="group relative bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden"
    >
      {/* Background accent */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-60 transition-opacity duration-200" />

      <div className="relative z-10">
        {/* Header with icon */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{label}</p>
            <p className="text-4xl font-bold text-gray-900 tracking-tight">{value}</p>
          </div>
          {icon && (
            <div className="p-2.5 rounded-lg bg-blue-100 text-blue-600 group-hover:scale-110 transition-transform duration-200">
              {icon}
            </div>
          )}
        </div>

        {/* Trend indicator */}
        {trend && (
          <div className="flex items-center gap-2 pt-2">
            <span className={`text-sm font-semibold ${trendUp ? 'text-emerald-600' : 'text-rose-600'}`}>
              {trendUp && '↑'} {trend}
            </span>
            <span className="text-xs text-gray-500">vs last month</span>
          </div>
        )}
      </div>

      {/* Top border accent */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 via-blue-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
    </div>
  );
}
