import React from 'react';
import Link from 'next/link';
import { getAdminCountriesAction } from '@/services/visa/visa.service';
import { CountryCoverageBadge } from '@/components/module/visa/VisaStatusBadges';
import { ArchiveCountryButton } from '@/components/module/visa/CountryActionsClient';
import { VisaSubNav } from '@/components/module/visa/VisaSubNav';
import SearchFilter from '@/components/shared/SearchFilter';
import SelectFilter from '@/components/shared/SelectFilter';
import TablePagination from '@/components/shared/TablePagination';
import { Country, CountryCoverageStatus } from '@/types/api';

export const instant = false;

export default async function AdminCountriesListPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const limit = Number(params.limit) || 10;
  const search = params.search || '';
  const coverageStatus = params.coverageStatus || '';

  const res = await getAdminCountriesAction({
    page,
    limit,
    search: search || undefined,
    coverageStatus: (coverageStatus as CountryCoverageStatus) || undefined,
  });

  const countries = res?.data || [];
  const meta = res?.meta || { page: 1, limit: 10, total: 0, totalPages: 1 };

  return (
    <div className="space-y-6">
      <VisaSubNav />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Destination Countries</h1>
        <Link
          href="/dashboard/visa-immigration/countries/create"
          className="rounded-xl bg-teal-700 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-800 transition shadow-xs"
        >
          + Add Country
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 rounded-2xl border border-stone-200/90 bg-white p-4 shadow-2xs sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <SearchFilter placeholder="Search by country name, ISO code, or slug..." />
        </div>
        <div className="flex items-center gap-3">
          <SelectFilter
            paramName="coverageStatus"
            placeholder="All Coverage Statuses"
            options={[
              { label: 'Active', value: 'ACTIVE' },
              { label: 'Limited', value: 'LIMITED' },
              { label: 'Paused', value: 'PAUSED' },
              { label: 'Archived', value: 'ARCHIVED' },
            ]}
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-2xs">
        <table className="min-w-full divide-y divide-stone-200 text-left text-sm">
          <thead className="bg-[#FAF9F6] text-[11px] font-bold uppercase tracking-wider text-stone-500">
            <tr>
              <th className="px-4 py-3">Country</th>
              <th className="px-4 py-3">ISO / Slug</th>
              <th className="px-4 py-3">Coverage Status</th>
              <th className="px-4 py-3">Featured</th>
              <th className="px-4 py-3">Services / Inquiries</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {countries.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-stone-500">
                  No countries found.
                </td>
              </tr>
            ) : (
              countries.map((country: Country) => (
                <tr key={country.id} className="hover:bg-[#FAF9F6]/70">
                  <td className="px-4 py-3 font-medium text-slate-900">
                    <div className="flex items-center gap-2.5">
                      <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-stone-200 bg-[#FAF9F6] text-xs font-bold uppercase text-stone-700">
                        {country.isoCode || country.name.slice(0, 2)}
                      </span>
                      <div>
                        <p className="font-semibold">{country.name}</p>
                        {country.shortIntro && (
                          <p className="line-clamp-1 max-w-xs text-xs text-stone-500">
                            {country.shortIntro}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-stone-600">
                    <span className="font-mono font-semibold text-slate-800">{country.isoCode}</span>
                    <div className="text-stone-400">/{country.slug}</div>
                  </td>
                  <td className="px-4 py-3">
                    <CountryCoverageBadge status={country.coverageStatus} />
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {country.isFeatured ? (
                      <span className="rounded-lg border border-amber-200 bg-amber-50/70 px-2 py-0.5 font-semibold text-amber-800">
                        Featured (#{country.displayOrder})
                      </span>
                    ) : (
                      <span className="text-stone-400">Standard (#{country.displayOrder})</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-stone-600 tabular-nums">
                    <span>{country._count?.visaServices ?? 0} Services</span>
                    <span className="mx-1.5">•</span>
                    <span>{country._count?.visaInquiries ?? 0} Inquiries</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/dashboard/visa-immigration/countries/${country.id}`}
                        className="rounded-lg border border-stone-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-800 hover:border-teal-600 hover:text-teal-800 transition"
                      >
                        Edit
                      </Link>
                      {country.coverageStatus !== 'ARCHIVED' && (
                        <ArchiveCountryButton countryId={country.id} />
                      )}
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
