import React from 'react';

interface Metric {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  caption?: string;
}

interface MetricsPanelProps {
  title?: string;
  metrics: Metric[];
}

export default function MetricsPanel({ title, metrics }: MetricsPanelProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {title && (
        <div className="px-5 py-3 border-b border-gray-200">
          <p className="text-sm font-medium text-gray-700">{title}</p>
        </div>
      )}
      <div className="grid grid-cols-2 md:grid-cols-4">
        {metrics.map((metric, idx) => (
          <div
            key={metric.label}
            className={`p-5 ${idx > 0 ? 'border-l border-gray-100' : ''} ${
              idx >= 2 ? 'border-t md:border-t-0 border-gray-100' : ''
            }`}
          >
            <div className="flex items-center gap-1.5 text-gray-500 mb-2">
              {metric.icon}
              <span className="text-sm font-medium">{metric.label}</span>
            </div>
            <p className="text-2xl font-semibold text-gray-900 font-mono tracking-tight">{metric.value}</p>
            {metric.caption && <p className="text-xs text-gray-400 mt-1">{metric.caption}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
