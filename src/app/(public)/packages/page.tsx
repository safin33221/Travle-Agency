import Link from 'next/link';
import { getPackages } from '@/services/packages/packages.service';
import { PackagePreviewCard } from '@/components/common/PackagePreviewCard';
import { brandConfig, SECTOR_CATALOG } from '@/config/brand.config';
import { ServiceCategory } from '@/types/api';
import { SearchFilter } from '@/components/shared/SearchFilter';

export const instant = false;

interface PublicPackagesPageProps {
  searchParams?: Promise<{
    category?: ServiceCategory;
    search?: string;
  }>;
}

export default async function PublicPackagesPage({
  searchParams,
}: PublicPackagesPageProps) {
  const resolved = (await searchParams) ?? {};
  const activeCategory = resolved.category;

  const packagesRes = await getPackages({
    limit: 50,
    isArchived: false,
    category: activeCategory,
    search: resolved.search,
  });
  const packages = packagesRes?.data || [];

  const enabledSectors = brandConfig.enabledCategories.map(
    (key) => SECTOR_CATALOG[key],
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Verified Packages, Visas & Programs
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Explore our agency-verified Holiday Tours, Hajj & Umrah packages, Overseas Work Permits, and Study Abroad programs.
          </p>
        </div>
        <div className="w-full md:w-80">
          <SearchFilter
            paramName="search"
            placeholder="Search destination, visa, university..."
          />
        </div>
      </div>

      {/* Category Filter Tabs controlled by brandConfig.enabledCategories */}
      <div className="mb-8 flex flex-wrap items-center gap-2 border-b border-slate-200 pb-4">
        <Link
          href="/packages"
          className={`rounded-full px-4 py-2 text-xs font-semibold transition-all ${
            !activeCategory
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          All Services
        </Link>
        {enabledSectors.map((sector) => {
          const isSelected = activeCategory === sector.key;
          return (
            <Link
              key={sector.key}
              href={`/packages?category=${sector.key}`}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                isSelected
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {sector.label}
            </Link>
          );
        })}
      </div>

      {packages.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {packages.map((pkg) => (
            <PackagePreviewCard key={pkg.id} pkg={pkg} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <p className="text-sm text-slate-500">
            No active packages or visa programs found matching your selection.
          </p>
        </div>
      )}
    </div>
  );
}
