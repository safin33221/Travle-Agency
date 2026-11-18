import Link from 'next/link';
import { getDashboardSummary } from '@/services/dashboard/dashboard.service';
import { getLeads } from '@/services/leads/leads.service';
import { ManagementPageHeader } from '@/components/shared/ManagementPageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { SECTOR_CATALOG } from '@/config/brand.config';
import { formatCurrency, formatDate } from '@/lib/utils';
import { LeadStage } from '@/types/api';

export const instant = false;

const ORDERED_STAGES: ReadonlyArray<{
  key: LeadStage;
  label: string;
}> = [
  { key: 'NEW', label: 'New Inquiries' },
  { key: 'QUALIFIED', label: 'Qualified Files' },
  { key: 'QUOTED', label: 'Quotation Sent' },
  { key: 'FOLLOW_UP', label: 'In Follow-Up' },
  { key: 'WON', label: 'Won / Confirmed' },
  { key: 'LOST', label: 'Closed / Lost' },
];

export default async function DashboardOverviewPage() {
  const [summary, recentLeadsRes] = await Promise.all([
    getDashboardSummary(),
    getLeads({ page: 1, limit: 5, sortBy: 'createdAt', sortOrder: 'desc' }),
  ]);

  const totalLeads = summary?.leads?.total ?? 0;
  const byStage: Partial<Record<LeadStage, number>> = summary?.leads?.byStage || {};
  const upcomingTasks = summary?.followUps?.upcomingTasks || [];
  const recentLeads = recentLeadsRes?.data || [];

  return (
    <div className="space-y-6">
      <ManagementPageHeader
        title="Operations Overview"
        actionLabel="+ Record New Inquiry"
        actionHref="/dashboard/leads/create"
      >
        <Link href="/dashboard/leads">
          <Button variant="outline">All Leads →</Button>
        </Link>
      </ManagementPageHeader>

      {/* Top KPI Cards (Clickable to jump straight to filtered queues) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Customer Files"
          value={totalLeads}
          subtitle={`New: ${byStage.NEW || 0} · Qualified: ${byStage.QUALIFIED || 0}`}
          trend="neutral"
          iconName="leads"
          href="/dashboard/leads"
        />
        <StatCard
          title="Approved Quotations"
          value={summary?.quotations?.approved ?? 0}
          subtitle={`${summary?.quotations?.draft ?? 0} drafts pending`}
          trend="up"
          iconName="quotes"
          href="/dashboard/leads?stage=QUOTED"
        />
        <StatCard
          title="Confirmed Won Revenue"
          value={formatCurrency(summary?.quotations?.wonRevenue ?? '0')}
          subtitle={`From ${byStage.WON || 0} won files`}
          trend="up"
          iconName="revenue"
          href="/dashboard/leads?stage=WON"
        />
        <StatCard
          title="Pending Follow-Ups"
          value={summary?.followUps?.openCount ?? 0}
          subtitle={`${summary?.followUps?.overdueCount ?? 0} overdue`}
          trend={(summary?.followUps?.overdueCount ?? 0) > 0 ? 'warning' : 'neutral'}
          iconName="followups"
          href="/dashboard/leads?stage=FOLLOW_UP"
        />
      </div>

      {/* Interactive Stage Pipeline & Upcoming Follow-ups */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <Card className="lg:col-span-7">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Lead Pipeline</CardTitle>
            <Link href="/dashboard/leads">
              <Button variant="ghost" size="sm">
                All Files ({totalLeads}) →
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
              {ORDERED_STAGES.map((st) => {
                const count = Number(byStage[st.key] ?? 0);
                const pct =
                  totalLeads > 0 ? Math.round((count / totalLeads) * 100) : 0;
                return (
                  <Link
                    key={st.key}
                    href={`/dashboard/leads?stage=${st.key}`}
                    className="group rounded-xl border border-stone-200/90 bg-stone-50/40 p-3.5 transition hover:border-teal-600/40 hover:bg-white flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <StatusBadge status={st.key} />
                        <span className="text-xs font-medium text-stone-400 group-hover:text-teal-700 tabular-nums">
                          {pct}%
                        </span>
                      </div>
                      <p className="mt-3 text-2xl font-bold text-slate-900 tabular-nums">
                        {count}
                      </p>
                    </div>
                    <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-stone-200/70">
                      <div
                        className="h-full rounded-full bg-teal-700 transition-all"
                        style={{ width: `${Math.max(count > 0 ? 8 : 0, pct)}%` }}
                      />
                    </div>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-5">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Upcoming Follow-Ups</CardTitle>
            <Link href="/dashboard/leads">
              <Button variant="ghost" size="sm">
                Manage →
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-2.5">
              {upcomingTasks.map((task) => {
                const isOverdue = Boolean(task.isOverdue);
                return (
                  <div
                    key={task.id}
                    className={`flex items-center justify-between gap-3 rounded-xl border p-3 text-sm transition ${
                      isOverdue
                        ? 'border-rose-200 bg-rose-50/50 hover:bg-rose-50/80'
                        : 'border-stone-200/90 bg-stone-50/40 hover:bg-white'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-slate-900 truncate">
                          {task.lead?.customerName || 'Customer Inquiry'}
                        </p>
                        {isOverdue && (
                          <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold text-rose-700">
                            Overdue
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-stone-600 line-clamp-1">
                        {task.note}
                      </p>
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        Due{' '}
                        <strong className={isOverdue ? 'text-rose-700' : 'text-slate-700'}>
                          {formatDate(task.dueAt)}
                        </strong>{' '}
                        · {task.assignedTo?.name || 'Staff'}
                      </p>
                    </div>
                    {task.lead?.id && (
                      <Link href={`/dashboard/leads/${task.lead.id}`}>
                        <Button variant="outline" size="sm">
                          Open
                        </Button>
                      </Link>
                    )}
                  </div>
                );
              })}
              {upcomingTasks.length === 0 && (
                <div className="rounded-xl border border-dashed border-stone-200 py-8 px-4 text-center">
                  <p className="text-sm font-medium text-stone-600">
                    No pending follow-up reminders.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Customer Files */}
      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-stone-100">
          <CardTitle className="text-base">Recent Customer Files</CardTitle>
          <Link href="/dashboard/leads">
            <Button variant="ghost" size="sm">
              View All →
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-stone-200 bg-stone-50/70 text-[11px] font-semibold uppercase tracking-wider text-stone-500">
                <tr>
                  <th className="py-3 pl-6 pr-3">Applicant & Code</th>
                  <th className="py-3 px-3">Sector & Destination</th>
                  <th className="py-3 px-3">Progress</th>
                  <th className="py-3 px-3">Stage</th>
                  <th className="py-3 pl-3 pr-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {recentLeads.map((lead) => {
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

                  return (
                    <tr key={lead.id} className="hover:bg-stone-50/70 transition-colors">
                      <td className="py-3.5 pl-6 pr-3">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/dashboard/leads/${lead.id}`}
                            className="font-semibold text-slate-900 hover:text-teal-700"
                          >
                            {lead.customerName}
                          </Link>
                          {lead.trackingCode && (
                            <Link
                              href={`/track-status?code=${lead.trackingCode}`}
                              target="_blank"
                              className="rounded-md bg-stone-100 border border-stone-200 px-1.5 py-0.5 font-mono text-[11px] font-medium text-slate-600 hover:border-teal-600/40 hover:text-teal-800"
                            >
                              #{lead.trackingCode}
                            </Link>
                          )}
                        </div>
                        <p className="text-xs text-stone-500 mt-0.5">
                          {lead.customerPhone || lead.customerEmail || 'No contact'}
                        </p>
                      </td>
                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${sectorMeta.badgeColor}`}
                        >
                          {sectorMeta.shortLabel}
                        </span>
                        <p className="mt-1 text-xs text-stone-600">
                          {lead.destination || 'TBD'}
                        </p>
                      </td>
                      <td className="py-3.5 px-3 text-xs text-stone-600">
                        <span>
                          Steps <strong className="text-slate-900">{doneMilestones}</strong>/{milestones.length}
                        </span>
                        <span className="mx-1.5 text-stone-300">·</span>
                        <span>
                          Docs <strong className="text-slate-900">{verifiedDocs}</strong>/{docs.length}
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        <StatusBadge status={lead.stage} />
                      </td>
                      <td className="py-3.5 pl-3 pr-6 text-right">
                        <Link href={`/dashboard/leads/${lead.id}`}>
                          <Button variant="outline" size="sm">
                            Open →
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
                {recentLeads.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-8 text-center text-sm text-stone-500"
                    >
                      No customer files recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
