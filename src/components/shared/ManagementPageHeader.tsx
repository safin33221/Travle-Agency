import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface ManagementPageHeaderProps {
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  children?: React.ReactNode;
}

export function ManagementPageHeader({
  title,
  description,
  actionLabel,
  actionHref,
  children,
}: ManagementPageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5 mb-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        )}
      </div>
      <div className="flex items-center gap-3">
        {children}
        {actionLabel && actionHref && (
          <Link href={actionHref}>
            <Button variant="secondary">{actionLabel}</Button>
          </Link>
        )}
      </div>
    </div>
  );
}
