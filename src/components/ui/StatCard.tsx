import * as React from 'react';
import Link from 'next/link';
import {
  ArrowUpRight,
  Clock,
  FileCheck2,
  Users,
  Wallet,
} from 'lucide-react';
import { Card } from './card';

export type StatIconName = 'leads' | 'quotes' | 'revenue' | 'followups';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'warning' | 'neutral';
  iconName?: StatIconName;
  href?: string;
}

function renderIcon(name?: StatIconName) {
  const cls = 'h-4 w-4';
  switch (name) {
    case 'leads':
      return <Users className={cls} strokeWidth={1.8} />;
    case 'quotes':
      return <FileCheck2 className={cls} strokeWidth={1.8} />;
    case 'revenue':
      return <Wallet className={cls} strokeWidth={1.8} />;
    case 'followups':
      return <Clock className={cls} strokeWidth={1.8} />;
    default:
      return null;
  }
}

export function StatCard({
  title,
  value,
  subtitle,
  trend = 'neutral',
  iconName,
  href,
}: StatCardProps) {
  const iconStyles = {
    up: 'bg-teal-50 text-teal-700 border-teal-200/70',
    warning: 'bg-amber-50 text-amber-700 border-amber-200/70',
    neutral: 'bg-stone-100 text-slate-700 border-stone-200',
  };

  const content = (
    <Card
      className={`p-5 ${
        href
          ? 'group transition-all hover:border-teal-600/40 hover:shadow-sm cursor-pointer'
          : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium text-stone-500">{title}</p>
        {iconName && (
          <span
            className={`flex h-8 w-8 items-center justify-center rounded-xl border ${iconStyles[trend]}`}
          >
            {renderIcon(iconName)}
          </span>
        )}
      </div>
      <p className="mt-2.5 text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight tabular-nums">
        {value}
      </p>
      {subtitle && (
        <div className="mt-2 flex items-center justify-between gap-2">
          <p className="text-xs text-stone-500 truncate">{subtitle}</p>
          {href && (
            <ArrowUpRight className="h-3.5 w-3.5 text-stone-400 group-hover:text-teal-700 shrink-0 transition" />
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
