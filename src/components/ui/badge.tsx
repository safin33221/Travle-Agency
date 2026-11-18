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
    success: 'bg-emerald-100/80 text-emerald-800 border border-emerald-300',
    warning: 'bg-amber-100/80 text-amber-900 border border-amber-300',
    danger: 'bg-rose-100/80 text-rose-800 border border-rose-300',
    info: 'bg-sky-100/80 text-sky-800 border border-sky-300',
    neutral: 'bg-slate-100 text-slate-700 border border-slate-300',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-tight',
        styles[variant],
        className,
      )}
      {...props}
    />
  );
}
