import Link from 'next/link';
import { TourPackage } from '@/types/api';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { SECTOR_CATALOG } from '@/config/brand.config';

export function PackagePreviewCard({ pkg }: { pkg: TourPackage }) {
  const category = pkg.category ?? 'TOUR';
  const sectorMeta = SECTOR_CATALOG[category] ?? SECTOR_CATALOG.TOUR;
  const specs = (pkg.structuredSpecs ?? {}) as Record<string, unknown>;

  return (
    <Card className="flex flex-col justify-between p-6 hover:border-sky-400 hover:shadow-md transition-all">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <span
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${sectorMeta.badgeColor}`}
          >
            {sectorMeta.shortLabel}
          </span>
          <div className="flex items-center gap-1.5">
            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
              ⏱ {pkg.durationDays} Days
            </span>
            <Badge variant="info">📍 {pkg.destination}</Badge>
          </div>
        </div>

        <h3 className="text-lg font-bold text-slate-900">{pkg.title}</h3>
        <p className="mt-2 text-sm text-slate-600 line-clamp-3">
          {pkg.description}
        </p>

        {/* Sector-Specific Highlights */}
        {category === 'HAJJ_UMRAH' && Boolean(specs.makkahHotel) && (
          <div className="mt-3 rounded-lg bg-emerald-50/70 p-2.5 text-xs text-emerald-900 border border-emerald-200/70 space-y-1">
            <p>
              <strong>Makkah Hotel:</strong> {String(specs.makkahHotel)}
            </p>
            {Boolean(specs.packageSubType) && (
              <p>
                <strong>Type:</strong> {String(specs.packageSubType)} •{' '}
                {specs.qurbaniIncluded ? 'Qurbani Included' : 'Qurbani Optional'}
              </p>
            )}
          </div>
        )}

        {category === 'WORK_PERMIT' && Boolean(specs.monthlySalaryRange) && (
          <div className="mt-3 rounded-lg bg-amber-50/70 p-2.5 text-xs text-amber-900 border border-amber-200/70 space-y-1">
            <p>
              <strong>Salary:</strong> {String(specs.monthlySalaryRange)}
            </p>
            {Boolean(specs.jobRole) && (
              <p>
                <strong>Role:</strong> {String(specs.jobRole)} •{' '}
                {specs.processingTimeDays
                  ? `~${String(specs.processingTimeDays)} Days Processing`
                  : ''}
              </p>
            )}
          </div>
        )}

        {category === 'STUDENT_VISA' && Boolean(specs.minIeltsRequired) && (
          <div className="mt-3 rounded-lg bg-purple-50/70 p-2.5 text-xs text-purple-900 border border-purple-200/70 space-y-1">
            <p>
              <strong>Requirement:</strong> {String(specs.minIeltsRequired)}
            </p>
            {Boolean(specs.intakeMonths) && (
              <p>
                <strong>Intakes:</strong> {String(specs.intakeMonths)} • Max Gap:{' '}
                {String(specs.maxStudyGapYears ?? 4)} Yrs
              </p>
            )}
          </div>
        )}

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
          <span className="text-xs text-slate-400 block">
            {category === 'STUDENT_VISA'
              ? 'Service / File Fee'
              : 'Starting Package Price'}
          </span>
          <span className="text-xl font-extrabold text-slate-900">
            {formatCurrency(pkg.basePrice, pkg.currency)}
          </span>
        </div>
        <Link href={`/packages/${pkg.id}`}>
          <Button variant="secondary" size="sm">
            Details & Checklist
          </Button>
        </Link>
      </div>
    </Card>
  );
}
