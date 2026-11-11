import { ManagementPageHeader } from '@/components/shared/ManagementPageHeader';
import { AiCopilotClient } from '@/components/module/ai/AiCopilotClient';

export default function AiCopilotPage() {
  return (
    <div>
      <ManagementPageHeader
        title="AI Customer Response Copilot"
        description="Draft Bangla, English, or Banglish replies grounded strictly in verified tour packages."
      />
      <AiCopilotClient />
    </div>
  );
}
