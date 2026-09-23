import React from 'react';
import { FolderOpen } from 'lucide-react';

export interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  action,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-10 text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/40 ${className}`}>
      <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center mb-4 shadow-soft">
        {icon || <FolderOpen className="w-6 h-6 text-emerald-700" />}
      </div>
      <h4 className="text-base font-bold text-emerald-950 font-display mb-1">{title}</h4>
      <p className="text-xs text-slate-500 max-w-sm mb-6 leading-relaxed">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
};
