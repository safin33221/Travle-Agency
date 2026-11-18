import { redirect } from 'next/navigation';
import { getMe } from '@/services/auth/getMe';
import { getStaffList } from '@/services/staff/staff.service';
import { ManagementPageHeader } from '@/components/shared/ManagementPageHeader';
import { StaffManagementClient } from '@/components/module/staff/StaffManagementClient';

export const instant = false;

export default async function StaffManagementPage() {
  const user = await getMe();
  if (!user || user.role !== 'OWNER_ADMIN') {
    redirect('/dashboard?error=unauthorized');
  }

  const staffRes = await getStaffList();

  return (
    <div>
      <ManagementPageHeader title="Staff & Access Control" />
      <StaffManagementClient staff={staffRes.data} />
    </div>
  );
}
