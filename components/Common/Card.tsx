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
        bg-white rounded-xl transition-all duration-300
        ${border ? 'border border-amber-100' : ''}
        ${shadowStyles[shadow]}
        ${paddingStyles[padding]}
        ${hoverable ? 'hover:shadow-lg hover:border-amber-200 hover:-translate-y-1 cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
