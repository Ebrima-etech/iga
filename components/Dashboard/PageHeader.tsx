import React from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export default function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="mb-8 flex items-start justify-between">
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">{title}</h1>
        {description && <p className="text-gray-600 text-lg">{description}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
