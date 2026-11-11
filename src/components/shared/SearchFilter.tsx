'use client';

import { useEffect, useState, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';

interface SearchFilterProps {
  paramName?: string;
  placeholder?: string;
  debounceMs?: number;
  className?: string;
}

export function SearchFilter({
  paramName = 'search',
  placeholder = 'Search by name, phone, email, destination...',
  debounceMs = 350,
  className = '',
}: SearchFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentSearch = searchParams.get(paramName) ?? '';
  const [value, setValue] = useState(currentSearch);
  const [prevSearch, setPrevSearch] = useState(currentSearch);

  if (prevSearch !== currentSearch) {
    setPrevSearch(currentSearch);
    setValue(currentSearch);
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      if (value === currentSearch) return;

      const params = new URLSearchParams(searchParams.toString());
      if (value.trim()) {
        params.set(paramName, value.trim());
      } else {
        params.delete(paramName);
      }
      params.set('page', '1');

      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`);
      });
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [value, currentSearch, debounceMs, paramName, pathname, router, searchParams]);

  return (
    <div className={`relative flex-1 min-w-[240px] ${className}`}>
      <Input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="pr-8"
      />
      {isPending && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
          ...
        </span>
      )}
    </div>
  );
}
