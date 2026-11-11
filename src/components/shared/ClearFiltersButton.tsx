'use client';

import { useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface ClearFiltersButtonProps {
  preserveParams?: string[];
  label?: string;
}

export function ClearFiltersButton({
  preserveParams = ['limit'],
  label = 'Reset Filters',
}: ClearFiltersButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const hasActiveFilters = Array.from(searchParams.keys()).some(
    (key) => key !== 'page' && !preserveParams.includes(key),
  );

  if (!hasActiveFilters) return null;

  const handleClear = () => {
    const nextParams = new URLSearchParams();
    for (const key of preserveParams) {
      const val = searchParams.get(key);
      if (val) nextParams.set(key, val);
    }

    startTransition(() => {
      const qs = nextParams.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname);
    });
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={isPending}
      onClick={handleClear}
      className="h-10 px-3 text-xs text-slate-600"
    >
      {label}
    </Button>
  );
}
