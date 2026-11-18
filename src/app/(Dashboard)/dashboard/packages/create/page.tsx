import { redirect } from 'next/navigation';
import { getMe } from '@/services/auth/getMe';
import { ManagementPageHeader } from '@/components/shared/ManagementPageHeader';
import { CreatePackageForm } from '@/components/module/packages/CreatePackageForm';

export const instant = false;

export default async function CreatePackagePage() {
  const user = await getMe();
  if (!user || user.role !== 'OWNER_ADMIN') {
    redirect('/dashboard?error=unauthorized');
  }

  return (
    <div>
      <ManagementPageHeader
        title="Create Verified Tour Package"
        actionLabel="← Back to Catalog"
        actionHref="/dashboard/packages"
      />
      <CreatePackageForm />
    </div>
  );
}
