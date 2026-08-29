import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  padding?: 'sm' | 'md' | 'lg';
  shadow?: 'sm' | 'md' | 'lg';
  border?: boolean;
}

const paddingStyles = {
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

const shadowStyles = {
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
};

export default function Card({
  children,
  className = '',
  hoverable,
  padding = 'md',
  shadow = 'sm',
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
