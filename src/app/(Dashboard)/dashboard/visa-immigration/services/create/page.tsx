import React from 'react';
import { getAdminCountriesAction } from '@/services/visa/visa.service';
import VisaServiceForm from '@/components/module/visa/VisaServiceForm';


export const instant = false;

export default async function CreateVisaServicePage() {
  const countriesRes = await getAdminCountriesAction({ limit: 100 });
  const countries = countriesRes?.data || [];

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Create Visa or Immigration Service</h1>
        <p className="text-sm text-slate-600">
          Define a destination visa service, required documents checklist, fees, and compliance
          disclaimers.
        </p>
      </div>
      <VisaServiceForm countries={countries} />
    </div>
  );
}
