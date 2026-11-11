'use server';

import { revalidatePath } from 'next/cache';
import { serverFetch } from '@/lib/serverFetch';
import { Quotation } from '@/types/api';

export async function getLeadQuotations(leadId: string): Promise<Quotation[]> {
  const res = await serverFetch.get(`/leads/${leadId}/quotations`);
  if (!res.ok) return [];
  return (await res.json()) as Quotation[];
}

export async function getSingleQuotation(
  id: string,
): Promise<Quotation | null> {
  const res = await serverFetch.get(`/quotations/${id}`);
  if (!res.ok) return null;
  return (await res.json()) as Quotation;
}

export async function createQuotation(
  leadId: string,
  payload: {
    items: Array<{
      packageId?: string;
      label: string;
      description?: string;
      quantity: number;
      unitPrice: number;
    }>;
    discount?: number;
    taxRate?: number;
    currency?: string;
    validUntil?: string;
    terms?: string;
    notes?: string;
  },
): Promise<{ success: boolean; message: string; data?: Quotation }> {
  const res = await serverFetch.post(`/leads/${leadId}/quotations`, {
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const body = await res.json().catch(() => null);
  if (!res.ok) {
    return {
      success: false,
      message: body?.message || 'Failed to create quotation',
    };
  }

  revalidatePath(`/dashboard/leads/${leadId}`);
  revalidatePath('/dashboard');

  return {
    success: true,
    message: 'Quotation draft created with deterministic server pricing',
    data: body as Quotation,
  };
}

export async function approveQuotation(
  quotationId: string,
): Promise<{ success: boolean; message: string; data?: Quotation }> {
  const res = await serverFetch.post(`/quotations/${quotationId}/approve`);
  const body = await res.json().catch(() => null);

  if (!res.ok) {
    return {
      success: false,
      message: body?.message || 'Failed to approve quotation',
    };
  }

  revalidatePath(`/dashboard/quotations/${quotationId}`);
  revalidatePath('/dashboard');

  return {
    success: true,
    message: 'Quotation approved and locked for PDF export',
    data: body as Quotation,
  };
}
