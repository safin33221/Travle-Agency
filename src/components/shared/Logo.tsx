'use client';

import Link from 'next/link';
import { useBrand } from '@/components/providers/BrandProvider';

export function Logo({ href = '/' }: { href?: string }) {
  const brand = useBrand();

  return (
    <Link
      href={href}
      title={brand.agencyName}
      className="inline-flex items-center gap-2 font-bold text-base sm:text-lg tracking-tight min-w-0 max-w-full"
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-600 text-white text-xs font-extrabold">
        {brand.initials}
      </span>
      <span className="text-slate-900 truncate">
        {brand.logoPrimary}
        {brand.logoAccent && (
          <span className="text-sky-600">{brand.logoAccent}</span>
        )}
      </span>
    </Link>
  );
}
