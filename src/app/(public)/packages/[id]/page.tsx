import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSinglePackage } from '@/services/packages/packages.service';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { brandConfig } from '@/config/brand.config';

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

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        href="/packages"
        className="text-sm font-medium text-sky-600 hover:underline"
      >
        ← Back to All Packages
      </Link>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Badge variant="info">{pkg.destination}</Badge>
              <span className="text-sm text-slate-500">
                {pkg.durationDays} Days / {Math.max(1, pkg.durationDays - 1)} Nights
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900">
              {pkg.title}
            </h1>
          </div>

          <Card className="p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-3">
              Itinerary & Package Overview
            </h2>
            <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
              {pkg.description}
            </p>
          </Card>

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
          <Card className="p-6 sticky top-24 space-y-4">
            <p className="text-xs font-semibold uppercase text-slate-400">
              Indicative Starting Price
            </p>
            <p className="text-3xl font-extrabold text-slate-900">
              {formatCurrency(pkg.basePrice, pkg.currency)}
              <span className="text-sm font-normal text-slate-500">
                {' '}
                / person
              </span>
            </p>
            <p className="text-xs text-slate-500">
              Final quotation depends on travel dates, traveler count, and room preferences.
            </p>
            <Link href="/contact" className="block">
              <Button variant="secondary" className="w-full">
                Request Official Quotation
              </Button>
            </Link>
            <div className="pt-4 border-t border-slate-100 text-xs text-slate-500 space-y-1">
              <p>Direct Helpline: {brandConfig.contact.phone}</p>
              <p>Email: {brandConfig.contact.email}</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
