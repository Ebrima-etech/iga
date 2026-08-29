import React from 'react';

type BadgeVariant = 'success' | 'error' | 'warning' | 'info' | 'default';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

const variantStyles = {
  success: 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold',
  error: 'bg-rose-50 text-rose-700 border border-rose-200 font-semibold',
  warning: 'bg-amber-50 text-amber-700 border border-amber-200 font-semibold',
  info: 'bg-blue-50 text-blue-700 border border-blue-200 font-semibold',
  default: 'bg-gray-100 text-gray-700 border border-gray-300 font-semibold',
};

const sizeStyles = {
  sm: 'px-2.5 py-0.5 text-xs rounded-md',
  md: 'px-3 py-1 text-sm rounded-md',
  lg: 'px-4 py-1.5 text-base rounded-md',
};

export default function Badge({ variant = 'default', size = 'md', children, icon }: BadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 ${sizeStyles[size]} ${variantStyles[variant]}`}>
      {icon && icon}
      {children}
    </span>
  );
}
