import Link from 'next/link';
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

const SORT_ORDER_OPTIONS = [
  { label: 'Descending', value: 'desc' },
  { label: 'Ascending', value: 'asc' },
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

  const leads = leadsRes?.data || [];

  return (
    <div>
      <ManagementPageHeader
        title="Multi-Sector Customer Leads & Visa Files"
        description="Manage Holiday Tours, Hajj & Umrah, Work Permit, and Student Visa files with automated checklists, AI drafts, and quotations."
        actionLabel="+ New Customer Inquiry"
        actionHref="/dashboard/leads/create"
      />

      <Card>
        <CardContent className="pt-6">
          {/* Reusable Search, Filter & Sort Toolbar */}
          <div className="mb-5 flex flex-wrap items-center gap-2.5">
            <SearchFilter
              paramName="search"
              placeholder="Search tracking code, name, phone, destination..."
            />
            <SelectFilter
              paramName="category"
              placeholder="All Sectors"
              options={CATEGORY_OPTIONS}
            />
            <SelectFilter
              paramName="eligibilityStatus"
              placeholder="All Eligibility"
              options={ELIGIBILITY_OPTIONS}
            />
            <SelectFilter
              paramName="stage"
              placeholder="All Stages"
              options={STAGE_OPTIONS}
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
            <SelectFilter
              paramName="sortOrder"
              placeholder="Order"
              options={SORT_ORDER_OPTIONS}
            />
            <ClearFiltersButton />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
                <tr>
                  <th className="py-3 px-4">Applicant & File ID</th>
                  <th className="py-3 px-4">Sector & Destination</th>
                  <th className="py-3 px-4">Budget / Eligibility</th>
                  <th className="py-3 px-4">Stage</th>
                  <th className="py-3 px-4">Counselor</th>
                  <th className="py-3 px-4 text-right">Workspace</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leads.map((lead) => {
                  const cat = lead.category ?? 'TOUR';
                  const sectorMeta = SECTOR_CATALOG[cat] ?? SECTOR_CATALOG.TOUR;
                  return (
                    <tr key={lead.id} className="hover:bg-slate-50">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-slate-900">
                            {lead.customerName}
                          </p>
                          {lead.trackingCode && (
                            <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-slate-700">
                              #{lead.trackingCode}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500">
                          {lead.customerPhone || lead.customerEmail || 'No contact'} •{' '}
                          {lead.source}
                        </p>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${sectorMeta.badgeColor}`}
                        >
                          {sectorMeta.shortLabel}
                        </span>
                        <p className="mt-1 font-medium text-slate-800">
                          {lead.destination || 'TBD'}
                        </p>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-medium text-slate-800">
                          {formatCurrency(lead.budget)}
                        </p>
                        {lead.eligibilityStatus ? (
                          <span
                            className={`mt-0.5 inline-block rounded px-1.5 py-0.5 text-[10px] font-bold ${
                              lead.eligibilityStatus === 'HIGH_MATCH'
                                ? 'bg-emerald-100 text-emerald-800'
                                : lead.eligibilityStatus === 'LOW_MATCH'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {String(lead.eligibilityStatus).replace(/_/g, ' ')}
                          </span>
                        ) : (
                          <p className="text-xs text-slate-400">
                            {formatDate(lead.travelStartDate)}
                          </p>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={lead.stage} />
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600">
                        {lead.assignedTo?.name || 'Unassigned'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link href={`/dashboard/leads/${lead.id}`}>
                          <Button variant="outline" size="sm">
                            Open File →
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
                {leads.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-10 text-center text-sm text-slate-500"
                    >
                      No leads matched your search or filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <TablePagination
            page={leadsRes?.meta?.page ?? 1}
            limit={leadsRes?.meta?.limit ?? 20}
            total={leadsRes?.meta?.total ?? 0}
            totalPages={leadsRes?.meta?.totalPages ?? 1}
          />
        </CardContent>
      </Card>
    </div>
  );
}
