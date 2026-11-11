'use client';

import { useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface TablePaginationProps {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  pageSizeOptions?: number[];
}

export function TablePagination({
  page,
  limit,
  total,
  totalPages,
  pageSizeOptions = [10, 20, 50],
}: TablePaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const updateParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      params.set(key, value);
    });
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const startItem = total === 0 ? 0 : (page - 1) * limit + 1;
  const endItem = Math.min(total, page * limit);

  return (
    <div className="flex flex-col gap-3 border-t border-slate-200 pt-4 mt-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3 text-xs text-slate-600">
        <span>
          Showing <strong className="text-slate-900">{startItem}</strong> to{' '}
          <strong className="text-slate-900">{endItem}</strong> of{' '}
          <strong className="text-slate-900">{total}</strong> results
        </span>

        <div className="flex items-center gap-1.5">
          <span className="text-slate-400">|</span>
          <span>Rows:</span>
          <select
            value={String(limit)}
            disabled={isPending}
            onChange={(e) =>
              updateParams({ limit: e.target.value, page: '1' })
            }
            className="rounded border border-slate-300 bg-white px-2 py-1 text-xs text-slate-800"
          >
            {(pageSizeOptions || []).map((size) => (
              <option key={size} value={String(size)}>
                {size}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page <= 1 || isPending}
          onClick={() => updateParams({ page: String(page - 1) })}
        >
          ← Prev
        </Button>

        <span className="px-3 text-xs font-medium text-slate-700">
          Page {page} of {Math.max(1, totalPages)}
        </span>

        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page >= totalPages || isPending}
          onClick={() => updateParams({ page: String(page + 1) })}
        >
          Next →
        </Button>
      </div>
    </div>
  );
}
