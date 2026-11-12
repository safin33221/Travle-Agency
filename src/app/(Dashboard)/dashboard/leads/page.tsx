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

  const activeStage = resolvedParams.stage || '';
  const activeCategory = resolvedParams.category || '';

  return (
    <div className="space-y-5">
      <ManagementPageHeader
        title="Multi-Sector Customer Leads & Visa Files"
        description="Manage Holiday Tours, Hajj & Umrah, Work Permit, and Student Visa files with automated checklists, AI drafts, and quotations."
        actionLabel="+ New Customer Inquiry"
        actionHref="/dashboard/leads/create"
      >
        <Link href="/dashboard/visa-immigration/inquiries">
          <Button variant="outline" size="sm">
            Web Visa Inquiries →
          </Button>
        </Link>
      </ManagementPageHeader>

      {/* Quick 1-Click Stage & Sector Filter Tabs */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1">
              Stage:
            </span>
            <Link
              href={
                activeCategory
                  ? `/dashboard/leads?category=${activeCategory}`
                  : '/dashboard/leads'
              }
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                !activeStage
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Stages
            </Link>
            {STAGE_OPTIONS.map((st) => {
              const isSelected = activeStage === st.value;
              const qs = new URLSearchParams();
              if (activeCategory) qs.set('category', activeCategory);
              if (resolvedParams.search) qs.set('search', resolvedParams.search);
              qs.set('stage', st.value);
              return (
                <Link
                  key={st.value}
                  href={`/dashboard/leads?${qs.toString()}`}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                    isSelected
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st.label}
                </Link>
              );
            })}
          </div>

          <span className="text-xs font-medium text-slate-500">
            Showing <strong>{leadsRes.data.length}</strong> of{' '}
            <strong>{leadsRes.meta.total}</strong> files
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1">
            Sector:
          </span>
          <Link
            href={
              activeStage
                ? `/dashboard/leads?stage=${activeStage}`
                : '/dashboard/leads'
            }
            className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
              !activeCategory
                ? 'bg-slate-800 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Sectors
          </Link>
          {CATEGORY_OPTIONS.map((cat) => {
            const isSelected = activeCategory === cat.value;
            const qs = new URLSearchParams();
            if (activeStage) qs.set('stage', activeStage);
            if (resolvedParams.search) qs.set('search', resolvedParams.search);
            qs.set('category', cat.value);
            return (
              <Link
                key={cat.value}
                href={`/dashboard/leads?${qs.toString()}`}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                  isSelected
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.label}
              </Link>
            );
          })}
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          {/* Search, Filter & Sort Toolbar */}
          <div className="mb-5 flex flex-wrap items-center gap-2.5">
            <SearchFilter
              paramName="search"
              placeholder="Search tracking code (#SV-...), name, phone, destination..."
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
            <SelectFilter
              paramName="sortOrder"
              placeholder="Order"
              options={SORT_ORDER_OPTIONS}
            />
            <ClearFiltersButton />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50/70 text-xs uppercase text-slate-500">
                <tr>
                  <th className="py-3 px-4">Applicant & Tracking ID</th>
                  <th className="py-3 px-4">Sector & Destination</th>
                  <th className="py-3 px-4">File Progress</th>
                  <th className="py-3 px-4">Budget / Eligibility</th>
                  <th className="py-3 px-4">Stage</th>
                  <th className="py-3 px-4 text-right">Workspace</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
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
                      className="hover:bg-sky-50/30 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            href={`/dashboard/leads/${lead.id}`}
                            className="font-semibold text-slate-900 hover:text-sky-700 hover:underline"
                          >
                            {lead.customerName}
                          </Link>
                          {lead.trackingCode && (
                            <Link
                              href={`/track-status?code=${lead.trackingCode}`}
                              target="_blank"
                              title="Open Public Client Tracker"
                              className="rounded bg-sky-50 border border-sky-200 px-1.5 py-0.5 font-mono text-[11px] font-bold text-sky-700 hover:bg-sky-100"
                            >
                              #{lead.trackingCode} ↗
                            </Link>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {lead.customerPhone || lead.customerEmail || 'No contact'} •{' '}
                          <span className="font-medium">{lead.source}</span>
                        </p>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${sectorMeta.badgeColor}`}
                        >
                          {sectorMeta.shortLabel}
                        </span>
                        <p className="mt-1 font-medium text-slate-800 text-xs">
                          {lead.destination || 'TBD'}
                        </p>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="w-36 space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-600 font-medium">
                              Steps: {doneMilestones}/{milestones.length}
                            </span>
                            <span className="font-bold text-sky-700">
                              {milestonePct}%
                            </span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-emerald-500 transition-all"
                              style={{ width: `${milestonePct}%` }}
                            />
                          </div>
                          <p className="text-[11px] text-slate-500">
                            Docs: <strong>{verifiedDocs}</strong>/{docs.length} ready
                          </p>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-medium text-slate-800 text-xs">
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
                        <p className="text-[11px] text-slate-400 mt-1">
                          {lead.assignedTo?.name || 'Unassigned'}
                        </p>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link href={`/dashboard/leads/${lead.id}`}>
                          <Button variant="secondary" size="sm">
                            Open Workspace →
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
                {leadsRes.data.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-12 text-center text-sm text-slate-500"
                    >
                      <p className="font-semibold text-slate-700">
                        No customer files matched your current filters.
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        Try clearing the stage/sector filters or record a new inquiry.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <TablePagination
            page={leadsRes.meta.page}
            limit={leadsRes.meta.limit}
            total={leadsRes.meta.total}
            totalPages={leadsRes.meta.totalPages}
          />
        </CardContent>
      </Card>
    </div>
  );
}
