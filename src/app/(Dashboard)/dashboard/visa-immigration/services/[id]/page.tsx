import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  getAdminCountriesAction,
  getAdminVisaServiceByIdAction,
} from '@/services/visa/visa.service';
import VisaServiceForm from '@/components/module/visa/VisaServiceForm';


export const instant = false;

export default async function EditVisaServicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [service, countriesRes] = await Promise.all([
    getAdminVisaServiceByIdAction(id),
    getAdminCountriesAction({ limit: 100 }),
  ]);

  if (!service) {
    notFound();
  }

  const countries = countriesRes?.data || [];

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Edit Visa Service: {service.title}</h1>
          <p className="text-sm text-slate-600">
            Update document checklist, availability state, fees, and publication settings.
          </p>
        </div>
        {service.country && (
          <Link
            href={`/visa-services/${service.country.slug}/${service.slug}`}
            target="_blank"
            className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            View Public Service Page ↗
          </Link>
        )}
      </div>

      <VisaServiceForm countries={countries} initialData={service} />
    </div>
  );
}
