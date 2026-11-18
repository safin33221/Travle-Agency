import * as React from 'react';
import Link from 'next/link';
import { Card } from './card';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'warning' | 'neutral';
  icon?: string;
  href?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  trend = 'neutral',
  icon,
  href,
}: StatCardProps) {
  const accentColors = {
    up: 'border-l-4 border-l-emerald-500',
    warning: 'border-l-4 border-l-amber-500',
    neutral: 'border-l-4 border-l-sky-600',
  };

  const iconBgColors = {
    up: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    neutral: 'bg-sky-50 text-sky-700 border-sky-200',
  };

  const content = (
    <Card
      className={`p-5 ${accentColors[trend]} ${
        href
          ? 'transition-all hover:border-sky-300 hover:shadow-md hover:-translate-y-0.5 cursor-pointer'
          : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
          {title}
        </p>
        {icon && (
          <span
            className={`flex h-7 w-7 items-center justify-center rounded-lg border text-sm ${iconBgColors[trend]}`}
          >
            {icon}
          </span>
        )}
      </div>
      <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
        {value}
      </p>
      {subtitle && (
        <div className="mt-1.5 flex items-center justify-between gap-2">
          <p className="text-xs font-medium text-slate-600">{subtitle}</p>
          {href && (
            <span className="text-[11px] font-semibold text-sky-600 shrink-0">
              View →
            </span>
          )}
        </div>
      )}
    </Card>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
