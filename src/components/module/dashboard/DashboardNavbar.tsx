'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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

  // Determine active nav item for breadcrumb context
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
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-slate-200 bg-white/95 backdrop-blur px-4 sm:px-6 lg:px-8">
        {/* Left: Mobile Menu Button + Breadcrumb Context */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="inline-flex md:hidden items-center justify-center rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-100"
            aria-label="Open navigation menu"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Link href="/dashboard" className="hover:text-sky-600 font-medium">
                Workspace
              </Link>
              {activeItem && activeItem.href !== '/dashboard' && (
                <>
                  <span>/</span>
                  <Link
                    href={activeItem.href}
                    className="font-semibold text-slate-700 hover:text-sky-600 truncate"
                  >
                    {activeItem.title}
                  </Link>
                </>
              )}
            </div>
            <p className="text-xs font-semibold text-slate-800 truncate hidden sm:block">
              {activeItem?.description || 'Agency Operations & Customer Pipeline'}
            </p>
          </div>
        </div>

        {/* Center: Global Quick Lead / Tracking Code Lookup */}
        <form
          onSubmit={handleQuickSearch}
          className="hidden lg:flex items-center max-w-xs w-full"
        >
          <div className="relative w-full">
            <input
              type="text"
              value={quickQuery}
              onChange={(e) => setQuickQuery(e.target.value)}
              placeholder="Quick search name, phone, #SV-..."
              className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-3 pr-16 text-xs text-slate-800 placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:outline-none"
            />
            <button
              type="submit"
              className="absolute right-1 top-1 bottom-1 rounded-md bg-white px-2 text-[11px] font-semibold text-sky-700 border border-slate-200 hover:bg-sky-50"
            >
              Find
            </button>
          </div>
        </form>

        {/* Right: User Identity & Quick Actions */}
        <div className="flex items-center gap-2.5">
          <Link
            href="/my-profile"
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/70 px-2.5 py-1.5 hover:bg-slate-100 transition"
            title="View Staff Profile"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-600 text-[11px] font-bold text-white">
              {(user.name || 'S').charAt(0).toUpperCase()}
            </div>
            <div className="hidden sm:block text-left leading-tight">
              <p className="text-xs font-semibold text-slate-900 truncate max-w-[120px]">
                {user.name}
              </p>
              <p className="text-[10px] text-slate-500 truncate max-w-[120px]">
                {user.email}
              </p>
            </div>
            <StatusBadge status={user.role} />
          </Link>
          <LogoutBtn />
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative z-10 flex w-72 max-w-[85vw] flex-col bg-white shadow-xl">
            <div className="flex h-16 items-center justify-between px-5 border-b border-slate-200">
              <Logo href="/dashboard" />
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="p-3 border-b border-slate-100">
              <Link
                href="/dashboard/leads/create"
                onClick={() => setMobileOpen(false)}
                className="flex w-full items-center justify-center rounded-lg bg-sky-600 px-3 py-2 text-xs font-semibold text-white"
              >
                + Record New Inquiry
              </Link>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-1">
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
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium',
                      isActive
                        ? 'bg-sky-50 text-sky-700 font-semibold border border-sky-200'
                        : 'text-slate-600 hover:bg-slate-100',
                    )}
                  >
                    <NavIcon name={item.icon} />
                    <span>{item.title}</span>
                  </Link>
                );
              })}
            </div>

            <div className="p-3 border-t border-slate-200 bg-slate-50 space-y-1.5">
              <Link
                href="/track-status"
                target="_blank"
                onClick={() => setMobileOpen(false)}
                className="block rounded-lg border border-slate-200 bg-white px-3 py-2 text-center text-xs font-medium text-slate-700"
              >
                🔍 Public File Tracker ↗
              </Link>
              <Link
                href="/"
                target="_blank"
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-1.5 text-center text-xs font-medium text-slate-500"
              >
                🌐 Public Website ↗
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
