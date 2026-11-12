'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const VISA_TABS = [
  {
    label: '🌍 Hub Overview',
    href: '/dashboard/visa-immigration',
    exact: true,
  },
  {
    label: '🏳️ Destination Countries',
    href: '/dashboard/visa-immigration/countries',
    exact: false,
  },
  {
    label: '📋 Visa Services & Rules',
    href: '/dashboard/visa-immigration/services',
    exact: false,
  },
  {
    label: '📥 Web Visa Inquiries',
    href: '/dashboard/visa-immigration/inquiries',
    exact: false,
  },
];

export function VisaSubNav() {
  const pathname = usePathname();

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-2.5 shadow-xs">
      <div className="flex flex-wrap items-center gap-1.5">
        {VISA_TABS.map((tab) => {
          const isActive = tab.exact
            ? pathname === tab.href
            : pathname === tab.href || pathname.startsWith(`${tab.href}/`);

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'rounded-lg px-3 py-1.5 text-xs font-semibold transition',
                isActive
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Link
          href="/dashboard/visa-immigration/countries/create"
          className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
        >
          + Country
        </Link>
        <Link
          href="/dashboard/visa-immigration/services/create"
          className="rounded-lg border border-sky-200 bg-sky-50 px-2.5 py-1.5 text-xs font-semibold text-sky-700 hover:bg-sky-100"
        >
          + Visa Service
        </Link>
        <Link
          href="/visa-services"
          target="_blank"
          className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-500 hover:text-sky-600"
        >
          Public Portal ↗
        </Link>
      </div>
    </div>
  );
}

