import { getMe } from '@/services/auth/getMe';
import { ManagementPageHeader } from '@/components/shared/ManagementPageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/shared/StatusBadge';

export const instant = false;

export default async function MyProfilePage() {
  const user = await getMe();

  return (
    <div>
      <ManagementPageHeader
        title="My Staff Profile"
        description="Authenticated staff identity and assigned agency role."
      />
      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>{user?.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-500">Email:</span>
            <span className="font-medium">{user?.email}</span>
          </div>
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-500">Role:</span>
            <StatusBadge status={user?.role || 'SALES_AGENT'} />
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Account Status:</span>
            <StatusBadge status={user?.status || 'ACTIVE'} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
