import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { getMe } from '@/services/auth/getMe';
import { getSingleLead } from '@/services/leads/leads.service';
import { getPackages } from '@/services/packages/packages.service';
import { getAdminVisaServicesAction } from '@/services/visa/visa.service';
import { isPackageCategory } from '@/config/brand.config';
import { LeadWorkspaceClient } from '@/components/module/leads/LeadWorkspaceClient';


export const instant = false;

export default async function LeadDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [lead, packagesRes, visaServicesRes, user] = await Promise.all([
    getSingleLead(id),
    getPackages({ limit: 50, isArchived: false }),
    getAdminVisaServicesAction({ limit: 50, publicationStatus: 'PUBLISHED' }),
    getMe(),
  ]);

  if (!lead) {
    notFound();
  }

  const tourPackages = (packagesRes?.data || []).filter((pkg) =>
    isPackageCategory(pkg.category),
  );
  const visaServices = visaServicesRes?.data || [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href="/dashboard/leads"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-teal-700 transition mb-1"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Leads & Visa Files
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {lead.customerName}
          </h1>
        </div>
      </div>

      <LeadWorkspaceClient
        lead={lead}
        packages={tourPackages}
        visaServices={visaServices}
        userRole={user?.role || 'SALES_AGENT'}
      />
    </div>
  );
}
