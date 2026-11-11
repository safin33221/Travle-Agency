'use server';

import { revalidatePath } from 'next/cache';
import { serverFetch } from '@/lib/serverFetch';
import {
  FollowUpStatus,
  Lead,
  LeadDocumentChecklistItem,
  LeadMilestoneItem,
  LeadSource,
  LeadStage,
  PaginatedResponse,
  ServiceCategory,
} from '@/types/api';

export async function getLeads(params?: {
  page?: number;
  limit?: number;
  category?: ServiceCategory;
  eligibilityStatus?: string;
  stage?: LeadStage;
  source?: LeadSource;
  search?: string;
  destination?: string;
  assignedToId?: string;
  minBudget?: number;
  maxBudget?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}): Promise<PaginatedResponse<Lead>> {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.category) query.set('category', params.category);
  if (params?.eligibilityStatus)
    query.set('eligibilityStatus', params.eligibilityStatus);
  if (params?.stage) query.set('stage', params.stage);
  if (params?.source) query.set('source', params.source);
  if (params?.search) query.set('search', params.search);
  if (params?.destination) query.set('destination', params.destination);
  if (params?.assignedToId) query.set('assignedToId', params.assignedToId);
  if (params?.minBudget !== undefined)
    query.set('minBudget', String(params.minBudget));
  if (params?.maxBudget !== undefined)
    query.set('maxBudget', String(params.maxBudget));
  if (params?.sortBy) query.set('sortBy', params.sortBy);
  if (params?.sortOrder) query.set('sortOrder', params.sortOrder);

  const res = await serverFetch.get(
    `/leads${query.toString() ? `?${query.toString()}` : ''}`,
  );

  if (!res.ok) {
    return {
      data: [],
      meta: { total: 0, page: 1, limit: 20, totalPages: 0 },
    };
  }

  const json = (await res.json().catch(() => null)) as PaginatedResponse<Lead> | null;
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
  category?: ServiceCategory;
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
  metadata?: Record<string, unknown>;
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

export async function updateLeadChecklists(
  leadId: string,
  payload: {
    documentChecklist?: LeadDocumentChecklistItem[];
    milestoneChecklist?: LeadMilestoneItem[];
  },
): Promise<{ success: boolean; message: string }> {
  const res = await serverFetch.patch(`/leads/${leadId}`, {
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const body = await res.json().catch(() => null);
  if (!res.ok) {
    return {
      success: false,
      message: body?.message || 'Failed to update checklists',
    };
  }

  revalidatePath(`/dashboard/leads/${leadId}`);
  revalidatePath('/dashboard/leads');

  return {
    success: true,
    message: 'Checklist updated',
  };
}

export async function submitPublicInquiry(payload: {
  category: ServiceCategory;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  destination?: string;
  budget?: number;
  requirements?: string;
  metadata?: Record<string, unknown>;
}): Promise<{
  success: boolean;
  message: string;
  data?: {
    trackingCode: string;
    category: ServiceCategory;
    customerName: string;
    destination?: string;
    eligibility: {
      status: string;
      score: number;
      summary: string;
      reasons: string[];
    };
  };
}> {
  const res = await serverFetch.post('/leads/public-inquiry', {
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const body = await res.json().catch(() => null);
  if (!res.ok) {
    return {
      success: false,
      message: body?.message || 'Failed to submit inquiry',
    };
  }

  return {
    success: true,
    message: 'Assessment & inquiry submitted!',
    data: body,
  };
}

export async function trackPublicFileStatus(trackingCode: string): Promise<{
  success: boolean;
  message?: string;
  data?: {
    trackingCode: string;
    category: ServiceCategory;
    customerName: string;
    destination?: string;
    stage: LeadStage;
    eligibilityStatus?: string;
    milestoneChecklist: LeadMilestoneItem[];
    documentChecklist: LeadDocumentChecklistItem[];
    updatedAt: string;
  };
}> {
  const cleanCode = encodeURIComponent(trackingCode.trim().toUpperCase());
  const res = await serverFetch.get(`/leads/track/${cleanCode}`);

  const body = await res.json().catch(() => null);
  if (!res.ok) {
    return {
      success: false,
      message: body?.message || 'Tracking ID not found',
    };
  }

  return {
    success: true,
    data: body,
  };
}

