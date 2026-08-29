import React from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export default function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="mb-8 flex items-center justify-between">
      <div className="flex-1">
        <h1 className="text-5xl font-bold text-gray-900 mb-2 tracking-tight">{title}</h1>
        {description && <p className="text-gray-600 text-base font-medium">{description}</p>}
      </div>
      {action && <div className="ml-8">{action}</div>}
    </div>
  );
}
