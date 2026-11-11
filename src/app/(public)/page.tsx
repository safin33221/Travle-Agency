import Link from 'next/link';
import { getPackages } from '@/services/packages/packages.service';
import { HeroSection } from '@/components/module/Home/HeroSection';
import { FeaturesSection } from '@/components/module/Home/FeaturesSection';
import { PackagePreviewCard } from '@/components/common/PackagePreviewCard';
import { Button } from '@/components/ui/button';

export default async function PublicHomePage() {
  const packagesRes = await getPackages({ limit: 6, isArchived: false });

  return (
    <div>
      <HeroSection />

      <section className="py-16 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              Featured Tour Packages
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Verified agency packages with transparent inclusions and indicative pricing.
            </p>
          </div>
          <Link href="/packages">
            <Button variant="outline">View All Packages →</Button>
          </Link>
        </div>

        {packagesRes.data.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {packagesRes.data.map((pkg) => (
              <PackagePreviewCard key={pkg.id} pkg={pkg} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <h3 className="text-base font-semibold text-slate-800">
              Tour Catalog Being Updated
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Contact our travel desk or sign in to the Staff Portal to publish active packages.
            </p>
          </div>
        )}
      </section>

      <FeaturesSection />
    </div>
  );
}
