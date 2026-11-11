'use server';

import { revalidatePath } from 'next/cache';
import { serverFetch } from '@/lib/serverFetch';
import {
  FollowUpStatus,
  Lead,
  LeadSource,
  LeadStage,
  PaginatedResponse,
} from '@/types/api';

export async function getLeads(params?: {
  page?: number;
  limit?: number;
  stage?: LeadStage;
  source?: LeadSource;
  search?: string;
}): Promise<PaginatedResponse<Lead>> {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.stage) query.set('stage', params.stage);
  if (params?.source) query.set('source', params.source);
  if (params?.search) query.set('search', params.search);

  const res = await serverFetch.get(
    `/leads${query.toString() ? `?${query.toString()}` : ''}`,
  );

  if (!res.ok) {
    return {
      data: [],
      meta: { total: 0, page: 1, limit: 20, totalPages: 0 },
    };
  }

  const json = (await res.json().catch(() => null)) as {
    data?: Lead[];
    meta?: PaginatedResponse<Lead>['meta'];
  } | null;
  return {
    data: Array.isArray(json?.data) ? json.data : [],
    meta: json?.meta ?? { total: 0, page: 1, limit: 20, totalPages: 0 },
  };
}

export async function getSingleLead(id: string): Promise<Lead | null> {
  const res = await serverFetch.get(`/leads/${id}`);
  if (!res.ok) return null;
  return (await res.json()) as Lead;
}

export async function createLead(payload: {
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  source?: LeadSource;
  destination?: string;
  travelStartDate?: string;
  travelEndDate?: string;
  travelerCount?: number;
  budget?: number;
  requirements?: string;
  stage?: LeadStage;
}): Promise<{ success: boolean; message: string; data?: Lead }> {
  const res = await serverFetch.post('/leads', {
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const body = await res.json().catch(() => null);
  if (!res.ok) {
    return {
      success: false,
      message: body?.message || 'Failed to create lead',
    };
  }

  revalidatePath('/dashboard/leads');
  revalidatePath('/dashboard');

  return {
    success: true,
    message: 'Lead created successfully',
    data: body as Lead,
  };
}

export async function updateLeadStage(
  id: string,
  stage: LeadStage,
): Promise<{ success: boolean; message: string }> {
  const res = await serverFetch.patch(`/leads/${id}`, {
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ stage }),
  });

  const body = await res.json().catch(() => null);
  if (!res.ok) {
    return {
      success: false,
      message: body?.message || 'Failed to update lead stage',
    };
  }

  revalidatePath(`/dashboard/leads/${id}`);
  revalidatePath('/dashboard/leads');
  revalidatePath('/dashboard');

  return {
    success: true,
    message: 'Lead stage updated',
  };
}

export async function addLeadNote(
  leadId: string,
  content: string,
): Promise<{ success: boolean; message: string }> {
  const res = await serverFetch.post(`/leads/${leadId}/notes`, {
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });

  const body = await res.json().catch(() => null);
  if (!res.ok) {
    return {
      success: false,
      message: body?.message || 'Failed to add note',
    };
  }

  revalidatePath(`/dashboard/leads/${leadId}`);
  return {
    success: true,
    message: 'Note added',
  };
}

export async function createFollowUpTask(
  leadId: string,
  payload: { dueAt: string; note: string },
): Promise<{ success: boolean; message: string }> {
  const res = await serverFetch.post(`/leads/${leadId}/follow-ups`, {
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const body = await res.json().catch(() => null);
  if (!res.ok) {
    return {
      success: false,
      message: body?.message || 'Failed to schedule follow-up',
    };
  }

  revalidatePath(`/dashboard/leads/${leadId}`);
  revalidatePath('/dashboard');

  return {
    success: true,
    message: 'Follow-up scheduled',
  };
}

export async function updateFollowUpTaskStatus(
  taskId: string,
  status: FollowUpStatus,
  leadId?: string,
): Promise<{ success: boolean; message: string }> {
  const res = await serverFetch.patch(`/follow-ups/${taskId}`, {
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });

  const body = await res.json().catch(() => null);
  if (!res.ok) {
    return {
      success: false,
      message: body?.message || 'Failed to update follow-up task',
    };
  }

  if (leadId) revalidatePath(`/dashboard/leads/${leadId}`);
  revalidatePath('/dashboard');

  return {
    success: true,
    message: 'Task updated',
  };
}
