'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Activity,
  Compass,
  ExternalLink,
  FileCheck2,
  Globe,
  Inbox,
  LayoutDashboard,
  MapPin,
  Plus,
  SearchCheck,
  Settings,
  ShieldCheck,
  UserCheck,
  Users,
} from 'lucide-react';
import { DASHBOARD_NAV_ITEMS } from '@/lib/navItem.config';
import { StaffRole } from '@/types/api';
import { Logo } from '@/components/shared/Logo';
import { cn } from '@/lib/utils';

export function NavIcon({ name, className }: { name: string; className?: string }) {
  const cls = cn('h-4 w-4 shrink-0', className);
  switch (name) {
    case 'LayoutDashboard':
      return <LayoutDashboard className={cls} strokeWidth={1.8} />;
    case 'Users':
      return <Users className={cls} strokeWidth={1.8} />;
    case 'Compass':
      return <Compass className={cls} strokeWidth={1.8} />;
    case 'Globe':
      return <Globe className={cls} strokeWidth={1.8} />;
    case 'MapPin':
      return <MapPin className={cls} strokeWidth={1.8} />;
    case 'FileCheck2':
      return <FileCheck2 className={cls} strokeWidth={1.8} />;
    case 'Inbox':
      return <Inbox className={cls} strokeWidth={1.8} />;
    case 'ShieldCheck':
      return <ShieldCheck className={cls} strokeWidth={1.8} />;
    case 'Settings':
      return <Settings className={cls} strokeWidth={1.8} />;
    case 'Activity':
      return <Activity className={cls} strokeWidth={1.8} />;
    default:
      return <UserCheck className={cls} strokeWidth={1.8} />;
  }
}

export function DashboardSidebar({ role }: { role: StaffRole }) {
  const pathname = usePathname();
  const visibleItems = DASHBOARD_NAV_ITEMS.filter((item) =>
    item.roles.includes(role),
  );

  const groups = Array.from(
    new Set(visibleItems.map((i) => i.group || 'General')),
  );

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-slate-900 text-slate-300 z-20">
      <div className="flex h-15 items-center justify-between gap-2 px-5 border-b border-slate-800">
        <Logo href="/dashboard" inverted />
      </div>

      <div className="px-3.5 pt-4 pb-2">
        <Link
          href="/dashboard/leads/create"
          className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-teal-700 px-3 py-2.5 text-xs font-semibold text-white shadow-2xs transition hover:bg-teal-600"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New Customer Inquiry</span>
        </Link>
      </div>

      <div className="no-scrollbar flex-1 overflow-y-auto px-3 py-2.5 space-y-3.5">
        {groups.map((groupName) => {
          const groupItems = visibleItems.filter(
            (i) => (i.group || 'General') === groupName,
          );
          return (
            <div key={groupName} className="space-y-0.5">
              <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                {groupName}
              </p>
              {groupItems.map((item) => {
                const isActive = item.exact
                  ? pathname === item.href
                  : pathname === item.href ||
                    pathname.startsWith(`${item.href}/`);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={item.description}
                    className={cn(
                      'group flex items-center gap-3 rounded-xl px-3 py-1.5 text-xs font-medium transition-colors',
                      isActive
                        ? 'bg-teal-700/25 text-teal-200 font-semibold'
                        : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-100',
                    )}
                  >
                    <NavIcon
                      name={item.icon}
                      className={cn(
                        isActive
                          ? 'text-teal-300'
                          : 'text-slate-500 group-hover:text-slate-300',
                      )}
                    />
                    <span className="truncate">{item.title}</span>
                  </Link>
                );
              })}
            </div>
          );
        })}
      </div>

      <div className="p-3 border-t border-slate-800 space-y-1">
        <Link
          href="/track-status"
          target="_blank"
          className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-slate-400 hover:bg-slate-800/80 hover:text-white transition"
        >
          <span className="flex items-center gap-2">
            <SearchCheck className="h-3.5 w-3.5 text-teal-400" />
            Public File Tracker
          </span>
          <ExternalLink className="h-3 w-3 text-slate-500" />
        </Link>
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-slate-400 hover:bg-slate-800/80 hover:text-white transition"
        >
          <span className="flex items-center gap-2">
            <Globe className="h-3.5 w-3.5 text-slate-500" />
            Public Website
          </span>
          <ExternalLink className="h-3 w-3 text-slate-500" />
        </Link>
      </div>
    </aside>
  );
}
