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
  success: 'bg-green-100 text-green-800 border border-green-200',
  error: 'bg-red-100 text-red-800 border border-red-200',
  warning: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
  info: 'bg-blue-100 text-blue-800 border border-blue-200',
  default: 'bg-gray-100 text-gray-800 border border-gray-200',
};

const sizeStyles = {
  sm: 'px-2 py-0.5 text-xs font-medium',
  md: 'px-3 py-1 text-sm font-medium',
  lg: 'px-4 py-1.5 text-base font-medium',
};

export default function Badge({ variant = 'default', size = 'md', children, icon }: BadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full ${sizeStyles[size]} ${variantStyles[variant]}`}>
      {icon && icon}
      {children}
    </span>
  );
}
