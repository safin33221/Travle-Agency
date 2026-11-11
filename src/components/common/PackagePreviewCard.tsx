import Link from 'next/link';
import { TourPackage } from '@/types/api';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';

export function PackagePreviewCard({ pkg }: { pkg: TourPackage }) {
  return (
    <Card className="flex flex-col justify-between p-6 hover:border-sky-300 transition-all">
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <Badge variant="info">{pkg.destination}</Badge>
          <span className="text-xs font-medium text-slate-500">
            {pkg.durationDays} Days / {Math.max(1, pkg.durationDays - 1)} Nights
          </span>
        </div>
        <h3 className="text-lg font-bold text-slate-900">{pkg.title}</h3>
        <p className="mt-2 text-sm text-slate-600 line-clamp-3">
          {pkg.description}
        </p>

        {pkg.inclusions?.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-semibold uppercase text-slate-400 mb-1.5">
              Key Inclusions
            </p>
            <div className="flex flex-wrap gap-1.5">
              {pkg.inclusions.slice(0, 3).map((inc, idx) => (
                <span
                  key={idx}
                  className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-700"
                >
                  ✓ {inc}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
        <div>
          <span className="text-xs text-slate-400 block">Starting from</span>
          <span className="text-xl font-extrabold text-slate-900">
            {formatCurrency(pkg.basePrice, pkg.currency)}
          </span>
          <span className="text-xs text-slate-500"> / person</span>
        </div>
        <Link href={`/packages/${pkg.id}`}>
          <Button variant="secondary" size="sm">
            View Details
          </Button>
        </Link>
      </div>
    </Card>
  );
}
