import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSinglePackage } from '@/services/packages/packages.service';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { brandConfig, SECTOR_CATALOG } from '@/config/brand.config';


export const instant = false;

export default async function PublicPackageDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const pkg = await getSinglePackage(id);

  if (!pkg) {
    notFound();
  }

  const category = pkg.category ?? 'TOUR';
  const sectorMeta = SECTOR_CATALOG[category] ?? SECTOR_CATALOG.TOUR;
  const specs = (pkg.structuredSpecs ?? {}) as Record<string, unknown>;
  const specEntries = Object.entries(specs).filter(
    ([, val]) => val !== undefined && val !== null && val !== '',
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        href={`/packages?category=${category}`}
        className="text-sm font-medium text-sky-600 hover:underline"
      >
        ← Back to {sectorMeta.label}
      </Link>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <span
                className={`inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold ${sectorMeta.badgeColor}`}
              >
                {sectorMeta.label}
              </span>
              <Badge variant="info">{pkg.destination}</Badge>
              <span className="text-sm text-slate-500">
                {pkg.durationDays} Days
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900">
              {pkg.title}
            </h1>
          </div>

          <Card className="p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-3">
              Program & Package Overview
            </h2>
            <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
              {pkg.description}
            </p>
          </Card>

          {/* Sector-Specific Structured Specifications */}
          {specEntries.length > 0 && (
            <Card className="p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4">
                Verified {sectorMeta.shortLabel} Specifications
              </h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {specEntries.map(([key, val]) => (
                  <div
                    key={key}
                    className="rounded-lg border border-slate-200 bg-slate-50 p-3"
                  >
                    <p className="text-xs font-medium uppercase text-slate-400">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {typeof val === 'boolean' ? (val ? 'Yes' : 'No') : String(val)}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Required Document Checklist */}
          {pkg.requiredDocuments && pkg.requiredDocuments.length > 0 && (
            <Card className="p-6 border-sky-200 bg-sky-50/40">
              <h2 className="text-lg font-bold text-slate-900 mb-2">
                📋 Required Documents Checklist
              </h2>
              <p className="text-xs text-slate-600 mb-4">
                Please prepare the following documents for smooth file opening and visa/application processing:
              </p>
              <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 text-sm text-slate-800">
                {pkg.requiredDocuments.map((doc, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 rounded-md bg-white p-2.5 border border-slate-200/80"
                  >
                    <span className="text-sky-600 font-bold">✓</span>
                    <span>{doc}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <Card className="p-5">
              <h3 className="text-sm font-bold uppercase text-emerald-700 mb-3">
                ✓ What Is Included
              </h3>
              <ul className="space-y-2 text-sm text-slate-700">
                {pkg.inclusions.map((inc, i) => (
                  <li key={i}>• {inc}</li>
                ))}
              </ul>
            </Card>
            <Card className="p-5">
              <h3 className="text-sm font-bold uppercase text-rose-700 mb-3">
                ✕ What Is Excluded
              </h3>
              <ul className="space-y-2 text-sm text-slate-700">
                {pkg.exclusions.map((exc, i) => (
                  <li key={i}>• {exc}</li>
                ))}
              </ul>
            </Card>
          </div>
        </div>

        <div>
          <Card className="p-6 sticky top-24 space-y-5 border-sky-200 shadow-sm">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-400">
                {category === 'STUDENT_VISA'
                  ? 'Processing & File Charge'
                  : 'Starting Package Price'}
              </p>
              <p className="mt-1 text-3xl font-extrabold text-slate-900">
                {formatCurrency(pkg.basePrice, pkg.currency)}
              </p>
              <p className="mt-1.5 text-xs text-slate-500">
                Transparent pricing with clear inclusions & zero hidden fees.
              </p>
            </div>

            <div className="space-y-2.5">
              <Link
                href={`/contact?category=${category}&destination=${encodeURIComponent(pkg.destination)}`}
                className="block"
              >
                <Button variant="secondary" className="w-full">
                  ✓ Check Eligibility & Apply →
                </Button>
              </Link>
              <a
                href={`tel:${brandConfig.contact.phone.replace(/\s+/g, '')}`}
                className="block w-full rounded-lg border border-slate-200 bg-slate-50 py-2 text-center text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                📞 Call Desk: {brandConfig.contact.phone}
              </a>
            </div>

            <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3.5 space-y-2 text-xs text-slate-600">
              <p className="font-bold text-slate-900">How Booking Works:</p>
              <p>1. Submit your inquiry above to get an instant Tracking ID.</p>
              <p>2. Our counselor verifies your documents & sends an official PDF quote.</p>
              <p>3. Track your file status anytime on <code className="font-mono text-sky-700">/track-status</code>.</p>
            </div>

            <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 space-y-1">
              <p>Office: {brandConfig.contact.officeHours}</p>
              <p>Email: {brandConfig.contact.email}</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
