import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'secondary' | 'destructive' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const variantClasses = {
      default:
        'bg-slate-900 text-white hover:bg-slate-800 shadow-2xs disabled:opacity-50',
      outline:
        'border border-stone-300 bg-white text-slate-800 hover:bg-stone-50 hover:border-stone-400 shadow-2xs disabled:opacity-50',
      secondary:
        'bg-teal-700 text-white hover:bg-teal-800 shadow-2xs disabled:opacity-50',
      destructive:
        'bg-rose-600 text-white hover:bg-rose-700 shadow-2xs disabled:opacity-50',
      ghost: 'text-slate-700 hover:bg-stone-100 hover:text-slate-900 disabled:opacity-50',
    };

    const sizeClasses = {
      default: 'h-10 px-4 py-2 text-sm',
      sm: 'h-8.5 px-3 text-xs',
      lg: 'h-11 px-6 text-sm sm:text-base',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-1 disabled:pointer-events-none whitespace-nowrap',
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';
