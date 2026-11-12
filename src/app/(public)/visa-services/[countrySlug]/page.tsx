import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPublicCountryBySlugAction } from '@/services/visa/visa.service';
import {
  AgencyServiceStatusBadge,
  CountryCoverageBadge,
  VisaCategoryBadge,
} from '@/components/module/visa/VisaStatusBadges';
import { VisaService } from '@/types/api';


export const instant = false;

export default async function CountryVisaDetailPage({
  params,
}: {
  params: Promise<{ countrySlug: string }>;
}) {
  const { countrySlug } = await params;
  const country = await getPublicCountryBySlugAction(countrySlug);

  if (!country) {
    notFound();
  }

  const services = country.visaServices || [];

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto max-w-6xl space-y-8 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <Link href="/visa-services" className="hover:text-blue-600">
            Visa & Immigration
          </Link>
          <span>/</span>
          <span className="text-slate-800">{country.name}</span>
        </div>

        {/* Country Header */}
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="text-5xl">{country.flagEmoji || '🌍'}</span>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-extrabold text-slate-900">{country.name}</h1>
                  <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-600">
                    {country.isoCode}
                  </span>
                </div>
                {country.shortIntro && (
                  <p className="mt-2 text-base text-slate-600">{country.shortIntro}</p>
                )}
              </div>
            </div>
            <CountryCoverageBadge status={country.coverageStatus} />
          </div>

          {country.detailedDescription && (
            <div className="mt-6 border-t border-slate-100 pt-6 text-sm leading-relaxed text-slate-700 whitespace-pre-line">
              {country.detailedDescription}
            </div>
          )}

          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">
            <strong>Transparency & Compliance Note:</strong> Our agency provides document
            verification, application preparation, and procedural guidance for {country.name}.
            Agency coverage status reflects our internal service capacity and does not represent
            embassy quota availability or guaranteed approval.
          </div>
        </div>

        {/* Offered Visa Services */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900">
            Available Visa & Permit Assistance Services for {country.name} ({services.length})
          </h2>

          {services.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
              <p className="text-sm text-slate-600">
                No published visa service categories are currently listed for {country.name}.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {services.map((service: VisaService) => (
                <div
                  key={service.id}
                  className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <VisaCategoryBadge
                        category={service.category}
                        customLabel={service.customCategoryLabel}
                      />
                      <AgencyServiceStatusBadge status={service.serviceStatus} />
                    </div>

                    <h3 className="mt-3 text-xl font-bold text-slate-900">{service.title}</h3>
                    <p className="mt-2 text-sm text-slate-600">{service.shortDescription}</p>

                    <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3.5 text-xs">
                      <div>
                        <span className="text-slate-500">Estimated Processing:</span>
                        <p className="mt-0.5 font-semibold text-slate-800">
                          {service.estimatedProcessingTime || 'Subject to Embassy'}
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-500">Agency Consultancy Fee:</span>
                        <p className="mt-0.5 font-semibold text-slate-800">
                          {service.agencyServiceFee
                            ? `${service.currency} ${Number(service.agencyServiceFee).toLocaleString()}`
                            : 'Upon Consultation'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                    <span className="text-xs font-medium text-slate-500">
                      {service.requirements?.length || 0} Required Documents Listed
                    </span>
                    <Link
                      href={`/visa-services/${country.slug}/${service.slug}`}
                      className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                    >
                      Full Checklist & Consultation →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
