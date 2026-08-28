import React from 'react';

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  description?: string;
}

export default function FormField({ label, required, error, children, description }: FormFieldProps) {
  return (
    <div className="mb-6">
      <label className="block text-sm font-semibold text-gray-900 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {description && <p className="text-xs text-gray-600 mb-2">{description}</p>}
      <div className="relative">
        {children}
        {error && <p className="text-xs text-red-600 mt-1.5">{error}</p>}
      </div>
    </div>
  );
}
