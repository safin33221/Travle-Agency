'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ExternalLink, FileCheck2, Globe, Inbox, MapPin, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

const VISA_TABS = [
  {
    label: 'Overview',
    href: '/dashboard/visa-immigration',
    exact: true,
    icon: Globe,
  },
  {
    label: 'Countries',
    href: '/dashboard/visa-immigration/countries',
    exact: false,
    icon: MapPin,
  },
  {
    label: 'Services & Rules',
    href: '/dashboard/visa-immigration/services',
    exact: false,
    icon: FileCheck2,
  },
  {
    label: 'Web Inquiries',
    href: '/dashboard/visa-immigration/inquiries',
    exact: false,
    icon: Inbox,
  },
];

export function VisaSubNav() {
  const pathname = usePathname();

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-stone-200/90 bg-white p-2.5 shadow-2xs">
      <div className="flex flex-wrap items-center gap-1">
        {VISA_TABS.map((tab) => {
          const isActive = tab.exact
            ? pathname === tab.href
            : pathname === tab.href || pathname.startsWith(`${tab.href}/`);
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition',
                isActive
                  ? 'bg-teal-700 text-white font-semibold shadow-2xs'
                  : 'text-stone-600 hover:bg-stone-100 hover:text-slate-900',
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Link
          href="/dashboard/visa-immigration/countries/create"
          className="inline-flex items-center gap-1 rounded-xl border border-stone-200 bg-stone-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-stone-100"
        >
          <Plus className="h-3 w-3" />
          Country
        </Link>
        <Link
          href="/dashboard/visa-immigration/services/create"
          className="inline-flex items-center gap-1 rounded-xl border border-teal-200 bg-teal-50 px-2.5 py-1.5 text-xs font-semibold text-teal-800 hover:bg-teal-100"
        >
          <Plus className="h-3 w-3" />
          Visa Service
        </Link>
        <Link
          href="/visa-services"
          target="_blank"
          className="inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-medium text-stone-500 hover:text-teal-700"
        >
          <span>Public Portal</span>
          <ExternalLink className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}

