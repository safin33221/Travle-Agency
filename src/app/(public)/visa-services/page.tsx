import React from 'react';
import Link from 'next/link';
import { getPublicCountriesAction, getPublicVisaServicesAction } from '@/services/visa/visa.service';
import {
  AgencyServiceStatusBadge,
  CountryCoverageBadge,
  VisaCategoryBadge,
} from '@/components/module/visa/VisaStatusBadges';
import SearchFilter from '@/components/shared/SearchFilter';
import SelectFilter from '@/components/shared/SelectFilter';
import {
  AgencyServiceStatus,
  Country,
  VisaCategory,
  VisaService,
} from '@/types/api';


export const instant = false;

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
    <div className="min-h-screen bg-slate-50">
      {/* Hero Banner */}
      <section className="border-b bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="inline-flex items-center rounded-full border border-blue-400/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-300">
              Visa & Immigration Consultancy
            </span>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-5xl">
              Destination Countries & Visa Assistance Services
            </h1>
            <p className="mt-4 text-base text-slate-300 sm:text-lg">
              Explore destination countries where our agency provides structured document
              preparation, eligibility review, and visa application file consultancy for Student
              Visas, Work Permits, Work Visas, Tourist Visas, and Business travel.
            </p>
            <div className="mt-6 rounded-xl border border-amber-400/30 bg-amber-500/10 p-4 text-xs text-amber-200">
              <strong>Important Notice:</strong> Agency service availability indicates whether our
              consultants are currently accepting new client files. Final visa or permit issuance is
              determined exclusively by the respective embassy or government immigration authority.
              We never advertise guaranteed visa approvals.
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-12 px-4 py-10 sm:px-6 lg:px-8">
        {/* Search & Filter Bar */}
        <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
          <div className="flex-1">
            <SearchFilter placeholder="Search destination country or visa service..." />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <SelectFilter
              paramName="category"
              placeholder="All Visa Categories"
              options={[
                { label: 'Student Visa', value: 'STUDENT_VISA' },
                { label: 'Work Visa', value: 'WORK_VISA' },
                { label: 'Work Permit', value: 'WORK_PERMIT' },
                { label: 'Tourist Visa', value: 'TOURIST_VISA' },
                { label: 'Business Visa', value: 'BUSINESS_VISA' },
                { label: 'Other Categories', value: 'OTHER' },
              ]}
            />
            <SelectFilter
              paramName="serviceStatus"
              placeholder="All Availability"
              options={[
                { label: 'Accepting Inquiries', value: 'ACCEPTING_INQUIRIES' },
                { label: 'Limited Intake', value: 'LIMITED' },
                { label: 'Temporarily Paused', value: 'TEMPORARILY_PAUSED' },
              ]}
            />
          </div>
        </div>

        {/* Destination Countries Grid */}
        <section>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Destination Countries We Cover ({countries.length})
              </h2>
              <p className="text-sm text-slate-600">
                Select a destination country to inspect available visa categories and document
                checklists
              </p>
            </div>
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
                  className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{country.flagEmoji || '🌍'}</span>
                        <div>
                          <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600">
                            {country.name}
                          </h3>
                          <span className="font-mono text-xs text-slate-400">
                            ISO: {country.isoCode}
                          </span>
                        </div>
                      </div>
                      <CountryCoverageBadge status={country.coverageStatus} />
                    </div>

                    {country.shortIntro && (
                      <p className="mt-3 line-clamp-2 text-sm text-slate-600">
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
                        <span className="text-xs text-slate-400">
                          No published visa services yet
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 text-xs font-semibold text-blue-600">
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
              Published Visa & Immigration Services ({services.length})
            </h2>
            <p className="text-sm text-slate-600">
              Direct access to individual visa categories, eligibility notes, and consultation
              requests
            </p>
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
                  className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{service.country?.flagEmoji || '🌐'}</span>
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
                    <p className="mt-1.5 text-sm text-slate-600">{service.shortDescription}</p>

                    <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3 text-xs">
                      <div>
                        <span className="text-slate-500">Indicative Processing:</span>
                        <p className="font-semibold text-slate-800">
                          {service.estimatedProcessingTime || 'Varies by Embassy'}
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-500">Consultancy Fee:</span>
                        <p className="font-semibold text-slate-800">
                          {service.agencyServiceFee
                            ? `${service.currency} ${Number(service.agencyServiceFee).toLocaleString()}`
                            : 'Contact for Quote'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                    <span className="text-xs text-slate-500">
                      {service.requirements?.length || 0} Document Checklist Items
                    </span>
                    <Link
                      href={`/visa-services/${service.country?.slug}/${service.slug}`}
                      className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-600"
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
