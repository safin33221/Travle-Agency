import { getPackages } from '@/services/packages/packages.service';
import { getMe } from '@/services/auth/getMe';
import { ManagementPageHeader } from '@/components/shared/ManagementPageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PackageArchiveBtn } from '@/components/module/packages/PackageArchiveBtn';
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
    <div>
      <ManagementPageHeader
        title="Verified Tour Package Catalog"
        description="Approved agency packages used by sales staff and the AI Response Copilot."
        actionLabel={isAdmin ? '+ Create Package' : undefined}
        actionHref={isAdmin ? '/dashboard/packages/create' : undefined}
      />

      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
                <tr>
                  <th className="py-3 px-4">Package Title</th>
                  <th className="py-3 px-4">Destination</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Base Price</th>
                  <th className="py-3 px-4">Inclusions</th>
                  {isAdmin && <th className="py-3 px-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {packages.map((pkg) => (
                  <tr key={pkg.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {pkg.title}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant="info">{pkg.destination}</Badge>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {pkg.durationDays} Days
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {formatCurrency(pkg.basePrice, pkg.currency)}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500">
                      {pkg.inclusions.slice(0, 3).join(', ') || '—'}
                    </td>
                    {isAdmin && (
                      <td className="py-3.5 px-4 text-right">
                        <PackageArchiveBtn id={pkg.id} />
                      </td>
                    )}
                  </tr>
                ))}
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
