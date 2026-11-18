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
        className={`h-9.5 rounded-xl border px-3 py-1.5 text-xs sm:text-sm transition focus:border-teal-700 focus:outline-none ${
          currentValue
            ? 'border-teal-600 bg-teal-50/70 font-semibold text-teal-900'
            : 'border-stone-300 bg-white text-slate-700'
        }`}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default SelectFilter;
