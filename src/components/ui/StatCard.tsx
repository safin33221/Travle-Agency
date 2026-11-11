import * as React from 'react';
import { Card } from './card';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'warning' | 'neutral';
}

export function StatCard({ title, value, subtitle, trend = 'neutral' }: StatCardProps) {
  const accentColors = {
    up: 'border-l-4 border-l-emerald-500',
    warning: 'border-l-4 border-l-amber-500',
    neutral: 'border-l-4 border-l-sky-600',
  };

  return (
    <Card className={`p-5 ${accentColors[trend]}`}>
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        {title}
      </p>
      <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
      {subtitle && (
        <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
      )}
    </Card>
  );
}
