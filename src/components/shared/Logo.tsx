import Link from 'next/link';
import { brandConfig } from '@/config/brand.config';

export function Logo({ href = '/' }: { href?: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-2 font-bold text-xl tracking-tight">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-600 text-white text-sm font-extrabold">
        {brandConfig.logo.primaryText.charAt(0)}
        {brandConfig.logo.accentText.charAt(0)}
      </span>
      <span className="text-slate-900">
        {brandConfig.logo.primaryText}
        <span className="text-sky-600">{brandConfig.logo.accentText}</span>
      </span>
    </Link>
  );
}
