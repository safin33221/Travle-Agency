'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, Plus, Search, X } from 'lucide-react';
import { StaffUser } from '@/types/api';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { LogoutBtn } from '@/components/shared/LogoutBtn';
import { DASHBOARD_NAV_ITEMS } from '@/lib/navItem.config';
import { NavIcon } from './DashboardSidebar';
import { Logo } from '@/components/shared/Logo';
import { cn } from '@/lib/utils';

export function DashboardNavbar({ user }: { user: StaffUser }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [quickQuery, setQuickQuery] = useState('');

  const visibleItems = DASHBOARD_NAV_ITEMS.filter((item) =>
    item.roles.includes(user.role),
  );

  const activeItem =
    visibleItems.find((i) => i.href === pathname) ||
    visibleItems
      .filter((i) => i.href !== '/dashboard' && pathname.startsWith(i.href))
      .sort((a, b) => b.href.length - a.href.length)[0] ||
    visibleItems[0];

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = quickQuery.trim();
    if (!q) return;
    router.push(`/dashboard/leads?search=${encodeURIComponent(q)}`);
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex h-15 items-center justify-between gap-4 border-b border-stone-200/80 bg-white/90 backdrop-blur px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="inline-flex md:hidden items-center justify-center rounded-xl border border-stone-200 p-2 text-slate-600 hover:bg-stone-100"
            aria-label="Open navigation menu"
          >
            <Menu className="h-4 w-4" />
          </button>

          <div className="min-w-0 flex items-center gap-1.5 text-xs text-stone-400">
            <Link href="/dashboard" className="hover:text-teal-700 font-medium">
              Workspace
            </Link>
            {activeItem && activeItem.href !== '/dashboard' && (
              <>
                <span>/</span>
                <Link
                  href={activeItem.href}
                  className="font-semibold text-slate-800 hover:text-teal-700 truncate"
                >
                  {activeItem.title}
                </Link>
              </>
            )}
          </div>
        </div>

        <form
          onSubmit={handleQuickSearch}
          className="hidden lg:flex items-center max-w-xs w-full"
        >
          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={quickQuery}
              onChange={(e) => setQuickQuery(e.target.value)}
              placeholder="Search name, phone, #code..."
              className="h-9 w-full rounded-xl border border-stone-200 bg-stone-50/80 pl-8 pr-12 text-xs text-slate-800 placeholder:text-stone-400 focus:border-teal-700 focus:bg-white focus:outline-none"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1 bottom-1 rounded-lg px-2 text-[11px] font-semibold text-teal-700 hover:bg-teal-50"
            >
              Find
            </button>
          </div>
        </form>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/my-profile"
            className="flex items-center gap-2 rounded-xl border border-stone-200/90 bg-stone-50/70 px-2.5 py-1.5 hover:bg-stone-100 transition whitespace-nowrap"
            title={`${user.name} (${user.email})`}
          >
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-700 text-[11px] font-bold text-white">
              {(user.name || 'S').charAt(0).toUpperCase()}
            </div>
            <span className="hidden sm:inline text-xs font-semibold text-slate-900 max-w-[110px] truncate">
              {user.name}
            </span>
            <StatusBadge status={user.role} />
          </Link>
          <div className="shrink-0">
            <LogoutBtn />
          </div>
        </div>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative z-10 flex w-72 max-w-[85vw] flex-col bg-slate-900 text-slate-200 shadow-xl">
            <div className="flex h-15 items-center justify-between px-5 border-b border-slate-800">
              <Logo href="/dashboard" inverted />
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-3 border-b border-slate-800">
              <Link
                href="/dashboard/leads/create"
                onClick={() => setMobileOpen(false)}
                className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-teal-700 px-3 py-2 text-xs font-semibold text-white"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>New Customer Inquiry</span>
              </Link>
            </div>

            <div className="no-scrollbar flex-1 overflow-y-auto p-3 space-y-1">
              {visibleItems.map((item) => {
                const isActive = item.exact
                  ? pathname === item.href
                  : pathname === item.href ||
                    pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium',
                      isActive
                        ? 'bg-teal-700/25 text-teal-200 font-semibold'
                        : 'text-slate-400 hover:bg-slate-800',
                    )}
                  >
                    <NavIcon name={item.icon} />
                    <span>{item.title}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
