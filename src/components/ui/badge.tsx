import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
}

export function Badge({
  className,
  variant = 'default',
  ...props
}: BadgeProps) {
  const styles = {
    default: 'bg-slate-900 text-white border border-slate-900',
    success: 'bg-emerald-50/80 text-emerald-800 border border-emerald-200/80',
    warning: 'bg-amber-50/80 text-amber-800 border border-amber-200/80',
    danger: 'bg-rose-50/80 text-rose-700 border border-rose-200/80',
    info: 'bg-teal-50/80 text-teal-800 border border-teal-200/80',
    neutral: 'bg-stone-100 text-stone-700 border border-stone-200/90',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium tracking-tight',
        styles[variant],
        className,
      )}
      {...props}
    />
  );
}
