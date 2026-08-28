import React from 'react';
import { BiAlertCircle, BiRefresh } from 'react-icons/bi';
import Card from './Card';
import ProfessionalButton from './ProfessionalButton';

interface ErrorStateProps {
  title: string;
  description?: string;
  error?: string;
  onRetry?: () => void;
  variant?: 'error' | 'warning' | 'not-found';
}

export default function ErrorState({
  title,
  description,
  error,
  onRetry,
  variant = 'error',
}: ErrorStateProps) {
  const variantStyles = {
    error: 'text-red-500',
    warning: 'text-yellow-500',
    'not-found': 'text-orange-500',
  };

  return (
    <Card>
      <div className="flex flex-col items-center justify-center py-16 px-8">
        <div className={`mb-6 ${variantStyles[variant]}`}>
          <BiAlertCircle size={48} />
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">{title}</h3>

        {description && <p className="text-gray-600 text-center mb-4 max-w-sm">{description}</p>}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg max-w-sm">
            <p className="text-sm text-red-700 font-mono">{error}</p>
          </div>
        )}

        {onRetry && (
          <ProfessionalButton
            variant={variant === 'error' ? 'danger' : 'primary'}
            size="md"
            icon={<BiRefresh size={18} />}
            onClick={onRetry}
          >
            Try Again
          </ProfessionalButton>
        )}
      </div>
    </Card>
  );
}
