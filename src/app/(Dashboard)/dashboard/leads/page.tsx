import Link from 'next/link';
import { getLeads } from '@/services/leads/leads.service';
import { ManagementPageHeader } from '@/components/shared/ManagementPageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '@/lib/utils';

export default async function DashboardLeadsPage() {
  const leadsRes = await getLeads({ limit: 50 });

  return (
    <div>
      <ManagementPageHeader
        title="Customer Leads CRM"
        description="Track inquiries, qualify requirements, draft AI replies, and issue approved quotations."
        actionLabel="+ New Customer Inquiry"
        actionHref="/dashboard/leads/create"
      />

      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
                <tr>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Destination & Dates</th>
                  <th className="py-3 px-4">Budget / Pax</th>
                  <th className="py-3 px-4">Stage</th>
                  <th className="py-3 px-4">Owner</th>
                  <th className="py-3 px-4 text-right">Workspace</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leadsRes.data.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-900">
                        {lead.customerName}
                      </p>
                      <p className="text-xs text-slate-500">
                        {lead.customerPhone || lead.customerEmail || 'No contact'} •{' '}
                        {lead.source}
                      </p>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-medium text-slate-800">
                        {lead.destination || 'TBD'}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatDate(lead.travelStartDate)}
                      </p>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-medium text-slate-800">
                        {formatCurrency(lead.budget)}
                      </p>
                      <p className="text-xs text-slate-500">
                        {lead.travelerCount || 1} Traveler(s)
                      </p>
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
                          Open Lead →
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
                {leadsRes.data.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-10 text-center text-sm text-slate-500"
                    >
                      No customer inquiries recorded yet. Click &ldquo;+ New Customer Inquiry&rdquo; to begin.
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
