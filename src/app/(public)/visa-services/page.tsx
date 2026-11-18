import React from 'react';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import {
  Briefcase,
  Building2,
  Globe,
  GraduationCap,
  Plane,
  Wrench,
} from 'lucide-react';
import { getPublicCountriesAction, getPublicVisaServicesAction } from '@/services/visa/visa.service';
import {
  AgencyServiceStatusBadge,
  CountryCoverageBadge,
  VisaCategoryBadge,
} from '@/components/module/visa/VisaStatusBadges';
import SearchFilter from '@/components/shared/SearchFilter';
import SelectFilter from '@/components/shared/SelectFilter';
import { ClearFiltersButton } from '@/components/shared/ClearFiltersButton';
import {
  AgencyServiceStatus,
  Country,
  VisaCategory,
  VisaService,
} from '@/types/api';

export const instant = false;

const VISA_CATEGORY_TABS: Array<{ label: string; value: string; Icon: LucideIcon }> = [
  { label: 'All Categories', value: '', Icon: Globe },
  { label: 'Student Visa', value: 'STUDENT_VISA', Icon: GraduationCap },
  { label: 'Work Permit', value: 'WORK_PERMIT', Icon: Briefcase },
  { label: 'Work Visa', value: 'WORK_VISA', Icon: Wrench },
  { label: 'Tourist Visa', value: 'TOURIST_VISA', Icon: Plane },
  { label: 'Business Visa', value: 'BUSINESS_VISA', Icon: Building2 },
];

export default async function PublicVisaServicesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const search = params.search || '';
  const category = params.category || '';
  const serviceStatus = params.serviceStatus || '';

  const [countriesRes, servicesRes] = await Promise.all([
    getPublicCountriesAction({ limit: 50, search }),
    getPublicVisaServicesAction({
      limit: 50,
      search,
      category: (category as VisaCategory) || undefined,
      serviceStatus: (serviceStatus as AgencyServiceStatus) || undefined,
    }),
  ]);

  const countries = countriesRes?.data || [];
  const services = servicesRes?.data || [];

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      {/* Hero Banner */}
      <section className="border-b border-slate-800 bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 py-12 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="inline-flex items-center rounded-full border border-teal-400/30 bg-teal-500/15 px-3 py-1 text-xs font-semibold text-teal-200">
              Visa & Immigration Portal
            </span>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Destination Countries & Visa Services
            </h1>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-12 px-4 py-10 sm:px-6 lg:px-8">
        {/* Quick 1-Click Visa Category Tabs + Search & Filter Bar */}
        <div className="rounded-2xl border border-stone-200/90 bg-white p-5 shadow-2xs space-y-4">
          <div className="flex flex-wrap items-center gap-2 border-b border-stone-100 pb-4">
            {VISA_CATEGORY_TABS.map((tab) => {
              const isSelected = category === tab.value;
              const qs = new URLSearchParams();
              if (tab.value) qs.set('category', tab.value);
              if (search) qs.set('search', search);
              if (serviceStatus) qs.set('serviceStatus', serviceStatus);
              const href = qs.toString()
                ? `/visa-services?${qs.toString()}`
                : '/visa-services';
              const TabIcon = tab.Icon;
              return (
                <Link
                  key={tab.label}
                  href={href}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                    isSelected
                      ? 'bg-teal-700 text-white shadow-xs'
                      : 'border border-stone-200 bg-[#FAF9F6] text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <TabIcon className="h-3.5 w-3.5" />
                  {tab.label}
                </Link>
              );
            })}
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex-1">
              <SearchFilter placeholder="Search destination country or visa service (e.g. UK, Malaysia, Romania)..." />
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              <SelectFilter
                paramName="serviceStatus"
                placeholder="All Availability"
                options={[
                  { label: 'Accepting Inquiries', value: 'ACCEPTING_INQUIRIES' },
                  { label: 'Limited Intake', value: 'LIMITED' },
                  { label: 'Temporarily Paused', value: 'TEMPORARILY_PAUSED' },
                ]}
              />
              <ClearFiltersButton />
            </div>
          </div>
        </div>

        {/* Destination Countries Grid */}
        <section>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900">
              Destination Countries ({countries.length})
            </h2>
          </div>

          {countries.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <p className="text-base font-medium text-slate-700">
                No matching destination countries found.
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Try clearing your search filters or contact our office directly for custom
                destinations.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {countries.map((country: Country) => (
                <Link
                  key={country.id}
                  href={`/visa-services/${country.slug}`}
                  className="group flex flex-col justify-between rounded-2xl border border-stone-200/90 bg-white p-6 shadow-2xs transition hover:-translate-y-0.5 hover:border-teal-400 hover:shadow-md"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-stone-200 bg-[#FAF9F6] text-xs font-bold uppercase text-stone-700">
                          {country.isoCode || country.name.slice(0, 2)}
                        </span>
                        <div>
                          <h3 className="text-lg font-bold text-slate-900 group-hover:text-teal-700">
                            {country.name}
                          </h3>
                          <span className="font-mono text-xs text-stone-400">
                            ISO: {country.isoCode}
                          </span>
                        </div>
                      </div>
                      <CountryCoverageBadge status={country.coverageStatus} />
                    </div>

                    {country.shortIntro && (
                      <p className="mt-3 line-clamp-2 text-sm text-stone-600">
                        {country.shortIntro}
                      </p>
                    )}

                    {/* Available categories preview */}
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {country.visaServices && country.visaServices.length > 0 ? (
                        country.visaServices.map((svc: VisaService) => (
                          <VisaCategoryBadge
                            key={svc.id}
                            category={svc.category}
                            customLabel={svc.customCategoryLabel}
                          />
                        ))
                      ) : (
                        <span className="text-xs text-stone-400">
                          No published visa services yet
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-stone-100 pt-4 text-xs font-semibold text-teal-700">
                    <span>
                      {country.visaServices?.length || 0} Published Service
                      {(country.visaServices?.length || 0) === 1 ? '' : 's'}
                    </span>
                    <span className="transition group-hover:translate-x-1">
                      Explore Country Services →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Published Visa Services Directory */}
        <section>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900">
              Published Visa Services ({services.length})
            </h2>
          </div>

          {services.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <p className="text-base font-medium text-slate-700">
                No visa services match the selected filter criteria.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {services.map((service: VisaService) => (
                <div
                  key={service.id}
                  className="flex flex-col justify-between rounded-2xl border border-stone-200/90 bg-white p-6 shadow-2xs"
                >
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-6 items-center rounded-md border border-stone-200 bg-[#FAF9F6] px-1.5 font-mono text-[11px] font-bold text-stone-700">
                          {service.country?.isoCode || 'GLB'}
                        </span>
                        <span className="text-sm font-semibold text-slate-700">
                          {service.country?.name}
                        </span>
                        <VisaCategoryBadge
                          category={service.category}
                          customLabel={service.customCategoryLabel}
                        />
                      </div>
                      <AgencyServiceStatusBadge status={service.serviceStatus} />
                    </div>

                    <h3 className="mt-3 text-lg font-bold text-slate-900">{service.title}</h3>
                    <p className="mt-1.5 text-sm text-stone-600">{service.shortDescription}</p>

                    <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl border border-stone-200/70 bg-[#FAF9F6] p-3 text-xs">
                      <div>
                        <span className="text-stone-500">Indicative Processing:</span>
                        <p className="font-semibold text-slate-800">
                          {service.estimatedProcessingTime || 'Varies by Embassy'}
                        </p>
                      </div>
                      <div>
                        <span className="text-stone-500">Consultancy Fee:</span>
                        <p className="font-semibold text-slate-800 tabular-nums">
                          {service.agencyServiceFee
                            ? `${service.currency} ${Number(service.agencyServiceFee).toLocaleString()}`
                            : 'Contact for Quote'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-stone-100 pt-4">
                    <span className="text-xs text-stone-500">
                      {service.requirements?.length || 0} Document Checklist Items
                    </span>
                    <Link
                      href={`/visa-services/${service.country?.slug}/${service.slug}`}
                      className="rounded-xl bg-teal-700 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-800 transition"
                    >
                      View Requirements & Inquire
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
