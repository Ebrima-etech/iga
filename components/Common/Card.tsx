import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  padding?: 'sm' | 'md' | 'lg' | 'none';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  border?: boolean;
}

const paddingStyles = {
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
  none: '',
};

const shadowStyles = {
  none: '',
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
};

export default function Card({
  children,
  className = '',
  hoverable,
  padding = 'md',
  shadow = 'none',
  border = true,
}: CardProps) {
  return (
    <div
      className={`
        bg-white rounded-lg transition-all duration-200
        ${border ? 'border border-gray-200' : ''}
        ${shadowStyles[shadow]}
        ${paddingStyles[padding]}
        ${hoverable ? 'hover:shadow-md hover:border-gray-300 hover:-translate-y-0.5 cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
