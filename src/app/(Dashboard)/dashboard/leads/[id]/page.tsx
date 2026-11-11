import { notFound } from 'next/navigation';
import { getSingleLead } from '@/services/leads/leads.service';
import { getPackages } from '@/services/packages/packages.service';
import { ManagementPageHeader } from '@/components/shared/ManagementPageHeader';
import { LeadWorkspaceClient } from '@/components/module/leads/LeadWorkspaceClient';

export const instant = false;

export default async function LeadDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [lead, packagesRes] = await Promise.all([
    getSingleLead(id),
    getPackages({ limit: 50, isArchived: false }),
  ]);

  if (!lead) {
    notFound();
  }

  return (
    <div>
      <ManagementPageHeader
        title={`${lead.customerName} — ${lead.destination || 'Travel Inquiry'}`}
        description={`Phone: ${lead.customerPhone || 'N/A'} • Email: ${lead.customerEmail || 'N/A'} • Travelers: ${lead.travelerCount || 1}`}
        actionLabel="← Back to Leads"
        actionHref="/dashboard/leads"
      />

      <LeadWorkspaceClient lead={lead} packages={packagesRes.data} />
    </div>
  );
}
