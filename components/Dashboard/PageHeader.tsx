import React from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export default function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="mb-8 pb-6 flex items-center justify-between border-b border-gray-200">
      <div className="flex-1">
        <h1 className="text-4xl font-bold text-gray-900 tracking-tight">{title}</h1>
        {description && <p className="text-gray-500 text-sm mt-1.5">{description}</p>}
      </div>
      {action && <div className="ml-8 flex-shrink-0">{action}</div>}
    </div>
  );
}
