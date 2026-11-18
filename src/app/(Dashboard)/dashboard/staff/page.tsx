import { getStaffList } from '@/services/staff/staff.service';
import { ManagementPageHeader } from '@/components/shared/ManagementPageHeader';
import { StaffManagementClient } from '@/components/module/staff/StaffManagementClient';

export const instant = false;

export default async function StaffManagementPage() {
  const staffRes = await getStaffList();

  return (
    <div>
      <ManagementPageHeader title="Staff & Access Control" />
      <StaffManagementClient staff={staffRes.data} />
    </div>
  );
}
