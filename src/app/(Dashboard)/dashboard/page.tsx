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
          subtitle={`NEW: ${byStage.NEW || 0} • QUALIFIED: ${byStage.QUALIFIED || 0}`}
          trend="neutral"
          icon="👥"
          href="/dashboard/leads"
        />
        <StatCard
          title="Approved Quotations"
          value={summary?.quotations?.approved ?? 0}
          subtitle={`${summary?.quotations?.draft ?? 0} drafts awaiting review`}
          trend="up"
          icon="📄"
          href="/dashboard/leads?stage=QUOTED"
        />
        <StatCard
          title="Confirmed Won Revenue"
          value={formatCurrency(summary?.quotations?.wonRevenue ?? '0')}
          subtitle={`From ${byStage.WON || 0} won customer files`}
          trend="up"
          icon="💰"
          href="/dashboard/leads?stage=WON"
        />
        <StatCard
          title="Pending Follow-Ups"
          value={summary?.followUps?.openCount ?? 0}
          subtitle={`${summary?.followUps?.overdueCount ?? 0} overdue reminders`}
          trend={(summary?.followUps?.overdueCount ?? 0) > 0 ? 'warning' : 'neutral'}
          icon="⏰"
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
                    className="group rounded-xl border border-slate-200 bg-white p-3.5 transition hover:border-sky-400 hover:bg-sky-50/30 hover:shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <StatusBadge status={st.key} />
                        <span className="text-xs font-semibold text-slate-400 group-hover:text-sky-600">
                          {pct}%
                        </span>
                      </div>
                      <p className="mt-2.5 text-2xl font-extrabold text-slate-900">
                        {count}
                      </p>
                    </div>
                    <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-sky-600 transition-all"
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
                    className={`flex items-center justify-between gap-3 rounded-lg border p-3 text-sm transition ${
                      isOverdue
                        ? 'border-rose-200 bg-rose-50/60 hover:bg-rose-50'
                        : 'border-slate-200 bg-slate-50/50 hover:bg-white'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-slate-900 truncate">
                          {task.lead?.customerName || 'Customer Inquiry'}
                        </p>
                        {isOverdue && (
                          <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-rose-700">
                            Overdue
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-1">
                        {task.note}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Due:{' '}
                        <strong className={isOverdue ? 'text-rose-700' : 'text-slate-700'}>
                          {formatDate(task.dueAt)}
                        </strong>{' '}
                        • {task.assignedTo?.name || 'Staff'}
                      </p>
                    </div>
                    {task.lead?.id && (
                      <Link href={`/dashboard/leads/${task.lead.id}`}>
                        <Button variant="outline" size="sm">
                          Open →
                        </Button>
                      </Link>
                    )}
                  </div>
                );
              })}
              {upcomingTasks.length === 0 && (
                <div className="rounded-lg border border-dashed border-slate-200 py-8 px-4 text-center">
                  <p className="text-sm font-medium text-slate-600">
                    All caught up! No pending follow-up reminders.
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    You can schedule follow-up dates inside any Lead Workspace.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Customer Files & Live Checklist Progress */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base">Recent Customer Files</CardTitle>
          <Link href="/dashboard/leads">
            <Button variant="outline" size="sm">
              View All →
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
                <tr>
                  <th className="py-2.5 px-3">Applicant & Tracking ID</th>
                  <th className="py-2.5 px-3">Sector & Destination</th>
                  <th className="py-2.5 px-3">Checklist Progress</th>
                  <th className="py-2.5 px-3">Stage</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
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
                    <tr key={lead.id} className="hover:bg-slate-50/80">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900">
                            {lead.customerName}
                          </span>
                          {lead.trackingCode && (
                            <Link
                              href={`/track-status?code=${lead.trackingCode}`}
                              target="_blank"
                              title="View on Public Tracker"
                              className="rounded bg-sky-50 border border-sky-200 px-1.5 py-0.5 font-mono text-[11px] font-bold text-sky-700 hover:bg-sky-100"
                            >
                              #{lead.trackingCode} ↗
                            </Link>
                          )}
                        </div>
                        <p className="text-xs text-slate-500">
                          {lead.customerPhone || lead.customerEmail || 'No contact'}
                        </p>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${sectorMeta.badgeColor}`}
                        >
                          {sectorMeta.shortLabel}
                        </span>
                        <p className="mt-0.5 text-xs font-medium text-slate-700">
                          {lead.destination || 'TBD'}
                        </p>
                      </td>
                      <td className="py-3 px-3 text-xs">
                        <div className="flex flex-col gap-1">
                          <span className="text-slate-700 font-medium">
                            🚀 Milestones: <strong>{doneMilestones}</strong>/{milestones.length} done
                          </span>
                          <span className="text-slate-500">
                            📋 Docs: <strong>{verifiedDocs}</strong>/{docs.length} ready
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <StatusBadge status={lead.stage} />
                      </td>
                      <td className="py-3 px-3 text-right">
                        <Link href={`/dashboard/leads/${lead.id}`}>
                          <Button variant="secondary" size="sm">
                            Manage File →
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
                      className="py-8 text-center text-sm text-slate-500"
                    >
                      No customer files recorded yet. Click &ldquo;+ Record New Inquiry&rdquo; to start.
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
