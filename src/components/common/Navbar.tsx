'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Phone, Search, X } from 'lucide-react';
import { Logo } from '@/components/shared/Logo';
import { Button } from '@/components/ui/button';
import { useBrand } from '@/components/providers/BrandProvider';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { label: 'Home', href: '/', exact: true },
  { label: 'Visa & Immigration', href: '/visa-services', exact: false },
  { label: 'Tour & Hajj Packages', href: '/packages', exact: false },
  { label: 'Free Eligibility Check', href: '/contact', exact: false },
];

export function Navbar() {
  const pathname = usePathname();
  const brand = useBrand();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isRouteActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-stone-200/80 bg-white/95 backdrop-blur-xs shadow-2xs">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="inline-flex md:hidden items-center justify-center rounded-xl border border-stone-200 p-2 text-slate-700 hover:bg-stone-100"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
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
                    'rounded-xl px-3 py-2 text-sm font-medium transition-colors',
                    active
                      ? 'bg-teal-50 text-teal-800 font-semibold'
                      : 'text-stone-600 hover:bg-stone-100 hover:text-slate-900',
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
            <Link
              href="/track-status"
              className={cn(
                'ml-1 inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold border transition-colors',
                pathname.startsWith('/track-status')
                  ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                  : 'bg-teal-50/80 text-teal-800 border-teal-200 hover:bg-teal-100',
              )}
            >
              <Search className="h-3.5 w-3.5" />
              Track My File
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/track-status"
              className="md:hidden inline-flex items-center gap-1 rounded-full bg-teal-50 border border-teal-200 px-3 py-1.5 text-xs font-semibold text-teal-800"
            >
              <Search className="h-3.5 w-3.5" />
              Track
            </Link>
            <Link href="/contact">
              <Button variant="secondary" size="sm">
                Apply / Get Quote
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
            <div className="flex h-16 items-center justify-between px-5 border-b border-stone-200">
              <Logo href="/" />
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg p-1.5 text-stone-500 hover:bg-stone-100"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
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
                      'block rounded-xl px-3.5 py-2.5 text-sm font-medium',
                      active
                        ? 'bg-teal-50 text-teal-800 font-semibold border border-teal-200'
                        : 'text-slate-700 hover:bg-stone-100',
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}

              <Link
                href="/track-status"
                onClick={() => setMobileOpen(false)}
                className="mt-2 flex items-center gap-2 rounded-xl border border-teal-200 bg-teal-50 px-3.5 py-2.5 text-sm font-semibold text-teal-900"
              >
                <Search className="h-4 w-4 text-teal-700" />
                Track My File Status
              </Link>
            </div>

            <div className="p-4 border-t border-stone-200 bg-[#FAF9F6] space-y-2 text-xs text-stone-600">
              <p className="font-semibold text-slate-800">Need Immediate Help?</p>
              <a
                href={`tel:${brand.phone.replace(/\s+/g, '')}`}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-white border border-stone-200 px-3 py-2 font-semibold text-slate-800 hover:bg-stone-50"
              >
                <Phone className="h-3.5 w-3.5 text-teal-700" />
                Call {brand.phone}
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
