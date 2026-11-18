import Link from 'next/link';
import { ExternalLink, MessageSquare, Phone } from 'lucide-react';
import { getLeads } from '@/services/leads/leads.service';
import { ManagementPageHeader } from '@/components/shared/ManagementPageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { SearchFilter } from '@/components/shared/SearchFilter';
import { SelectFilter } from '@/components/shared/SelectFilter';
import { ClearFiltersButton } from '@/components/shared/ClearFiltersButton';
import { TablePagination } from '@/components/shared/TablePagination';
import { formatCurrency, formatDate } from '@/lib/utils';
import { SECTOR_CATALOG } from '@/config/brand.config';
import { LeadSource, LeadStage, ServiceCategory } from '@/types/api';

export const instant = false;

interface LeadsPageProps {
  searchParams?: Promise<{
    page?: string;
    limit?: string;
    search?: string;
    category?: ServiceCategory;
    eligibilityStatus?: string;
    stage?: LeadStage;
    source?: LeadSource;
    destination?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }>;
}

const CATEGORY_OPTIONS = [
  { label: 'Holiday Tour', value: 'TOUR' },
  { label: 'Hajj & Umrah', value: 'HAJJ_UMRAH' },
  { label: 'Work Permit', value: 'WORK_PERMIT' },
  { label: 'Student Visa', value: 'STUDENT_VISA' },
];

const ELIGIBILITY_OPTIONS = [
  { label: 'High Match', value: 'HIGH_MATCH' },
  { label: 'Conditional Match', value: 'CONDITIONAL_MATCH' },
  { label: 'Low Match', value: 'LOW_MATCH' },
];

const STAGE_OPTIONS = [
  { label: 'New', value: 'NEW' },
  { label: 'Qualified', value: 'QUALIFIED' },
  { label: 'Quoted', value: 'QUOTED' },
  { label: 'Follow Up', value: 'FOLLOW_UP' },
  { label: 'Won', value: 'WON' },
  { label: 'Lost', value: 'LOST' },
];

const SOURCE_OPTIONS = [
  { label: 'Phone', value: 'PHONE' },
  { label: 'WhatsApp', value: 'WHATSAPP' },
  { label: 'Messenger', value: 'MESSENGER' },
  { label: 'Website', value: 'WEBSITE' },
  { label: 'Walk-in', value: 'WALK_IN' },
  { label: 'Other', value: 'OTHER' },
];

const SORT_BY_OPTIONS = [
  { label: 'Newest First', value: 'createdAt' },
  { label: 'Customer Name', value: 'customerName' },
  { label: 'Budget', value: 'budget' },
  { label: 'Travel Date', value: 'travelStartDate' },
  { label: 'Stage', value: 'stage' },
];

export default async function DashboardLeadsPage({
  searchParams,
}: LeadsPageProps) {
  const resolvedParams = (await searchParams) ?? {};
  const page = Math.max(1, Number(resolvedParams.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(resolvedParams.limit) || 20));

  const leadsRes = await getLeads({
    page,
    limit,
    search: resolvedParams.search,
    category: resolvedParams.category,
    eligibilityStatus: resolvedParams.eligibilityStatus,
    stage: resolvedParams.stage,
    source: resolvedParams.source,
    destination: resolvedParams.destination,
    sortBy: resolvedParams.sortBy,
    sortOrder: resolvedParams.sortOrder,
  });

  return (
    <div className="space-y-5">
      <ManagementPageHeader
        title="Leads & Visa Files"
        actionLabel="+ New Customer Inquiry"
        actionHref="/dashboard/leads/create"
      >
        <Link href="/dashboard/visa-immigration/inquiries">
          <Button variant="outline" size="sm">
            Web Visa Inquiries →
          </Button>
        </Link>
      </ManagementPageHeader>

      <Card className="overflow-hidden border-stone-200/90 shadow-2xs">
        <CardContent className="p-0">
          {/* Clean Single-Row Search & Filter Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-stone-200 bg-stone-50/50 p-4">
            <div className="flex flex-1 flex-wrap items-center gap-2">
              <SearchFilter
                paramName="search"
                placeholder="Search name, phone, #code, destination..."
                className="min-w-[210px] max-w-sm"
              />
              <SelectFilter
                paramName="category"
                placeholder="All Sectors"
                options={CATEGORY_OPTIONS}
              />
              <SelectFilter
                paramName="stage"
                placeholder="All Stages"
                options={STAGE_OPTIONS}
              />
              <SelectFilter
                paramName="eligibilityStatus"
                placeholder="All Eligibility"
                options={ELIGIBILITY_OPTIONS}
              />
              <SelectFilter
                paramName="source"
                placeholder="All Sources"
                options={SOURCE_OPTIONS}
              />
              <SelectFilter
                paramName="sortBy"
                placeholder="Sort By"
                options={SORT_BY_OPTIONS}
              />
              <ClearFiltersButton />
            </div>

            <span className="text-xs font-medium text-stone-500 whitespace-nowrap">
              {leadsRes.data.length} of <strong className="text-slate-800">{leadsRes.meta.total}</strong> files
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="border-b border-stone-200 bg-stone-50/80 text-[11px] font-semibold uppercase tracking-wider text-stone-500">
                <tr>
                  <th className="py-3 pl-5 pr-3">Applicant</th>
                  <th className="py-3 px-3">File ID & Source</th>
                  <th className="py-3 px-3">Sector & Destination</th>
                  <th className="py-3 px-3">Progress</th>
                  <th className="py-3 px-3">Budget & Match</th>
                  <th className="py-3 px-3">Stage & Owner</th>
                  <th className="py-3 pl-3 pr-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 bg-white">
                {leadsRes.data.map((lead) => {
                  const cat = lead.category ?? 'TOUR';
                  const sectorMeta = SECTOR_CATALOG[cat] ?? SECTOR_CATALOG.TOUR;
                  const milestones = lead.milestoneChecklist || [];
                  const doneMilestones = milestones.filter(
                    (m) => m.status === 'DONE',
                  ).length;
                  const docs = lead.documentChecklist || [];
                  const verifiedDocs = docs.filter(
                    (d) => d.status === 'VERIFIED' || d.status === 'RECEIVED',
                  ).length;
                  const milestonePct =
                    milestones.length > 0
                      ? Math.round((doneMilestones / milestones.length) * 100)
                      : 0;

                  return (
                    <tr
                      key={lead.id}
                      className="group hover:bg-stone-50/70 transition-colors align-middle"
                    >
                      {/* 1. Applicant & Direct Contact */}
                      <td className="py-4 pl-5 pr-3 min-w-[215px]">
                        <Link
                          href={`/dashboard/leads/${lead.id}`}
                          className="block font-semibold text-slate-900 group-hover:text-teal-700 hover:underline truncate max-w-[220px]"
                        >
                          {lead.customerName}
                        </Link>
                        <div className="mt-1 flex items-center gap-1.5 text-xs text-stone-500 whitespace-nowrap">
                          <span className="truncate max-w-[135px]">
                            {lead.customerPhone || lead.customerEmail || 'No contact'}
                          </span>
                          {lead.customerPhone && (
                            <span className="inline-flex items-center gap-1 shrink-0">
                              <a
                                href={`tel:${lead.customerPhone.replace(/\s+/g, '')}`}
                                title="Call customer"
                                className="inline-flex h-5 w-5 items-center justify-center rounded border border-stone-200 bg-white text-stone-600 hover:border-teal-600/40 hover:text-teal-700"
                              >
                                <Phone className="h-3 w-3" />
                              </a>
                              <a
                                href={`https://wa.me/${lead.customerPhone.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="WhatsApp customer"
                                className="inline-flex h-5 w-5 items-center justify-center rounded border border-stone-200 bg-white text-teal-700 hover:border-teal-600/40 hover:bg-teal-50"
                              >
                                <MessageSquare className="h-3 w-3" />
                              </a>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 2. File Tracking ID & Source */}
                      <td className="py-4 px-3 whitespace-nowrap">
                        {lead.trackingCode ? (
                          <Link
                            href={`/track-status?code=${lead.trackingCode}`}
                            target="_blank"
                            title="Open Public Client Tracker"
                            className="inline-flex items-center gap-1 rounded-md bg-stone-100 border border-stone-200 px-2 py-0.5 font-mono text-[11px] font-semibold text-slate-700 hover:border-teal-600/40 hover:text-teal-800"
                          >
                            <span>#{lead.trackingCode}</span>
                            <ExternalLink className="h-2.5 w-2.5 text-stone-400" />
                          </Link>
                        ) : (
                          <span className="text-xs text-stone-400">—</span>
                        )}
                        <p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-stone-400">
                          {lead.source}
                        </p>
                      </td>

                      {/* 3. Sector & Destination */}
                      <td className="py-4 px-3 max-w-[190px]">
                        <span
                          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium whitespace-nowrap ${sectorMeta.badgeColor}`}
                        >
                          {sectorMeta.shortLabel}
                        </span>
                        <p
                          title={lead.destination || 'TBD'}
                          className="mt-1 text-slate-700 text-xs truncate"
                        >
                          {lead.destination || 'TBD'}
                        </p>
                      </td>

                      {/* 4. Progress */}
                      <td className="py-4 px-3 w-[155px]">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-stone-600">
                              Steps {doneMilestones}/{milestones.length}
                            </span>
                            <span className="font-semibold text-teal-700 tabular-nums">
                              {milestonePct}%
                            </span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-stone-200/70 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-teal-700 transition-all"
                              style={{ width: `${milestonePct}%` }}
                            />
                          </div>
                          <p className="text-[11px] text-stone-500">
                            Docs <strong className="text-slate-700">{verifiedDocs}</strong>/{docs.length}
                          </p>
                        </div>
                      </td>

                      {/* 5. Budget & Match */}
                      <td className="py-4 px-3 whitespace-nowrap">
                        <p className="font-semibold text-slate-900 text-xs tabular-nums">
                          {formatCurrency(lead.budget)}
                        </p>
                        {lead.eligibilityStatus ? (
                          <span className="mt-1 inline-block text-[11px] font-medium text-stone-500">
                            {String(lead.eligibilityStatus).replace(/_/g, ' ')}
                          </span>
                        ) : lead.travelStartDate ? (
                          <p className="mt-1 text-[11px] text-stone-400">
                            {formatDate(lead.travelStartDate)}
                          </p>
                        ) : null}
                      </td>

                      {/* 6. Stage & Counselor */}
                      <td className="py-4 px-3 whitespace-nowrap">
                        <StatusBadge status={lead.stage} />
                        <p className="text-[11px] text-stone-500 mt-1 truncate max-w-[120px]">
                          {lead.assignedTo?.name || 'Unassigned'}
                        </p>
                      </td>

                      {/* 7. Action */}
                      <td className="py-4 pl-3 pr-5 text-right whitespace-nowrap">
                        <Link href={`/dashboard/leads/${lead.id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="whitespace-nowrap hover:border-teal-600/50 hover:text-teal-800"
                          >
                            Open →
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
                {leadsRes.data.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-12 text-center text-sm text-stone-500"
                    >
                      No customer files matched your current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="px-4 pb-4">
            <TablePagination
              page={leadsRes.meta.page}
              limit={leadsRes.meta.limit}
              total={leadsRes.meta.total}
              totalPages={leadsRes.meta.totalPages}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
