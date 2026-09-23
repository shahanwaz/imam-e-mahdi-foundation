import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { TrendingUp, TrendingDown } from 'lucide-react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
  hoverEffect?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, glass = false, hoverEffect = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={twMerge(
          clsx(
            'rounded-2xl border transition-all duration-200',
            glass
              ? 'glass-panel shadow-card'
              : 'bg-white border-slate-200/80 shadow-card',
            hoverEffect && 'hover:shadow-elevated hover:border-emerald-700/20 hover:-translate-y-0.5',
            className
          )
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = 'Card';

export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={twMerge('flex flex-col space-y-1.5 p-6 border-b border-slate-100', className)} {...props} />
  )
);
CardHeader.displayName = 'CardHeader';

export const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={twMerge('font-semibold text-lg text-emerald-950 tracking-tight', className)} {...props} />
  )
);
CardTitle.displayName = 'CardTitle';

export const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={twMerge('text-xs text-slate-500 font-normal', className)} {...props} />
  )
);
CardDescription.displayName = 'CardDescription';

export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={twMerge('p-6', className)} {...props} />
  )
);
CardContent.displayName = 'CardContent';

export const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={twMerge('flex items-center p-6 pt-0 border-t border-slate-100 mt-4', className)} {...props} />
  )
);
CardFooter.displayName = 'CardFooter';

export interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  icon: React.ReactNode;
  variant?: 'emerald' | 'gold' | 'neutral';
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  icon,
  variant = 'emerald',
  className = '',
}) => {
  const iconBg = {
    emerald: 'bg-emerald-50 text-emerald-800 border-emerald-200/60',
    gold: 'bg-gold-50 text-gold-700 border-gold-200/60',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  return (
    <Card hoverEffect className={twMerge('p-5 relative overflow-hidden', className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{title}</p>
          <p className="text-2xl font-bold tracking-tight text-emerald-950 font-display">{value}</p>
        </div>
        <div className={`p-3 rounded-xl border ${iconBg[variant]} shrink-0 shadow-soft`}>
          {icon}
        </div>
      </div>

      {(trend || subtitle) && (
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100/80 text-xs">
          {trend && (
            <span
              className={`inline-flex items-center gap-0.5 font-semibold px-1.5 py-0.5 rounded ${
                trend.isPositive ? 'text-emerald-700 bg-emerald-50' : 'text-red-700 bg-red-50'
              }`}
            >
              {trend.isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              {trend.value}
            </span>
          )}
          {subtitle && <span className="text-slate-500 truncate">{subtitle}</span>}
        </div>
      )}
    </Card>
  );
};
