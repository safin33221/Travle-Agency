import { ManagementPageHeader } from '@/components/shared/ManagementPageHeader';
import { CreatePackageForm } from '@/components/module/packages/CreatePackageForm';

export const instant = false;

export default function CreatePackagePage() {
  return (
    <div>
      <ManagementPageHeader
        title="Create Verified Tour Package"
        description="Add a new active package to the agency catalog."
        actionLabel="← Back to Catalog"
        actionHref="/dashboard/packages"
      />
      <CreatePackageForm />
    </div>
  );
}
