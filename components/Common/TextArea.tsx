'use client';

import React from 'react';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  label?: string;
}

export default function TextArea({ error, label, className = '', ...props }: TextAreaProps) {
  return (
    <textarea
      className={`
        w-full px-3 py-2 border border-gray-300 rounded-md
        focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
        disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
        transition-colors
        ${error ? 'border-red-500' : ''}
        ${className}
      `}
      {...props}
    />
  );
}
