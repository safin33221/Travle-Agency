'use server';

import { revalidatePath } from 'next/cache';
import { serverFetch } from '@/lib/serverFetch';
import { AiDraft, AiDraftType } from '@/types/api';

export async function generateAiDraft(payload: {
  leadId?: string;
  customerInquiry: string;
  type?: AiDraftType;
  language?: 'en' | 'bn' | 'banglish';
  packageIds?: string[];
}): Promise<{ success: boolean; message: string; data?: AiDraft }> {
  const res = await serverFetch.post('/ai/drafts', {
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const body = await res.json().catch(() => null);
  if (!res.ok) {
    return {
      success: false,
      message: body?.message || 'Failed to generate AI draft',
    };
  }

  if (payload.leadId) {
    revalidatePath(`/dashboard/leads/${payload.leadId}`);
  }

  return {
    success: true,
    message: 'AI Draft generated (Human review required)',
    data: body as AiDraft,
  };
}
