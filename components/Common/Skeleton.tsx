import React from 'react';

const KabaIcon = () => (
  <svg className="w-12 h-12" viewBox="0 0 100 100" fill="currentColor">
    {/* Kaaba structure */}
    <rect x="20" y="30" width="60" height="50" fill="none" stroke="currentColor" strokeWidth="3" />
    {/* Roof */}
    <polygon points="20,30 50,10 80,30" fill="none" stroke="currentColor" strokeWidth="2" />
    {/* Door */}
    <rect x="42" y="50" width="16" height="25" fill="none" stroke="currentColor" strokeWidth="2" />
    {/* Hateem (semi-circle area) */}
    <path d="M 25 35 Q 25 25 35 25" fill="none" stroke="currentColor" strokeWidth="2" />
  </svg>
);

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  circle?: boolean;
  variant?: 'text' | 'rectangular' | 'circular';
  engrave?: string;
  icon?: React.ReactNode;
}

export function Skeleton({
  className = '',
  width,
  height,
  circle = false,
  variant = 'rectangular',
  engrave,
  icon,
}: SkeletonProps) {
  const baseClass =
    'bg-gray-100 animate-subtle-shimmer relative overflow-hidden';

  const variantClass = {
    text: 'rounded-md h-4',
    rectangular: 'rounded-lg',
    circular: 'rounded-full',
  };

  return (
    <div
      className={`${baseClass} ${variantClass[variant]} ${className}`}
      style={{
        width: width || '100%',
        height: height || (variant === 'text' ? '1rem' : '100px'),
      }}
    >
      {engrave && (
        <div className="absolute inset-0 flex items-center justify-center opacity-50 pointer-events-none">
          <span className="text-sm font-bold text-gray-800 uppercase tracking-wider">{engrave}</span>
        </div>
      )}
      {icon && (
        <div className="absolute inset-0 flex items-center justify-center opacity-40 pointer-events-none text-gray-700">
          {icon}
        </div>
      )}
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="p-6 bg-white rounded-lg border border-amber-100 shadow-sm">
      <div className="space-y-4">
        <Skeleton height={16} width="60%" variant="text" engrave="HAJJ 2026" />
        <Skeleton height={32} width="80%" variant="text" engrave="HAJJ 2026" />
        <Skeleton height={12} width="40%" variant="text" engrave="HAJJ 2026" />
      </div>
    </div>
  );
}

export function TableRowSkeleton({ columnCount = 6 }) {
  return (
    <tr className="border-b border-amber-100">
      {Array.from({ length: columnCount }).map((_, idx) => (
        <td key={idx} className="px-6 py-4">
          <Skeleton height={16} width="80%" variant="text" />
        </td>
      ))}
    </tr>
  );
}

export function TableSkeleton({ rows = 5, columnCount = 6 }) {
  return (
    <div className="rounded-lg border border-amber-100 overflow-hidden">
      {/* Header */}
      <div className="border-b-2 border-amber-200 bg-amber-50 px-6 py-4">
        <div className="flex gap-6">
          {Array.from({ length: columnCount }).map((_, idx) => (
            <Skeleton key={idx} height={14} width={`${100 / columnCount}%`} variant="text" />
          ))}
        </div>
      </div>

      {/* Rows */}
      <table className="w-full">
        <tbody>
          {Array.from({ length: rows }).map((_, idx) => (
            <TableRowSkeleton key={idx} columnCount={columnCount} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="p-6 bg-white rounded-lg border border-amber-100 shadow-sm">
      <div className="space-y-4">
        <Skeleton height={20} width="40%" variant="text" />
        <Skeleton height={300} width="100%" variant="rectangular" />
      </div>
    </div>
  );
}

export function KabaaTableSkeleton({ rows = 5, columnCount = 6 }) {
  const showKaaba = Math.random() > 0.5;

  return (
    <div className="rounded-lg border border-amber-100 overflow-hidden">
      {/* Header */}
      <div className="border-b-2 border-amber-200 bg-amber-50 px-6 py-4">
        <div className="flex gap-6">
          {Array.from({ length: columnCount }).map((_, idx) => (
            <Skeleton key={idx} height={14} width={`${100 / columnCount}%`} variant="text" />
          ))}
        </div>
      </div>

      {/* Rows */}
      <table className="w-full">
        <tbody>
          {Array.from({ length: rows }).map((_, idx) => (
            <tr key={idx} className="border-b border-amber-100">
              {Array.from({ length: columnCount }).map((_, colIdx) => (
                <td key={colIdx} className="px-6 py-4">
                  <Skeleton
                    height={16}
                    width="80%"
                    variant="text"
                    icon={showKaaba && colIdx === 0 && idx % 2 === 0 ? <KabaIcon /> : undefined}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
