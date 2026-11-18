import Link from 'next/link';
import { Lock } from 'lucide-react';
import { getMe } from '@/services/auth/getMe';
import { ManagementPageHeader } from '@/components/shared/ManagementPageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';

export const instant = false;

export default async function MyProfilePage() {
  const user = await getMe();
  return (
    <div className="space-y-6">
      <ManagementPageHeader
        title="My Staff Profile"
        actionLabel="← Dashboard"
        actionHref="/dashboard"
      />

      <Card className="max-w-lg">
        <CardHeader className="border-b border-stone-100 pb-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-700 text-lg font-extrabold text-white">
              {(user?.name || 'S').charAt(0).toUpperCase()}
            </div>
            <div>
              <CardTitle className="text-lg">{user?.name}</CardTitle>
              <p className="text-xs text-stone-500">{user?.email}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pt-4 text-sm">
          <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
            <span className="text-stone-500">Role</span>
            <StatusBadge status={user?.role || 'SALES_AGENT'} />
          </div>
          <div className="flex items-center justify-between pb-2">
            <span className="text-stone-500">Status</span>
            <StatusBadge status={user?.status || 'ACTIVE'} />
          </div>

          <div className="pt-3 border-t border-stone-100 flex flex-wrap gap-2">
            <Link href="/change-password">
              <Button variant="outline" size="sm" className="gap-1.5">
                <Lock className="h-3.5 w-3.5 text-stone-500" />
                Change Password
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
    </div>
  );
}
