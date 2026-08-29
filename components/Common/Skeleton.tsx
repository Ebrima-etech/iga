import React from 'react';

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
        <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
          <span className="text-xs font-bold text-gray-900 uppercase tracking-widest">{engrave}</span>
        </div>
      )}
      {icon && (
        <div className="absolute inset-0 flex items-center justify-center opacity-15 pointer-events-none">
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
  const kabaIcon = (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2L8 6H4V18C4 19.1 4.9 20 6 20H18C19.1 20 20 19.1 20 18V6H16L12 2ZM12 4L14 6H10L12 4Z" />
    </svg>
  );

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
                    icon={showKaaba && colIdx === 0 && idx % 2 === 0 ? kabaIcon : undefined}
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
