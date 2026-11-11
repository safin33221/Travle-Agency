import { getStaffList } from '@/services/staff/staff.service';
import { ManagementPageHeader } from '@/components/shared/ManagementPageHeader';
import { StaffManagementClient } from '@/components/module/staff/StaffManagementClient';

export default async function StaffManagementPage() {
  const staffRes = await getStaffList();

  return (
    <div>
      <ManagementPageHeader
        title="Staff & Access Control (RBAC)"
        description="Provision staff accounts, assign OWNER_ADMIN or SALES_AGENT roles, and manage active status."
      />
      <StaffManagementClient staff={staffRes.data} />
    </div>
  );
}
