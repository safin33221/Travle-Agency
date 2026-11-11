'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { DASHBOARD_NAV_ITEMS } from '@/lib/navItem.config';
import { StaffRole } from '@/types/api';
import { Logo } from '@/components/shared/Logo';
import { cn } from '@/lib/utils';

export function DashboardSidebar({ role }: { role: StaffRole }) {
  const pathname = usePathname();
  const visibleItems = DASHBOARD_NAV_ITEMS.filter((item) =>
    item.roles.includes(role),
  );

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r border-slate-200 bg-white">
      <div className="flex h-16 items-center px-6 border-b border-slate-200">
        <Logo href="/dashboard" />
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
          Operations Workspace
        </p>
        {visibleItems.map((item) => {
          const isActive =
            item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sky-50 text-sky-700 font-semibold'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
              )}
            >
              <span>{item.title}</span>
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-slate-200 bg-slate-50">
        <Link
          href="/"
          className="text-xs font-medium text-slate-600 hover:text-sky-600 block text-center"
        >
          ↗ View Public Website
        </Link>
      </div>
    </aside>
  );
}
