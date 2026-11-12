import React from 'react';
import Link from 'next/link';
import { getAdminVisaServicesAction } from '@/services/visa/visa.service';
import {
  AgencyServiceStatusBadge,
  VisaCategoryBadge,
  VisaPublicationBadge,
} from '@/components/module/visa/VisaStatusBadges';
import { QuickVisaServiceActions } from '@/components/module/visa/VisaServiceActionsClient';
import { VisaSubNav } from '@/components/module/visa/VisaSubNav';
import SearchFilter from '@/components/shared/SearchFilter';
import SelectFilter from '@/components/shared/SelectFilter';
import TablePagination from '@/components/shared/TablePagination';
import {
  AgencyServiceStatus,
  VisaCategory,
  VisaPublicationStatus,
  VisaService,
} from '@/types/api';


export const instant = false;

export default async function AdminVisaServicesListPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const limit = Number(params.limit) || 10;
  const search = params.search || '';
  const category = params.category || '';
  const publicationStatus = params.publicationStatus || '';
  const serviceStatus = params.serviceStatus || '';

  const res = await getAdminVisaServicesAction({
    page,
    limit,
    search: search || undefined,
    category: (category as VisaCategory) || undefined,
    publicationStatus: (publicationStatus as VisaPublicationStatus) || undefined,
    serviceStatus: (serviceStatus as AgencyServiceStatus) || undefined,
  });

  const services = res?.data || [];
  const meta = res?.meta || { page: 1, limit: 10, total: 0, totalPages: 1 };

  return (
    <div className="space-y-6">
      <VisaSubNav />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Visa & Permit Services</h1>
          <p className="text-sm text-slate-600">
            Manage visa categories, document checklists, publication state, and inquiry availability
          </p>
        </div>
        <Link
          href="/dashboard/visa-immigration/services/create"
          className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
        >
          + Create Visa Service
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div className="flex-1">
          <SearchFilter placeholder="Search by service title, slug, or description..." />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <SelectFilter
            paramName="category"
            placeholder="All Categories"
            options={[
              { label: 'Student Visa', value: 'STUDENT_VISA' },
              { label: 'Work Visa', value: 'WORK_VISA' },
              { label: 'Work Permit', value: 'WORK_PERMIT' },
              { label: 'Tourist Visa', value: 'TOURIST_VISA' },
              { label: 'Business Visa', value: 'BUSINESS_VISA' },
              { label: 'Other', value: 'OTHER' },
            ]}
          />
          <SelectFilter
            paramName="publicationStatus"
            placeholder="All Publication States"
            options={[
              { label: 'Published', value: 'PUBLISHED' },
              { label: 'Draft', value: 'DRAFT' },
              { label: 'Archived', value: 'ARCHIVED' },
            ]}
          />
          <SelectFilter
            paramName="serviceStatus"
            placeholder="All Availability"
            options={[
              { label: 'Accepting Inquiries', value: 'ACCEPTING_INQUIRIES' },
              { label: 'Limited', value: 'LIMITED' },
              { label: 'Temporarily Paused', value: 'TEMPORARILY_PAUSED' },
              { label: 'Not Offered', value: 'NOT_OFFERED' },
            ]}
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-600">
            <tr>
              <th className="px-4 py-3">Service & Country</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Publication</th>
              <th className="px-4 py-3">Agency Availability</th>
              <th className="px-4 py-3">Fee & Docs</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {services.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-500">
                  No visa services found.
                </td>
              </tr>
            ) : (
              services.map((svc: VisaService) => (
                <tr key={svc.id} className="hover:bg-slate-50/70">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-900">{svc.title}</div>
                    <div className="mt-0.5 text-xs text-slate-500">
                      {svc.country?.flagEmoji} {svc.country?.name} • /{svc.slug}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <VisaCategoryBadge
                      category={svc.category}
                      customLabel={svc.customCategoryLabel}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <VisaPublicationBadge status={svc.publicationStatus} />
                  </td>
                  <td className="px-4 py-3">
                    <AgencyServiceStatusBadge status={svc.serviceStatus} />
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600">
                    <div>
                      {svc.agencyServiceFee
                        ? `${svc.currency} ${Number(svc.agencyServiceFee).toLocaleString()}`
                        : 'TBD'}
                    </div>
                    <div className="text-slate-400">
                      {svc.requirements?.length ?? 0} Docs • {svc._count?.inquiries ?? 0} Inquiries
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex flex-col items-end gap-1.5">
                      <Link
                        href={`/dashboard/visa-immigration/services/${svc.id}`}
                        className="text-xs font-bold text-blue-600 hover:underline"
                      >
                        Edit Details & Checklist
                      </Link>
                      <QuickVisaServiceActions
                        serviceId={svc.id}
                        publicationStatus={svc.publicationStatus}
                        serviceStatus={svc.serviceStatus}
                      />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <TablePagination
        page={meta.page}
        limit={meta.limit}
        total={meta.total}
        totalPages={meta.totalPages}
      />
    </div>
  );
}
