import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPublicVisaServiceDetailAction } from '@/services/visa/visa.service';
import {
  AgencyServiceStatusBadge,
  VisaCategoryBadge,
} from '@/components/module/visa/VisaStatusBadges';
import VisaInquiryForm from '@/components/module/visa/VisaInquiryForm';
import { VisaServiceRequirement } from '@/types/api';


export const instant = false;

export default async function VisaServiceDetailPage({
  params,
}: {
  params: Promise<{ countrySlug: string; serviceSlug: string }>;
}) {
  const { countrySlug, serviceSlug } = await params;
  const service = await getPublicVisaServiceDetailAction(countrySlug, serviceSlug);

  if (!service || !service.country) {
    notFound();
  }

  const country = service.country;
  const requirements = service.requirements || [];
  const steps = service.applicationProcessSteps || [];

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
          <Link href="/visa-services" className="hover:text-blue-600">
            Visa & Immigration
          </Link>
          <span>/</span>
          <Link href={`/visa-services/${country.slug}`} className="hover:text-blue-600">
            {country.name}
          </Link>
          <span>/</span>
          <span className="text-slate-800">{service.title}</span>
        </div>

        <div className="grid gap-8 lg:grid-cols-12">
          {/* Left Column: Detailed Service Information */}
          <div className="space-y-6 lg:col-span-7">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{country.flagEmoji || '🌍'}</span>
                  <span className="text-sm font-bold text-slate-700">{country.name}</span>
                  <VisaCategoryBadge
                    category={service.category}
                    customLabel={service.customCategoryLabel}
                  />
                </div>
                <AgencyServiceStatusBadge status={service.serviceStatus} />
              </div>

              <h1 className="mt-4 text-2xl font-extrabold text-slate-900 sm:text-3xl">
                {service.title}
              </h1>
              <p className="mt-2 text-base text-slate-600">{service.shortDescription}</p>

              {/* Key Service Metrics */}
              <div className="mt-6 grid gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4 sm:grid-cols-3">
                <div>
                  <span className="text-xs text-slate-500">Indicative Processing Time</span>
                  <p className="mt-1 text-sm font-bold text-slate-900">
                    {service.estimatedProcessingTime || 'Varies by Embassy'}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-slate-500">Agency Consultancy Fee</span>
                  <p className="mt-1 text-sm font-bold text-slate-900">
                    {service.agencyServiceFee
                      ? `${service.currency} ${Number(service.agencyServiceFee).toLocaleString()}`
                      : 'Contact for Assessment'}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-slate-500">Embassy / Government Fees</span>
                  <p className="mt-1 text-xs font-medium text-slate-700">
                    {service.governmentFeeInfo || 'Applicable official embassy fees paid separately'}
                  </p>
                </div>
              </div>

              {service.fullDescription && (
                <div className="mt-6">
                  <h2 className="text-base font-bold text-slate-900">Service Scope & Overview</h2>
                  <p className="mt-2 text-sm leading-relaxed text-slate-700 whitespace-pre-line">
                    {service.fullDescription}
                  </p>
                </div>
              )}

              {service.eligibilityInfo && (
                <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50/60 p-4">
                  <h2 className="text-sm font-bold text-blue-950">General Eligibility Guidance</h2>
                  <p className="mt-1.5 text-sm text-blue-900 whitespace-pre-line">
                    {service.eligibilityInfo}
                  </p>
                </div>
              )}
            </div>

            {/* Required Documents Checklist */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-lg font-bold text-slate-900">
                Required Documents Checklist ({requirements.length})
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Prepare the following documents for initial review. Do not upload sensitive passport
                scans through public forms; our consultant will guide you during verification.
              </p>

              {requirements.length === 0 ? (
                <p className="mt-4 text-sm text-slate-600">
                  Document checklist is customized based on applicant profile during consultation.
                </p>
              ) : (
                <ul className="mt-4 divide-y divide-slate-100">
                  {requirements.map((req: VisaServiceRequirement) => (
                    <li key={req.id} className="flex items-start justify-between gap-4 py-3.5">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{req.title}</p>
                        {req.description && (
                          <p className="mt-0.5 text-xs text-slate-600">{req.description}</p>
                        )}
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${req.isMandatory
                            ? 'bg-slate-900 text-white'
                            : 'bg-slate-100 text-slate-600'
                          }`}
                      >
                        {req.isMandatory ? 'Mandatory' : 'Supporting'}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Step-by-Step Application Assistance */}
            {steps.length > 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <h2 className="text-lg font-bold text-slate-900">
                  How Our Application Assistance Works
                </h2>
                <ol className="mt-4 space-y-3">
                  {steps.map((step: string, index: number) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                        {index + 1}
                      </span>
                      <span className="pt-0.5 text-sm text-slate-700">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Compliance Disclaimer & Verification Metadata */}
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-xs text-amber-900 space-y-2">
              <p className="font-bold">Mandatory Immigration & Compliance Disclaimer</p>
              <p>
                {service.disclaimer ||
                  'Our agency provides visa application consultancy, document review, and appointment guidance only. Visa issuance, processing times, and work/study permit approvals are determined solely by the relevant embassy or immigration authority. No visa is ever guaranteed.'}
              </p>
              <div className="flex flex-wrap items-center gap-4 pt-2 text-[11px] text-amber-800">
                {service.lastVerifiedAt && (
                  <span>
                    Last Reviewed by Agency Staff:{' '}
                    {new Date(service.lastVerifiedAt).toLocaleDateString()}
                  </span>
                )}
                {service.informationSourceUrl && (
                  <a
                    href={service.informationSourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold underline"
                  >
                    Official Immigration Reference ↗
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Consultation Inquiry Form */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 space-y-6">
              <VisaInquiryForm
                countryId={country.id}
                countryName={country.name}
                visaServiceId={service.id}
                serviceTitle={service.title}
                category={service.category}
                serviceStatus={service.serviceStatus}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
