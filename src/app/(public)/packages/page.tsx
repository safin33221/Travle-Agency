import { getPackages } from '@/services/packages/packages.service';
import { PackagePreviewCard } from '@/components/common/PackagePreviewCard';

export default async function PublicPackagesPage() {
  const packagesRes = await getPackages({ limit: 50, isArchived: false });

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Verified Tour Packages
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Browse our active domestic and international tour packages.
        </p>
      </div>

      {packagesRes.data.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {packagesRes.data.map((pkg) => (
            <PackagePreviewCard key={pkg.id} pkg={pkg} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <p className="text-sm text-slate-500">
            No active tour packages found at the moment.
          </p>
        </div>
      )}
    </div>
  );
}
