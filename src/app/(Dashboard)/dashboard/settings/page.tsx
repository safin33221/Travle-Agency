import { getAgencySettings } from '@/services/settings/settings.service';
import { ManagementPageHeader } from '@/components/shared/ManagementPageHeader';
import { AgencySettingsForm } from '@/components/module/settings/AgencySettingsForm';

export default async function AgencySettingsPage() {
  const settings = await getAgencySettings();

  return (
    <div>
      <ManagementPageHeader
        title="Agency Configuration & Quotation Defaults"
        description="Manage agency identity, default tax rate, currency, and PDF quotation terms."
      />
      <AgencySettingsForm settings={settings} />
    </div>
  );
}
