import React from 'react';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  circle?: boolean;
  variant?: 'text' | 'rectangular' | 'circular';
}

export function Skeleton({
  className = '',
  width,
  height,
  circle = false,
  variant = 'rectangular',
}: SkeletonProps) {
  const baseClass =
    'bg-gray-100 animate-subtle-shimmer';

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
    />
  );
}

export function StatCardSkeleton() {
  return (
    <div className="p-6 bg-white rounded-lg border border-amber-100 shadow-sm">
      <div className="space-y-4">
        <Skeleton height={16} width="60%" variant="text" />
        <Skeleton height={32} width="80%" variant="text" />
        <Skeleton height={12} width="40%" variant="text" />
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
