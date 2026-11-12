'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/shared/Logo';
import { Button } from '@/components/ui/button';
import { brandConfig } from '@/config/brand.config';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { label: 'Home', href: '/', exact: true },
  { label: 'Visa & Immigration', href: '/visa-services', exact: false },
  { label: 'Tour & Hajj Packages', href: '/packages', exact: false },
  { label: 'Free Eligibility Check', href: '/contact', exact: false },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isRouteActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      {/* Subtle Top Help Bar */}
      <div className="bg-slate-900 text-slate-200 text-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-1.5 sm:px-6 lg:px-8">
          <p className="truncate">
            ✈️ Verified Tours, Hajj & Umrah, Student Visas & Work Permits •{' '}
            <span className="text-sky-300 font-medium">100% Transparent Process</span>
          </p>
          <div className="hidden sm:flex items-center gap-4 shrink-0">
            <a
              href={`tel:${brandConfig.contact.phone.replace(/\s+/g, '')}`}
              className="hover:text-white transition"
            >
              📞 Hotline: <strong className="text-white">{brandConfig.contact.phone}</strong>
            </a>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">{brandConfig.contact.officeHours}</span>
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-xs shadow-2xs">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="inline-flex md:hidden items-center justify-center rounded-lg border border-slate-200 p-2 text-slate-700 hover:bg-slate-100"
              aria-label="Open menu"
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
            <Logo href="/" />
          </div>

          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {NAV_LINKS.map((item) => {
              const active = isRouteActive(item.href, item.exact);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    active
                      ? 'bg-sky-50 text-sky-700 font-semibold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
            <Link
              href="/track-status"
              className={cn(
                'ml-1 rounded-full px-3.5 py-1.5 text-xs font-bold border transition-colors',
                pathname.startsWith('/track-status')
                  ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                  : 'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100',
              )}
            >
              🔍 Track My File
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/track-status"
              className="md:hidden rounded-full bg-sky-50 border border-sky-200 px-3 py-1.5 text-xs font-bold text-sky-700"
            >
              🔍 Track
            </Link>
            <Link href="/contact" className="hidden sm:inline-block">
              <Button variant="secondary" size="sm">
                Apply / Get Quote
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="sm">
                Staff Login
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative z-10 flex w-72 max-w-[85vw] flex-col bg-white shadow-xl">
            <div className="flex h-16 items-center justify-between px-5 border-b border-slate-200">
              <Logo href="/" />
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-1.5">
              {NAV_LINKS.map((item) => {
                const active = isRouteActive(item.href, item.exact);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'block rounded-lg px-3.5 py-2.5 text-sm font-medium',
                      active
                        ? 'bg-sky-50 text-sky-700 font-semibold border border-sky-200'
                        : 'text-slate-700 hover:bg-slate-100',
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}

              <Link
                href="/track-status"
                onClick={() => setMobileOpen(false)}
                className="mt-2 block rounded-lg border border-sky-200 bg-sky-50 px-3.5 py-2.5 text-sm font-bold text-sky-800"
              >
                🔍 Track My File Status
              </Link>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-2 text-xs text-slate-600">
              <p className="font-semibold text-slate-800">Need Immediate Help?</p>
              <a
                href={`tel:${brandConfig.contact.phone.replace(/\s+/g, '')}`}
                className="block rounded-lg bg-white border border-slate-200 px-3 py-2 text-center font-semibold text-slate-800"
              >
                📞 Call {brandConfig.contact.phone}
              </a>
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="block text-center text-slate-500 hover:text-sky-600 pt-1"
              >
                Staff Portal Login →
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
