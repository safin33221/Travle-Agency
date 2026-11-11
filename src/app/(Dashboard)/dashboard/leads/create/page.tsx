import { ManagementPageHeader } from '@/components/shared/ManagementPageHeader';
import { CreateLeadForm } from '@/components/module/leads/CreateLeadForm';

export const instant = false;

export default function CreateLeadPage() {
  return (
    <div>
      <ManagementPageHeader
        title="Record Customer Inquiry"
        description="Enter inquiry details received from WhatsApp, Messenger, phone, or walk-in."
        actionLabel="← Back to Leads"
        actionHref="/dashboard/leads"
      />
      <CreateLeadForm />
    </div>
  );
}
