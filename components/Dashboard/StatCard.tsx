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
      className="group relative bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden"
    >
      {/* Background accent */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-primary-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative z-10">
        {/* Header with icon */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-2">{label}</p>
            <p className="text-3xl font-bold text-gray-900 tracking-tight">{value}</p>
          </div>
          {icon && (
            <div className="p-3 rounded-lg bg-gradient-to-br from-primary-50 to-primary-100 text-primary-600 group-hover:scale-110 transition-transform duration-300">
              {icon}
            </div>
          )}
        </div>

        {/* Trend indicator */}
        {trend && (
          <div className="flex items-center gap-1">
            <span className={`text-sm font-semibold ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
              {trendUp && '↑'} {trend}
            </span>
            <span className="text-xs text-gray-500">from last month</span>
          </div>
        )}
      </div>

      {/* Bottom border accent */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 via-primary-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
  );
}
