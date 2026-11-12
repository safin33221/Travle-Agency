import React from 'react';
import Link from 'next/link';
import { getVisaAdminOverviewAction } from '@/services/visa/visa.service';

export const instant = false;

export default async function VisaImmigrationOverviewPage() {
  const stats = (await getVisaAdminOverviewAction()) || {
    totalCountries: 0,
    countriesWithPublishedServices: 0,
    publishedServicesCount: 0,
    acceptingInquiriesCount: 0,
    pausedServicesCount: 0,
    visaLeadsCount: 0,
  };

  const kpis = [
    {
      label: 'Total Destination Countries',
      value: stats.totalCountries,
      sub: 'Active & limited coverage countries',
      href: '/dashboard/visa-immigration/countries',
    },
    {
      label: 'Countries with Published Services',
      value: stats.countriesWithPublishedServices,
      sub: 'Live on public website',
      href: '/dashboard/visa-immigration/countries',
    },
    {
      label: 'Published Visa Services',
      value: stats.publishedServicesCount,
      sub: 'Across all visa categories',
      href: '/dashboard/visa-immigration/services',
    },
    {
      label: 'Services Accepting Inquiries',
      value: stats.acceptingInquiriesCount,
      sub: 'Open for public consultation requests',
      href: '/dashboard/visa-immigration/services',
    },
    {
      label: 'Temporarily Paused Services',
      value: stats.pausedServicesCount,
      sub: 'Inquiry intake currently paused',
      href: '/dashboard/visa-immigration/services',
    },
    {
      label: 'Visa & Immigration Inquiries',
      value: stats.visaLeadsCount,
      sub: 'Synced directly with Lead CRM',
      href: '/dashboard/visa-immigration/inquiries',
    },
  ];

  return (
    <div className="space-y-8 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Visa & Immigration Services Management
          </h1>
          <p className="text-sm text-slate-600">
            Manage destination countries, visa categories, document checklists, publication state,
            and incoming inquiries linked to the Lead CRM.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/visa-services"
            target="_blank"
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            View Public Visa Portal ↗
          </Link>
          <Link
            href="/dashboard/visa-immigration/countries/create"
            className="rounded-lg border border-blue-600 bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100"
          >
            + Add Country
          </Link>
          <Link
            href="/dashboard/visa-immigration/services/create"
            className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
          >
            + Create Visa Service
          </Link>
        </div>
      </div>

      {/* 6 KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {kpis.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-300 hover:shadow"
          >
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
              {item.label}
            </p>
            <p className="mt-2 text-3xl font-extrabold text-slate-900">{item.value}</p>
            <p className="mt-1 text-xs text-slate-500">{item.sub}</p>
          </Link>
        ))}
      </div>

      {/* Quick Operations Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-900">1. Country Coverage Directory</h2>
          <p className="mt-1.5 text-xs text-slate-600">
            Maintain destination countries, ISO codes, featured flags, and agency coverage status
            (ACTIVE, LIMITED, PAUSED, ARCHIVED).
          </p>
          <div className="mt-4 flex gap-3">
            <Link
              href="/dashboard/visa-immigration/countries"
              className="text-xs font-semibold text-blue-600 hover:underline"
            >
              Manage Countries →
            </Link>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-900">2. Visa Services & Checklists</h2>
          <p className="mt-1.5 text-xs text-slate-600">
            Configure Student Visa, Work Permit, Work Visa, and Tourist Visa offerings with
            separate Publication Status vs. Inquiry Availability controls.
          </p>
          <div className="mt-4 flex gap-3">
            <Link
              href="/dashboard/visa-immigration/services"
              className="text-xs font-semibold text-blue-600 hover:underline"
            >
              Manage Visa Services →
            </Link>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-900">3. Visa Inquiries & CRM Sync</h2>
          <p className="mt-1.5 text-xs text-slate-600">
            Every public visa consultation request automatically creates or links a Lead record in
            the main CRM pipeline for qualification, AI drafts, and quotations.
          </p>
          <div className="mt-4 flex gap-3">
            <Link
              href="/dashboard/visa-immigration/inquiries"
              className="text-xs font-semibold text-blue-600 hover:underline"
            >
              View Visa Inquiries →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
