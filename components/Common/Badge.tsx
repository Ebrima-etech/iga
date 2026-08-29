import React from 'react';

type BadgeVariant = 'success' | 'error' | 'warning' | 'info' | 'default';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  children: React.ReactNode;
  icon?: React.ReactNode;
  dot?: boolean;
}

const dotColors = {
  success: 'bg-emerald-500',
  error: 'bg-red-500',
  warning: 'bg-amber-500',
  info: 'bg-blue-500',
  default: 'bg-gray-400',
};

const textColors = {
  success: 'text-gray-900',
  error: 'text-gray-900',
  warning: 'text-gray-900',
  info: 'text-gray-900',
  default: 'text-gray-700',
};

const sizeStyles = {
  sm: 'text-xs gap-1.5',
  md: 'text-sm gap-2',
  lg: 'text-base gap-2',
};

const dotSizes = {
  sm: 'w-1.5 h-1.5',
  md: 'w-2 h-2',
  lg: 'w-2.5 h-2.5',
};

const pillStyles = {
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  error: 'bg-red-50 text-red-700 border-red-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  info: 'bg-blue-50 text-blue-700 border-blue-200',
  default: 'bg-gray-100 text-gray-700 border-gray-200',
};

export default function Badge({ variant = 'default', size = 'md', children, icon, dot = true }: BadgeProps) {
  if (!dot) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md font-medium border ${sizeStyles[size]} ${pillStyles[variant]}`}
      >
        {icon}
        {children}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center font-medium ${sizeStyles[size]} ${textColors[variant]}`}>
      <span className={`rounded-full flex-shrink-0 ${dotColors[variant]} ${dotSizes[size]}`} />
      {icon}
      {children}
    </span>
  );
}
