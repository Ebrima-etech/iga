import React from 'react';
import { BiSearch, BiFileBlank } from 'react-icons/bi';
import Card from './Card';
import ProfessionalButton from './ProfessionalButton';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  variant?: 'default' | 'search' | 'no-data';
}

export default function EmptyState({
  title,
  description,
  icon,
  action,
  variant = 'default',
}: EmptyStateProps) {
  const defaultIcons = {
    default: <BiFileBlank size={48} className="text-amber-300" />,
    search: <BiSearch size={48} className="text-amber-300" />,
    'no-data': <BiFileBlank size={48} className="text-amber-300" />,
  };

  return (
    <Card>
      <div className="flex flex-col items-center justify-center py-16 px-8">
        <div className="mb-6">{icon || defaultIcons[variant]}</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">{title}</h3>
        {description && <p className="text-gray-600 text-center mb-6 max-w-sm">{description}</p>}
        {action && (
          <ProfessionalButton variant="primary" size="md" onClick={action.onClick}>
            {action.label}
          </ProfessionalButton>
        )}
      </div>
    </Card>
  );
}
