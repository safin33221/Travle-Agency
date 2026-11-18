'use client';

import Link from 'next/link';
import { Compass } from 'lucide-react';
import { useBrand } from '@/components/providers/BrandProvider';

export function Logo({
  href = '/',
  inverted = false,
}: {
  href?: string;
  inverted?: boolean;
}) {
  const brand = useBrand();

  return (
    <Link
      href={href}
      title={brand.agencyName}
      className="inline-flex items-center gap-2.5 font-bold text-base tracking-tight min-w-0 max-w-full"
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-teal-700 text-white shadow-2xs">
        <Compass className="h-4 w-4" strokeWidth={2.25} />
      </span>
      <span
        className={`truncate font-bold ${
          inverted ? 'text-white' : 'text-slate-900'
        }`}
      >
        {brand.logoPrimary}
        {brand.logoAccent && (
          <span className={inverted ? 'text-teal-300' : 'text-teal-700'}>
            {brand.logoAccent}
          </span>
        )}
      </span>
    </Link>
  );
}
