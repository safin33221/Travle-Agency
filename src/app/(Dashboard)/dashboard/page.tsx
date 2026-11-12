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
  hint: string;
}> = [
  { key: 'NEW', label: 'New Inquiries', hint: 'Needs initial call & qualification' },
  { key: 'QUALIFIED', label: 'Qualified Files', hint: 'Collecting documents & preferences' },
  { key: 'QUOTED', label: 'Quotation Sent', hint: 'Awaiting client price approval' },
  { key: 'FOLLOW_UP', label: 'In Follow-Up', hint: 'Active visa/package processing' },
  { key: 'WON', label: 'Won / Confirmed', hint: 'Payment & file finalized' },
  { key: 'LOST', label: 'Closed / Lost', hint: 'Archived or cancelled inquiry' },
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
        title="Agency Operations Command Center"
        description="Monitor live customer inquiries, visa & tour file checklists, quotation revenue, and pending follow-ups."
        actionLabel="+ Record New Inquiry"
        actionHref="/dashboard/leads/create"
      >
        <Link href="/dashboard/leads">
          <Button variant="outline">Open All Leads →</Button>
        </Link>
      </ManagementPageHeader>

      {/* End-to-End Agency Workflow Guide */}
      <div className="rounded-xl border border-sky-200 bg-gradient-to-r from-sky-50/90 via-white to-indigo-50/60 p-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-sky-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
              Quick Workflow Guide
            </span>
            <h2 className="text-xs font-bold text-slate-800">
              How Customer Inquiries Move Through Your Agency Workspace
            </h2>
          </div>
          <Link
            href="/track-status"
            target="_blank"
            className="text-xs font-semibold text-sky-700 hover:underline"
          >
            Test Public File Tracker ↗
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/dashboard/leads/create"
            className="group rounded-lg border border-slate-200/90 bg-white p-3 transition hover:border-sky-300 hover:shadow-xs"
          >
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sky-100 text-[11px] font-bold text-sky-700">
                1
              </span>
              <p className="text-xs font-bold text-slate-900 group-hover:text-sky-700">
                Capture Inquiry & File ID
              </p>
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              Website forms or staff entry auto-generate a tracking code (e.g.{' '}
              <code className="font-mono text-slate-700">#SV-820383</code>).
            </p>
          </Link>

          <Link
            href="/dashboard/leads"
            className="group rounded-lg border border-slate-200/90 bg-white p-3 transition hover:border-sky-300 hover:shadow-xs"
          >
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-[11px] font-bold text-emerald-700">
                2
              </span>
              <p className="text-xs font-bold text-slate-900 group-hover:text-sky-700">
                Verify Docs & Milestones
              </p>
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              Open any lead file to mark documents <span className="font-medium">VERIFIED</span> and advance visa/tour milestones.
            </p>
          </Link>

          <Link
            href="/dashboard/ai-copilot"
            className="group rounded-lg border border-slate-200/90 bg-white p-3 transition hover:border-sky-300 hover:shadow-xs"
          >
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 text-[11px] font-bold text-amber-800">
                3
              </span>
              <p className="text-xs font-bold text-slate-900 group-hover:text-sky-700">
                AI Draft & Quotation PDF
              </p>
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              Draft Bangla/English replies or missing-doc reminders and issue itemized quotations.
            </p>
          </Link>

          <Link
            href="/track-status"
            target="_blank"
            className="group rounded-lg border border-slate-200/90 bg-white p-3 transition hover:border-sky-300 hover:shadow-xs"
          >
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-[11px] font-bold text-indigo-700">
                4
              </span>
              <p className="text-xs font-bold text-slate-900 group-hover:text-sky-700">
                24/7 Client Live Tracker
              </p>
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              Applicants enter their tracking code on <span className="font-mono">/track-status</span> to see live updates.
            </p>
          </Link>
        </div>
      </div>

      {/* Top KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Customer Files"
          value={totalLeads}
          subtitle={`NEW: ${byStage.NEW || 0} • QUALIFIED: ${byStage.QUALIFIED || 0}`}
          trend="neutral"
        />
        <StatCard
          title="Approved Quotations"
          value={summary?.quotations?.approved ?? 0}
          subtitle={`${summary?.quotations?.draft ?? 0} drafts awaiting review`}
          trend="up"
        />
        <StatCard
          title="Confirmed Won Revenue"
          value={formatCurrency(summary?.quotations?.wonRevenue ?? '0')}
          subtitle={`From ${byStage.WON || 0} won customer files`}
          trend="up"
        />
        <StatCard
          title="Pending Follow-Ups"
          value={summary?.followUps?.openCount ?? 0}
          subtitle={`${summary?.followUps?.overdueCount ?? 0} overdue reminders`}
          trend={(summary?.followUps?.overdueCount ?? 0) > 0 ? 'warning' : 'neutral'}
        />
      </div>

      {/* Interactive Stage Pipeline & Upcoming Follow-ups */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <Card className="lg:col-span-7">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base">
                Interactive Lead Pipeline (Click Stage to Filter)
              </CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Click any stage card below to view those specific customer files
              </p>
            </div>
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
                      <p className="mt-0.5 text-[11px] text-slate-500">
                        {st.hint}
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
            <div>
              <CardTitle className="text-base">
                Upcoming Follow-Up Reminders
              </CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Scheduled callbacks & document collection tasks
              </p>
            </div>
            <Link href="/dashboard/leads">
              <Button variant="ghost" size="sm">
                Manage →
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-2.5">
              {upcomingTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50/50 p-3 text-sm hover:bg-white transition"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 truncate">
                      {task.lead?.customerName || 'Customer Inquiry'}
                    </p>
                    <p className="text-xs text-slate-600 line-clamp-1">
                      {task.note}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Due: <strong className="text-slate-600">{formatDate(task.dueAt)}</strong> •{' '}
                      {task.assignedTo?.name || 'Staff'}
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
              ))}
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
          <div>
            <CardTitle className="text-base">
              Recent Customer Files & Checklist Readiness
            </CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              Latest inquiries with real-time milestone and document verification progress
            </p>
          </div>
          <Link href="/dashboard/leads">
            <Button variant="outline" size="sm">
              View Full Pipeline →
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
