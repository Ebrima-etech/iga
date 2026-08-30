import React from 'react';
import { BiShow, BiHide } from 'react-icons/bi';

interface Metric {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  caption?: string;
  isFinancial?: boolean;
  fieldId?: string;
  isHidden?: boolean;
}

interface MetricsPanelProps {
  title?: string;
  metrics: Metric[];
  onToggleField?: (fieldId: string) => void;
}

export default function MetricsPanel({ title, metrics, onToggleField }: MetricsPanelProps) {
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
            <div className="flex items-center justify-between gap-1.5 text-gray-500 mb-2">
              <div className="flex items-center gap-1.5">
                {metric.icon}
                <span className="text-sm font-medium">{metric.label}</span>
              </div>
              {metric.isFinancial && metric.fieldId && onToggleField && (
                <button
                  onClick={() => onToggleField(metric.fieldId!)}
                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                  title={metric.isHidden ? 'Show' : 'Hide'}
                >
                  {metric.isHidden ? <BiHide size={14} className="text-gray-600" /> : <BiShow size={14} className="text-gray-600" />}
                </button>
              )}
            </div>
            <p className="text-2xl font-semibold text-gray-900 font-mono tracking-tight">
              {metric.isFinancial && metric.isHidden ? '••••••' : metric.value}
            </p>
            {metric.caption && <p className="text-xs text-gray-400 mt-1">{metric.caption}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
