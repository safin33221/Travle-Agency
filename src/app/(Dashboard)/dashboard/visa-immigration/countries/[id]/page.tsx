import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAdminCountryByIdAction } from '@/services/visa/visa.service';
import CountryForm from '@/components/module/visa/CountryForm';
import {
  AgencyServiceStatusBadge,
  VisaCategoryBadge,
  VisaPublicationBadge,
} from '@/components/module/visa/VisaStatusBadges';


export const instant = false;

export default async function EditCountryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const country = await getAdminCountryByIdAction(id);

  if (!country) {
    notFound();
  }

  const services = country.visaServices || [];

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Edit Country: {country.flagEmoji} {country.name}
          </h1>
          <p className="text-sm text-slate-600">
            Update coverage status, public description, and inspect linked visa services.
          </p>
        </div>
        <Link
          href={`/visa-services/${country.slug}`}
          target="_blank"
          className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          Preview Public Page ↗
        </Link>
      </div>

      <CountryForm initialData={country} />

      {/* Associated Visa Services */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">
            Visa Services for {country.name} ({services.length})
          </h2>
          <Link
            href="/dashboard/visa-immigration/services/create"
            className="rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-700"
          >
            + Add Service
          </Link>
        </div>

        {services.length === 0 ? (
          <p className="text-sm text-slate-500">
            No visa services configured for this country yet.
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {services.map((svc) => (
              <div
                key={svc.id}
                className="flex flex-wrap items-center justify-between gap-3 py-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <VisaCategoryBadge
                      category={svc.category}
                      customLabel={svc.customCategoryLabel}
                    />
                    <span className="font-semibold text-slate-900">{svc.title}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500">/{svc.slug}</p>
                </div>
                <div className="flex items-center gap-2.5">
                  <VisaPublicationBadge status={svc.publicationStatus} />
                  <AgencyServiceStatusBadge status={svc.serviceStatus} />
                  <Link
                    href={`/dashboard/visa-immigration/services/${svc.id}`}
                    className="text-xs font-semibold text-blue-600 hover:underline"
                  >
                    Edit →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
