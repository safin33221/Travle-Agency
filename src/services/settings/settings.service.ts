'use server';

import { revalidatePath } from 'next/cache';
import { serverFetch } from '@/lib/serverFetch';
import { AgencySettings } from '@/types/api';

export async function getAgencySettings(): Promise<AgencySettings | null> {
  const res = await serverFetch.get('/settings/agency');
  if (!res.ok) return null;
  return (await res.json()) as AgencySettings;
}

export async function updateAgencySettings(
  payload: Partial<{
    agencyName: string;
    legalName: string;
    email: string;
    phone: string;
    address: string;
    website: string;
    defaultCurrency: string;
    taxRate: number;
    quotationTerms: string;
    quotationValidityDays: number;
  }>,
): Promise<{ success: boolean; message: string; data?: AgencySettings }> {
  const res = await serverFetch.patch('/settings/agency', {
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const body = await res.json().catch(() => null);
  if (!res.ok) {
    return {
      success: false,
      message: body?.message || 'Failed to update agency settings',
    };
  }

  revalidatePath('/dashboard/settings');
  return {
    success: true,
    message: 'Agency settings saved',
    data: body as AgencySettings,
  };
}
