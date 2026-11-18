import { notFound } from 'next/navigation';
import { getSingleLead } from '@/services/leads/leads.service';
import { getPackages } from '@/services/packages/packages.service';
import { getAdminVisaServicesAction } from '@/services/visa/visa.service';
import { isPackageCategory } from '@/config/brand.config';
import { ManagementPageHeader } from '@/components/shared/ManagementPageHeader';
import { LeadWorkspaceClient } from '@/components/module/leads/LeadWorkspaceClient';


export const instant = false;

export default async function LeadDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [lead, packagesRes, visaServicesRes] = await Promise.all([
    getSingleLead(id),
    getPackages({ limit: 50, isArchived: false }),
    getAdminVisaServicesAction({ limit: 50, publicationStatus: 'PUBLISHED' }),
  ]);

  if (!lead) {
    notFound();
  }

  const tourPackages = (packagesRes?.data || []).filter((pkg) =>
    isPackageCategory(pkg.category),
  );
  const visaServices = visaServicesRes?.data || [];

  return (
    <div>
      <ManagementPageHeader
        title={`${lead.customerName} — ${lead.destination || 'Travel Inquiry'}`}
        description={`Phone: ${lead.customerPhone || 'N/A'} • Email: ${lead.customerEmail || 'N/A'} • Travelers: ${lead.travelerCount || 1}`}
        actionLabel="← Back to Leads"
        actionHref="/dashboard/leads"
      />

      <LeadWorkspaceClient
        lead={lead}
        packages={tourPackages}
        visaServices={visaServices}
      />
    </div>
  );
}
