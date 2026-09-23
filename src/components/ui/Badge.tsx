import React from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'emerald' | 'gold' | 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'unverified-legal';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'neutral',
  size = 'md',
  dot = false,
  children,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center font-medium rounded-full select-none shrink-0 tracking-wide';

  const variants = {
    emerald: 'bg-emerald-50 text-emerald-800 border border-emerald-300/60',
    gold: 'bg-gold-50 text-gold-800 border border-gold-300/60 font-semibold',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border border-amber-300',
    danger: 'bg-red-50 text-red-700 border border-red-200',
    info: 'bg-blue-50 text-blue-700 border border-blue-200',
    neutral: 'bg-slate-100 text-slate-700 border border-slate-200',
    'unverified-legal': 'bg-amber-100 text-amber-900 border border-amber-400 font-semibold text-[11px]',
  };

  const sizes = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-0.5 gap-1.5',
    lg: 'text-sm px-3 py-1 gap-2',
  };

  const dotColors = {
    emerald: 'bg-emerald-600',
    gold: 'bg-gold-500',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-red-500',
    info: 'bg-blue-500',
    neutral: 'bg-slate-400',
    'unverified-legal': 'bg-amber-600',
  };

  if (variant === 'unverified-legal') {
    return (
      <span
        className={twMerge(
          clsx(
            baseStyles,
            variants['unverified-legal'],
            sizes[size],
            'shadow-sm',
            className
          )
        )}
        title="Statutory approval pending official legal/CA certification"
        {...props}
      >
        <AlertTriangle className="w-3 h-3 text-amber-700 shrink-0" />
        <span>REQUIRES ORGANIZATIONAL / CA / CS / LEGAL VERIFICATION</span>
      </span>
    );
  }

  return (
    <span className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))} {...props}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]} shrink-0`} />}
      {children}
    </span>
  );
};
