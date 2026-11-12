import Link from 'next/link';
import { getMe } from '@/services/auth/getMe';
import { ManagementPageHeader } from '@/components/shared/ManagementPageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';

export const instant = false;

export default async function MyProfilePage() {
  const user = await getMe();
  const isAdmin = user?.role === 'OWNER_ADMIN';

  return (
    <div className="space-y-6">
      <ManagementPageHeader
        title="My Staff Profile & Access Permissions"
        description="Authenticated staff identity, assigned agency role, and workspace capabilities."
        actionLabel="← Back to Dashboard"
        actionHref="/dashboard"
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <Card className="lg:col-span-5">
          <CardHeader className="border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-600 text-lg font-extrabold text-white">
                {(user?.name || 'S').charAt(0).toUpperCase()}
              </div>
              <div>
                <CardTitle className="text-lg">{user?.name}</CardTitle>
                <p className="text-xs text-slate-500">{user?.email}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-4 text-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <span className="text-slate-500">Staff ID:</span>
              <span className="font-mono text-xs text-slate-700">
                {user?.id?.slice(0, 12) || 'N/A'}...
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <span className="text-slate-500">Assigned Role:</span>
              <StatusBadge status={user?.role || 'SALES_AGENT'} />
            </div>
            <div className="flex items-center justify-between pb-2">
              <span className="text-slate-500">Account Status:</span>
              <StatusBadge status={user?.status || 'ACTIVE'} />
            </div>

            <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-2">
              <Link href="/change-password">
                <Button variant="outline" size="sm">
                  🔒 Change Password
                </Button>
              </Link>
              <Link href="/dashboard/leads">
                <Button variant="secondary" size="sm">
                  Open Leads Pipeline →
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-7">
          <CardHeader>
            <CardTitle className="text-base">
              Workspace Capabilities for {isAdmin ? 'Owner / Admin' : 'Sales Counselor'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-slate-600">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3">
                <p className="font-bold text-slate-900">✓ Customer Leads & Checklists</p>
                <p className="mt-1">
                  Create inquiries, update stages, verify documents, and advance visa/package milestones synced to <code className="font-mono">/track-status</code>.
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3">
                <p className="font-bold text-slate-900">✓ AI Copilot & Quotations</p>
                <p className="mt-1">
                  Generate Bangla/English replies grounded in approved packages and issue itemized PDF quotations.
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3">
                <p className="font-bold text-slate-900">✓ Visa & Immigration Hub</p>
                <p className="mt-1">
                  Manage destination countries, visa service rules, document requirements, and public visa consultation requests.
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3">
                <p className="font-bold text-slate-900">
                  {isAdmin ? '✓ Full Admin & RBAC Governance' : 'ℹ️ Admin-Only Controls'}
                </p>
                <p className="mt-1">
                  {isAdmin
                    ? 'Create/archive packages, manage staff accounts, configure tax/currency defaults, and inspect immutable audit logs.'
                    : 'Package creation, staff provisioning, and agency tax settings are restricted to OWNER_ADMIN accounts.'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
