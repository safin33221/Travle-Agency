'use client';

import { useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export interface SelectFilterOption {
  label: string;
  value: string;
}

interface SelectFilterProps {
  paramName: string;
  label?: string;
  placeholder?: string;
  options: SelectFilterOption[];
  className?: string;
}

export function SelectFilter({
  paramName,
  label,
  placeholder = 'All',
  options,
  className = '',
}: SelectFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentValue = searchParams.get(paramName) ?? '';

  const handleChange = (newValue: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newValue) {
      params.set(paramName, newValue);
    } else {
      params.delete(paramName);
    }
    params.set('page', '1');

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {label && (
        <span className="text-xs font-medium text-slate-500 whitespace-nowrap">
          {label}
        </span>
      )}
      <select
        value={currentValue}
        disabled={isPending}
        onChange={(e) => handleChange(e.target.value)}
        className="h-10 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-blue-600 focus:outline-none"
      >
        <option value="">{placeholder}</option>
        {(options || []).map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
