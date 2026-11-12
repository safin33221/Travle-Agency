import Link from 'next/link';
import { getPackages } from '@/services/packages/packages.service';
import { getPublicCountriesAction } from '@/services/visa/visa.service';
import { HeroSection } from '@/components/module/Home/HeroSection';
import { FeaturesSection } from '@/components/module/Home/FeaturesSection';
import { PackagePreviewCard } from '@/components/common/PackagePreviewCard';
import { CountryCoverageBadge } from '@/components/module/visa/VisaStatusBadges';
import { Button } from '@/components/ui/button';
import { Country } from '@/types/api';

export const instant = false;

export default async function PublicHomePage() {
  const [packagesRes, countriesRes] = await Promise.all([
    getPackages({ limit: 6, isArchived: false }),
    getPublicCountriesAction({ limit: 6 }),
  ]);

  const packages = packagesRes?.data || [];
  const countries = countriesRes?.data || [];

  return (
    <div>
      <HeroSection />

      {/* Featured Tour, Hajj & Visa Packages */}
      <section className="py-16 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-sky-600">
              Verified Catalog
            </span>
            <h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
              Featured Packages & Programs
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Clear inclusions, required document lists, and transparent starting prices—no hidden costs.
            </p>
          </div>
          <Link href="/packages">
            <Button variant="outline">View All Packages →</Button>
          </Link>
        </div>

        {packages.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {packages.map((pkg) => (
              <PackagePreviewCard key={pkg.id} pkg={pkg} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <h3 className="text-base font-semibold text-slate-800">
              Packages Are Being Updated
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Need a custom holiday, Hajj, or visa quote right now? Request one directly.
            </p>
            <Link href="/contact" className="mt-4 inline-block">
              <Button variant="secondary" size="sm">
                Request Custom Quote →
              </Button>
            </Link>
          </div>
        )}
      </section>

      {/* Popular Visa & Immigration Destinations Preview */}
      {countries.length > 0 && (
        <section className="py-14 bg-slate-50 border-t border-slate-200">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                  Visa & Immigration Desk
                </span>
                <h2 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                  Popular Visa Destinations We Cover
                </h2>
                <p className="mt-1.5 text-sm text-slate-600">
                  Click any country to see student visa, work permit, and tourist visa checklists.
                </p>
              </div>
              <Link href="/visa-services">
                <Button variant="outline">Explore All Countries →</Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {countries.map((country: Country) => (
                <Link
                  key={country.id}
                  href={`/visa-services/${country.slug}`}
                  className="group flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-2xs transition hover:border-sky-400 hover:shadow-sm"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-3xl shrink-0">
                      {country.flagEmoji || '🌍'}
                    </span>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 group-hover:text-sky-700 truncate">
                        {country.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {country.visaServices?.length || 0} Visa Program
                        {(country.visaServices?.length || 0) === 1 ? '' : 's'} Available
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <CountryCoverageBadge status={country.coverageStatus} />
                    <span className="text-[11px] font-semibold text-sky-600 group-hover:translate-x-0.5 transition">
                      View Checklist →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <FeaturesSection />
    </div>
  );
}
