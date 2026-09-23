import React from 'react';
import { AlertCircle, CheckCircle2, AlertTriangle, Info, XCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'info' | 'warning' | 'danger' | 'success' | 'gold';
  title?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export const Alert: React.FC<AlertProps> = ({
  className,
  variant = 'info',
  title,
  icon,
  action,
  children,
  ...props
}) => {
  const baseStyles = 'rounded-xl p-4 border flex items-start gap-3.5 transition-all text-sm';

  const variants = {
    info: 'bg-blue-50/70 border-blue-200 text-blue-900',
    warning: 'bg-amber-50/70 border-amber-300 text-amber-950',
    danger: 'bg-red-50/70 border-red-200 text-red-950',
    success: 'bg-emerald-50/70 border-emerald-200 text-emerald-950',
    gold: 'bg-gold-50/80 border-gold-300 text-gold-950',
  };

  const defaultIcons = {
    info: <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />,
    danger: <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />,
    success: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />,
    gold: <AlertCircle className="w-5 h-5 text-gold-600 shrink-0 mt-0.5" />,
  };

  return (
    <div className={twMerge(clsx(baseStyles, variants[variant], className))} role="alert" {...props}>
      {icon || defaultIcons[variant]}
      <div className="flex-1 space-y-1">
        {title && <h5 className="font-semibold text-sm leading-tight">{title}</h5>}
        <div className="text-xs opacity-90 leading-relaxed">{children}</div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};
