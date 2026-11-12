import Link from 'next/link';
import { getPackages } from '@/services/packages/packages.service';
import { getMe } from '@/services/auth/getMe';
import { ManagementPageHeader } from '@/components/shared/ManagementPageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PackageArchiveBtn } from '@/components/module/packages/PackageArchiveBtn';
import { SECTOR_CATALOG } from '@/config/brand.config';
import { formatCurrency } from '@/lib/utils';

export const instant = false;

export default async function DashboardPackagesPage() {
  const [packagesRes, user] = await Promise.all([
    getPackages({ limit: 50, isArchived: false }),
    getMe(),
  ]);

  const isAdmin = user?.role === 'OWNER_ADMIN';
  const packages = packagesRes?.data || [];

  return (
    <div className="space-y-5">
      <ManagementPageHeader
        title="Verified Tour & Service Package Catalog"
        description="Approved agency packages used by sales staff for quotations and by the AI Response Copilot."
        actionLabel={isAdmin ? '+ Create New Package' : undefined}
        actionHref={isAdmin ? '/dashboard/packages/create' : undefined}
      >
        <Link href="/packages" target="_blank">
          <Button variant="outline" size="sm">
            View Public Catalog ↗
          </Button>
        </Link>
      </ManagementPageHeader>

      <Card>
        <CardContent className="pt-6">
          <div className="mb-4 flex items-center justify-between text-xs text-slate-500">
            <span>
              Active Approved Packages: <strong className="text-slate-900">{packages.length}</strong>
            </span>
            <span>Synced with Public Website & AI Copilot Grounding</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50/70 text-xs uppercase text-slate-500">
                <tr>
                  <th className="py-3 px-4">Package Title & Sector</th>
                  <th className="py-3 px-4">Destination</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Base Price</th>
                  <th className="py-3 px-4">Key Inclusions</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {packages.map((pkg) => {
                  const cat = pkg.category ?? 'TOUR';
                  const sectorMeta = SECTOR_CATALOG[cat] ?? SECTOR_CATALOG.TOUR;
                  return (
                    <tr key={pkg.id} className="hover:bg-slate-50">
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
                      <td className="py-3.5 px-4 text-slate-600 text-xs font-medium">
                        {pkg.durationDays} Days
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {formatCurrency(pkg.basePrice, pkg.currency)}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-500 max-w-xs">
                        {(pkg.inclusions || []).slice(0, 3).join(', ') || '—'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/packages/${pkg.id}`}
                            target="_blank"
                            className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-sky-700 hover:bg-sky-50"
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
                      className="py-10 text-center text-sm text-slate-500"
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
