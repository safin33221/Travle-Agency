'use client';

import { useState, useTransition } from 'react';
import { updateAgencySettings } from '@/services/settings/settings.service';
import { AgencySettings } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input, Label, Textarea } from '@/components/ui/input';

export function AgencySettingsForm({
  settings,
}: {
  settings: AgencySettings | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [msg, setMsg] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMsg('');
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await updateAgencySettings({
        agencyName: String(formData.get('agencyName') || ''),
        legalName: String(formData.get('legalName') || ''),
        email: String(formData.get('email') || ''),
        phone: String(formData.get('phone') || ''),
        address: String(formData.get('address') || ''),
        defaultCurrency: String(formData.get('defaultCurrency') || 'BDT'),
        taxRate: Number(formData.get('taxRate')) || 0,
        quotationValidityDays:
          Number(formData.get('quotationValidityDays')) || 7,
        quotationTerms: String(formData.get('quotationTerms') || ''),
      });

      setMsg(res.message);
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agency Branding, Defaults & Quotation Terms</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {msg && (
            <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-700">
              {msg}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label>Agency Display Name</Label>
              <Input
                name="agencyName"
                defaultValue={settings?.agencyName || 'TravelPilot Agency'}
                required
              />
            </div>
            <div>
              <Label>Legal Entity Name (Shown on PDFs)</Label>
              <Input
                name="legalName"
                defaultValue={
                  settings?.legalName || 'TravelPilot Tours & Travels Ltd.'
                }
              />
            </div>
            <div>
              <Label>Official Contact Email</Label>
              <Input
                name="email"
                type="email"
                defaultValue={settings?.email || ''}
              />
            </div>
            <div>
              <Label>Official Phone Number</Label>
              <Input name="phone" defaultValue={settings?.phone || ''} />
            </div>
            <div>
              <Label>Default Currency</Label>
              <Input
                name="defaultCurrency"
                defaultValue={settings?.defaultCurrency || 'BDT'}
              />
            </div>
            <div>
              <Label>Default Tax / VAT Rate (%)</Label>
              <Input
                name="taxRate"
                type="number"
                step="0.01"
                defaultValue={Number(settings?.taxRate || 0)}
              />
            </div>
            <div>
              <Label>Quotation Validity (Days)</Label>
              <Input
                name="quotationValidityDays"
                type="number"
                defaultValue={settings?.quotationValidityDays || 7}
              />
            </div>
            <div>
              <Label>Office Address</Label>
              <Input name="address" defaultValue={settings?.address || ''} />
            </div>
          </div>

          <div>
            <Label>Standard Quotation Terms & Conditions (Printed on PDF)</Label>
            <Textarea
              name="quotationTerms"
              defaultValue={settings?.quotationTerms || ''}
              className="min-h-[120px]"
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" variant="secondary" disabled={isPending}>
              {isPending ? 'Saving...' : 'Save Agency Configuration'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
