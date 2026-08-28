import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  error?: boolean;
  fullWidth?: boolean;
}

export default function Input({ icon, error, fullWidth = true, className = '', ...props }: InputProps) {
  return (
    <div className={`relative ${fullWidth ? 'w-full' : ''}`}>
      {icon && <div className="absolute left-4 top-3.5 text-gray-400">{icon}</div>}
      <input
        className={`
          w-full px-4 py-3 rounded-lg border-2 transition-all duration-200
          ${icon ? 'pl-12' : ''}
          ${error
            ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-200'
            : 'border-gray-200 bg-white focus:border-blue-500 focus:ring-blue-200'
          }
          focus:outline-none focus:ring-4
          placeholder-gray-400 text-gray-900
          disabled:bg-gray-50 disabled:text-gray-500 disabled:border-gray-200
          ${className}
        `}
        {...props}
      />
    </div>
  );
}
