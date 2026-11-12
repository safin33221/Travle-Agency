import Link from 'next/link';
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

const SECTOR_ICONS: Record<ServiceCategory, string> = {
  TOUR: '🏖️',
  HAJJ_UMRAH: '🕋',
  WORK_PERMIT: '💼',
  STUDENT_VISA: '🎓',
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
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-sky-50/80 via-white to-slate-50 p-6 sm:p-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <span className="inline-block rounded-full bg-sky-100 px-3 py-0.5 text-xs font-bold text-sky-800">
            100% Agency-Verified Pricing & Inclusions
          </span>
          <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Browse Holiday Tours, Hajj, Work Permits & Study Programs
          </h1>
          <p className="mt-1.5 text-sm text-slate-600">
            Select a category below or search by country/destination to compare packages and see required documents.
          </p>
        </div>
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
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/packages"
            className={`rounded-full px-4 py-2 text-xs font-semibold transition-all ${
              !activeCategory
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            ✨ All Services
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
                {SECTOR_ICONS[sector.key]} {sector.label}
              </Link>
            );
          })}
        </div>

        <span className="text-xs font-medium text-slate-500">
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
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Looking for a specific country, custom group tour, or visa option? Request a custom quote in 1 minute!
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

      {/* Custom Inquiry Banner */}
      <div className="rounded-2xl bg-slate-900 p-6 sm:p-8 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold">
            Need a Custom Family Tour or Group Quotation?
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Tell us your travel dates, number of travelers, and budget—our team will prepare a custom PDF quote.
          </p>
        </div>
        <Link href="/contact" className="shrink-0">
          <Button variant="secondary">Get Custom Quote →</Button>
        </Link>
      </div>
    </div>
  );
}
