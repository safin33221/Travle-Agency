import Link from 'next/link';
import { getDashboardSummary } from '@/services/dashboard/dashboard.service';
import { ManagementPageHeader } from '@/components/shared/ManagementPageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '@/lib/utils';

export const instant = false;

export default async function DashboardOverviewPage() {
  const summary = await getDashboardSummary();
  const upcomingTasks = summary?.followUps?.upcomingTasks || [];
  const stageEntries = Object.entries(summary?.leads?.byStage || {});

  return (
    <div className="space-y-6">
      <ManagementPageHeader
        title="Agency Operations Overview"
        description="Real-time lead pipeline, quotation revenue, and pending manual follow-up tasks."
        actionLabel="+ Record New Lead"
        actionHref="/dashboard/leads/create"
      />

      {/* Top KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Inquiries (Leads)"
          value={summary?.leads?.total ?? 0}
          subtitle={`NEW: ${summary?.leads?.byStage?.NEW || 0} • QUALIFIED: ${summary?.leads?.byStage?.QUALIFIED || 0}`}
          trend="neutral"
        />
        <StatCard
          title="Approved Quotations"
          value={summary?.quotations?.approved ?? 0}
          subtitle={`${summary?.quotations?.draft ?? 0} drafts awaiting review`}
          trend="up"
        />
        <StatCard
          title="Won Quote Value"
          value={formatCurrency(summary?.quotations?.wonRevenue ?? '0')}
          subtitle={`From ${summary?.leads?.byStage?.WON || 0} won leads`}
          trend="up"
        />
        <StatCard
          title="Pending Follow-Ups"
          value={summary?.followUps?.openCount ?? 0}
          subtitle={`${summary?.followUps?.overdueCount ?? 0} overdue tasks`}
          trend={(summary?.followUps?.overdueCount ?? 0) > 0 ? 'warning' : 'neutral'}
        />
      </div>

      {/* Pipeline Breakdown & Upcoming Follow-ups */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Lead Stage Pipeline Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {stageEntries.map(([stage, count]) => (
                <div
                  key={stage}
                  className="rounded-lg border border-slate-200 p-3 flex flex-col justify-between"
                >
                  <StatusBadge status={stage} />
                  <p className="mt-3 text-2xl font-bold text-slate-900">
                    {count}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">
              Upcoming Follow-Up Tasks
            </CardTitle>
            <Link href="/dashboard/leads">
              <Button variant="ghost" size="sm">
                View All Leads →
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between rounded-lg border border-slate-200 p-3 text-sm"
                >
                  <div>
                    <p className="font-semibold text-slate-900">
                      {task.lead?.customerName || 'Lead Inquiry'}
                    </p>
                    <p className="text-xs text-slate-600">{task.note}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Due: {formatDate(task.dueAt)} • Assigned:{' '}
                      {task.assignedTo?.name || 'Staff'}
                    </p>
                  </div>
                  {task.lead?.id && (
                    <Link href={`/dashboard/leads/${task.lead.id}`}>
                      <Button variant="outline" size="sm">
                        Open Lead
                      </Button>
                    </Link>
                  )}
                </div>
              ))}
              {upcomingTasks.length === 0 && (
                <p className="text-sm text-slate-500 py-6 text-center">
                  No pending follow-up tasks scheduled.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
