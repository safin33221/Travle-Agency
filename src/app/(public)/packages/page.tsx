import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import {
  Briefcase,
  GraduationCap,
  Landmark,
  Layers,
  Palmtree,
} from 'lucide-react';
import { getPackages } from '@/services/packages/packages.service';
import { PackagePreviewCard } from '@/components/common/PackagePreviewCard';
import { brandConfig, SECTOR_CATALOG } from '@/config/brand.config';
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

const SECTOR_ICONS: Record<ServiceCategory, LucideIcon> = {
  TOUR: Palmtree,
  HAJJ_UMRAH: Landmark,
  WORK_PERMIT: Briefcase,
  STUDENT_VISA: GraduationCap,
};

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

  const enabledSectors = brandConfig.enabledCategories.map(
    (key) => SECTOR_CATALOG[key],
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      {/* Header & Search */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          Packages & Programs
        </h1>
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="w-full sm:w-72">
            <SearchFilter
              paramName="search"
              placeholder="Search Cox's Bazar, Makkah, UK..."
            />
          </div>
          <ClearFiltersButton />
        </div>
      </div>

      {/* Category Filter Tabs controlled by brandConfig.enabledCategories */}
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
            All Services
          </Link>
          {enabledSectors.map((sector) => {
            const isSelected = activeCategory === sector.key;
            const Icon = SECTOR_ICONS[sector.key];
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
                {sector.label}
              </Link>
            );
          })}
        </div>

        <span className="text-xs font-medium text-stone-500">
          Showing <strong>{packagesRes.data.length}</strong> active package
          {packagesRes.data.length === 1 ? '' : 's'}
        </span>
      </div>

      {packagesRes.data.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {packagesRes.data.map((pkg) => (
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
