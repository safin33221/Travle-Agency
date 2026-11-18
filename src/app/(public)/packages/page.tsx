import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';
import {
  Globe,
  Landmark,
  Layers,
  Palmtree,
} from 'lucide-react';
import { getPackages } from '@/services/packages/packages.service';
import { PackagePreviewCard } from '@/components/common/PackagePreviewCard';
import {
  isPackageCategory,
  PACKAGE_CATEGORIES,
  SECTOR_CATALOG,
} from '@/config/brand.config';
import { ServiceCategory } from '@/types/api';
import { SearchFilter } from '@/components/shared/SearchFilter';
import { ClearFiltersButton } from '@/components/shared/ClearFiltersButton';
import { Button } from '@/components/ui/button';

export const instant = false;

interface PublicPackagesPageProps {
  searchParams?: Promise<{
    category?: ServiceCategory;
    search?: string;
  }>;
}

const PACKAGE_ICONS: Partial<Record<ServiceCategory, LucideIcon>> = {
  TOUR: Palmtree,
  HAJJ_UMRAH: Landmark,
};

export default async function PublicPackagesPage({
  searchParams,
}: PublicPackagesPageProps) {
  const resolved = (await searchParams) ?? {};
  const activeCategory = resolved.category;

  if (activeCategory === 'WORK_PERMIT' || activeCategory === 'STUDENT_VISA') {
    redirect(`/visa-services?category=${activeCategory}`);
  }

  const packagesRes = await getPackages({
    limit: 50,
    isArchived: false,
    category: activeCategory,
    search: resolved.search,
  });

  const filteredPackages = (packagesRes.data || []).filter((pkg) =>
    isPackageCategory(pkg.category),
  );

  const packageSectors = PACKAGE_CATEGORIES.map((key) => SECTOR_CATALOG[key]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      {/* Header & Search */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Tour & Hajj Packages
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            Curated domestic & international holidays, plus Hajj & Umrah packages.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="w-full sm:w-72">
            <SearchFilter
              paramName="search"
              placeholder="Search Cox's Bazar, Dubai, Makkah..."
            />
          </div>
          <ClearFiltersButton />
        </div>
      </div>

      {/* Category Filter Tabs (Tour & Hajj only) */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/packages"
            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition-all ${
              !activeCategory
                ? 'bg-slate-900 text-white shadow-xs'
                : 'border border-stone-200 bg-white text-stone-700 hover:bg-stone-100'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            All Tour & Hajj
          </Link>
          {packageSectors.map((sector) => {
            const isSelected = activeCategory === sector.key;
            const Icon = PACKAGE_ICONS[sector.key] || Palmtree;
            return (
              <Link
                key={sector.key}
                href={`/packages?category=${sector.key}`}
                className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'border border-stone-200 bg-white text-stone-700 hover:bg-stone-100'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {sector.key === 'TOUR' ? 'Holiday Tours' : sector.label}
              </Link>
            );
          })}
          <Link
            href="/visa-services"
            className="inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50/70 px-4 py-2 text-xs font-semibold text-teal-800 hover:bg-teal-100 transition"
          >
            <Globe className="h-3.5 w-3.5" />
            Looking for Visa or Work Permits? →
          </Link>
        </div>

        <span className="text-xs font-medium text-stone-500">
          Showing <strong>{filteredPackages.length}</strong> active package
          {filteredPackages.length === 1 ? '' : 's'}
        </span>
      </div>

      {filteredPackages.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredPackages.map((pkg) => (
            <PackagePreviewCard key={pkg.id} pkg={pkg} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center space-y-3">
          <p className="text-base font-semibold text-slate-800">
            No active packages matched your selection.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link href="/packages">
              <Button variant="outline" size="sm">
                Reset Filters
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="secondary" size="sm">
                Request Custom Quote →
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
