import Link from 'next/link';
import { getPackages } from '@/services/packages/packages.service';
import { getMe } from '@/services/auth/getMe';
import { ManagementPageHeader } from '@/components/shared/ManagementPageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PackageArchiveBtn } from '@/components/module/packages/PackageArchiveBtn';
import { isPackageCategory, SECTOR_CATALOG } from '@/config/brand.config';
import { ServiceCategory } from '@/types/api';
import { formatCurrency } from '@/lib/utils';

export const instant = false;

export default async function DashboardPackagesPage({
  searchParams,
}: {
  searchParams?: Promise<{ category?: string }>;
}) {
  const resolved = (await searchParams) ?? {};
  const activeCategory =
    resolved.category === 'TOUR' || resolved.category === 'HAJJ_UMRAH'
      ? (resolved.category as ServiceCategory)
      : undefined;

  const [packagesRes, user] = await Promise.all([
    getPackages({
      limit: 50,
      isArchived: false,
      category: activeCategory,
    }),
    getMe(),
  ]);

  const isAdmin = user?.role === 'OWNER_ADMIN';
  const packages = (packagesRes?.data || []).filter((pkg) =>
    isPackageCategory(pkg.category),
  );

  return (
    <div className="space-y-5">
      <ManagementPageHeader
        title="Tour & Hajj Package Catalog"
        actionLabel={isAdmin ? '+ Create New Package' : undefined}
        actionHref={isAdmin ? '/dashboard/packages/create' : undefined}
      >
        <Link href="/dashboard/visa-immigration/services">
          <Button variant="outline" size="sm">
            Visa & Permit Services →
          </Button>
        </Link>
        <Link href="/packages" target="_blank">
          <Button variant="outline" size="sm">
            View Public Catalog ↗
          </Button>
        </Link>
      </ManagementPageHeader>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/dashboard/packages"
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
              !activeCategory
                ? 'bg-slate-900 text-white'
                : 'border border-stone-200 bg-white text-stone-600 hover:bg-stone-100'
            }`}
          >
            All Tour & Hajj
          </Link>
          <Link
            href="/dashboard/packages?category=TOUR"
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
              activeCategory === 'TOUR'
                ? 'bg-teal-700 text-white'
                : 'border border-stone-200 bg-white text-stone-600 hover:bg-stone-100'
            }`}
          >
            Holiday Tours
          </Link>
          <Link
            href="/dashboard/packages?category=HAJJ_UMRAH"
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
              activeCategory === 'HAJJ_UMRAH'
                ? 'bg-teal-700 text-white'
                : 'border border-stone-200 bg-white text-stone-600 hover:bg-stone-100'
            }`}
          >
            Hajj & Umrah
          </Link>
        </div>

        <span className="text-xs text-stone-500">
          Showing <strong>{packages.length}</strong> active package
          {packages.length === 1 ? '' : 's'}
        </span>
      </div>

      <Card>
        <CardContent className="pt-6">

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-stone-200 bg-[#FAF9F6] text-[11px] font-bold uppercase tracking-wider text-stone-500">
                <tr>
                  <th className="py-3 px-4">Package Title & Sector</th>
                  <th className="py-3 px-4">Destination</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Base Price</th>
                  <th className="py-3 px-4">Key Inclusions</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {packages.map((pkg) => {
                  const cat = pkg.category ?? 'TOUR';
                  const sectorMeta = SECTOR_CATALOG[cat] ?? SECTOR_CATALOG.TOUR;
                  return (
                    <tr key={pkg.id} className="hover:bg-[#FAF9F6]/70">
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-slate-900">
                          {pkg.title}
                        </p>
                        <span
                          className={`mt-1 inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${sectorMeta.badgeColor}`}
                        >
                          {sectorMeta.shortLabel}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant="info">{pkg.destination}</Badge>
                      </td>
                      <td className="py-3.5 px-4 text-stone-600 text-xs font-medium">
                        {pkg.durationDays} Days
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 tabular-nums">
                        {formatCurrency(pkg.basePrice, pkg.currency)}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-stone-500 max-w-xs">
                        {(pkg.inclusions || []).slice(0, 3).join(', ') || '—'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/packages/${pkg.id}`}
                            target="_blank"
                            className="rounded-xl border border-stone-300 bg-white px-2.5 py-1 text-xs font-semibold text-teal-800 hover:bg-teal-50 transition"
                          >
                            Preview ↗
                          </Link>
                          {isAdmin && <PackageArchiveBtn id={pkg.id} />}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {packages.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-10 text-center text-sm text-stone-500"
                    >
                      No active tour packages in catalog yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
