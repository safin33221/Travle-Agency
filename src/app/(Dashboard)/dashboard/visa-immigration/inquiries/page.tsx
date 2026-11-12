import React from 'react';
import Link from 'next/link';
import { getAdminVisaInquiriesAction } from '@/services/visa/visa.service';
import { VisaCategoryBadge } from '@/components/module/visa/VisaStatusBadges';
import { VisaSubNav } from '@/components/module/visa/VisaSubNav';
import SearchFilter from '@/components/shared/SearchFilter';
import SelectFilter from '@/components/shared/SelectFilter';
import TablePagination from '@/components/shared/TablePagination';
import { VisaCategory, VisaInquiry } from '@/types/api';


export const instant = false;

export default async function AdminVisaInquiriesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const limit = Number(params.limit) || 10;
  const search = params.search || '';
  const category = params.category || '';

  const res = await getAdminVisaInquiriesAction({
    page,
    limit,
    search: search || undefined,
    category: (category as VisaCategory) || undefined,
  });

  const inquiries = res?.data || [];
  const meta = res?.meta || { page: 1, limit: 10, total: 0, totalPages: 1 };

  return (
    <div className="space-y-6">
      <VisaSubNav />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Visa & Immigration Inquiries</h1>
          <p className="text-sm text-slate-600">
            All public visa consultation requests are automatically synchronized with the main Lead
            CRM pipeline.
          </p>
        </div>
        <Link
          href="/dashboard/leads"
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          Open Main Lead Pipeline →
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <SearchFilter placeholder="Search by applicant name, phone, email, or message..." />
        </div>
        <div className="flex items-center gap-3">
          <SelectFilter
            paramName="category"
            placeholder="All Visa Categories"
            options={[
              { label: 'Student Visa', value: 'STUDENT_VISA' },
              { label: 'Work Visa', value: 'WORK_VISA' },
              { label: 'Work Permit', value: 'WORK_PERMIT' },
              { label: 'Tourist Visa', value: 'TOURIST_VISA' },
              { label: 'Business Visa', value: 'BUSINESS_VISA' },
              { label: 'Other', value: 'OTHER' },
            ]}
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-600">
            <tr>
              <th className="px-4 py-3">Applicant</th>
              <th className="px-4 py-3">Country & Service</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">CRM Lead Stage & Tracking</th>
              <th className="px-4 py-3">Submitted At</th>
              <th className="px-4 py-3 text-right">CRM Workspace</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {inquiries.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-500">
                  No visa inquiries found.
                </td>
              </tr>
            ) : (
              inquiries.map((inq: VisaInquiry) => (
                <tr key={inq.id} className="hover:bg-slate-50/70">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-900">{inq.fullName}</div>
                    <div className="text-xs text-slate-500">
                      {inq.phone} {inq.email ? `• ${inq.email}` : ''}
                    </div>
                    {inq.message && (
                      <p className="mt-1 line-clamp-1 max-w-xs text-xs text-slate-600">
                        “{inq.message}”
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900">
                      {inq.country?.flagEmoji} {inq.country?.name}
                    </div>
                    <div className="text-xs text-slate-500">{inq.visaService?.title}</div>
                  </td>
                  <td className="px-4 py-3">
                    <VisaCategoryBadge category={inq.category} />
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {inq.lead ? (
                      <div>
                        <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-0.5 font-semibold text-blue-700">
                          {inq.lead.stage}
                        </span>
                        {inq.lead.trackingCode && (
                          <div className="mt-1">
                            <Link
                              href={`/track-status?code=${inq.lead.trackingCode}`}
                              target="_blank"
                              className="font-mono font-semibold text-sky-700 hover:underline"
                            >
                              #{inq.lead.trackingCode} ↗
                            </Link>
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-400">Unlinked</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {new Date(inq.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {inq.leadId && (
                      <Link
                        href={`/dashboard/leads/${inq.leadId}`}
                        className="inline-flex items-center rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-600"
                      >
                        Open in Lead CRM →
                      </Link>
                    )}
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
