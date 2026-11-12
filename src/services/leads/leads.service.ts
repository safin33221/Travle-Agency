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
  PaginationMeta,
  ServiceCategory,
} from '@/types/api';

function normalizeMilestones(raw: unknown): LeadMilestoneItem[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item, idx) => {
    if (typeof item === 'string') {
      return {
        key: `MILESTONE_${idx + 1}`,
        title: item,
        status: 'PENDING',
      };
    }
    const obj = (item && typeof item === 'object' ? item : {}) as Record<string, unknown>;
    const rawStatus = typeof obj.status === 'string' ? obj.status.toUpperCase() : '';
    const status: LeadMilestoneItem['status'] =
      rawStatus === 'DONE' ||
      rawStatus === 'COMPLETED' ||
      obj.completed === true ||
      obj.done === true
        ? 'DONE'
        : rawStatus === 'IN_PROGRESS'
          ? 'IN_PROGRESS'
          : 'PENDING';
    return {
      key: typeof obj.key === 'string' && obj.key ? obj.key : `MILESTONE_${idx + 1}`,
      title:
        typeof obj.title === 'string' && obj.title
          ? obj.title
          : typeof obj.label === 'string' && obj.label
            ? obj.label
            : typeof obj.name === 'string' && obj.name
              ? obj.name
              : `Step ${idx + 1}`,
      status,
      completedAt: typeof obj.completedAt === 'string' ? obj.completedAt : undefined,
    };
  });
}

function normalizeDocuments(raw: unknown): LeadDocumentChecklistItem[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item, idx) => {
    if (typeof item === 'string') {
      return {
        key: `DOC_${idx + 1}`,
        title: item,
        required: true,
        status: 'PENDING',
      };
    }
    const obj = (item && typeof item === 'object' ? item : {}) as Record<string, unknown>;
    const rawStatus = typeof obj.status === 'string' ? obj.status.toUpperCase() : '';
    const status: LeadDocumentChecklistItem['status'] =
      rawStatus === 'VERIFIED' || rawStatus === 'APPROVED'
        ? 'VERIFIED'
        : rawStatus === 'RECEIVED' || rawStatus === 'SUBMITTED'
          ? 'RECEIVED'
          : rawStatus === 'REJECTED'
            ? 'REJECTED'
            : 'PENDING';
    return {
      key: typeof obj.key === 'string' && obj.key ? obj.key : `DOC_${idx + 1}`,
      title:
        typeof obj.title === 'string' && obj.title
          ? obj.title
          : typeof obj.label === 'string' && obj.label
            ? obj.label
            : typeof obj.name === 'string' && obj.name
              ? obj.name
              : `Document ${idx + 1}`,
      required: typeof obj.required === 'boolean' ? obj.required : true,
      status,
      note: typeof obj.note === 'string' ? obj.note : undefined,
      updatedAt: typeof obj.updatedAt === 'string' ? obj.updatedAt : undefined,
    };
  });
}

function normalizeLead(raw: unknown): Lead {
  const obj = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const unwrapped = (
    'data' in obj && obj.data && typeof obj.data === 'object' ? obj.data : obj
  ) as Record<string, unknown>;
  return {
    ...(unwrapped as unknown as Lead),
    stage: (typeof unwrapped.stage === 'string' ? unwrapped.stage : 'NEW') as LeadStage,
    source: (typeof unwrapped.source === 'string' ? unwrapped.source : 'OTHER') as LeadSource,
    category: (
      typeof unwrapped.category === 'string' ? unwrapped.category : 'TOUR'
    ) as ServiceCategory,
    eligibilityStatus:
      typeof unwrapped.eligibilityStatus === 'string' ? unwrapped.eligibilityStatus : undefined,
    documentChecklist: normalizeDocuments(unwrapped.documentChecklist),
    milestoneChecklist: normalizeMilestones(unwrapped.milestoneChecklist),
    notes: Array.isArray(unwrapped.notes) ? unwrapped.notes : [],
    followUpTasks: Array.isArray(unwrapped.followUpTasks) ? unwrapped.followUpTasks : [],
    quotations: Array.isArray(unwrapped.quotations) ? unwrapped.quotations : [],
    aiDrafts: Array.isArray(unwrapped.aiDrafts) ? unwrapped.aiDrafts : [],
  };
}

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

  const raw = (await res.json().catch(() => null)) as
    | { data?: unknown[]; meta?: PaginationMeta }
    | unknown[]
    | null;
  const list = Array.isArray((raw as { data?: unknown[] })?.data)
    ? (raw as { data: unknown[] }).data
    : Array.isArray(raw)
      ? raw
      : [];
  const leads = list.map((item) => normalizeLead(item));
  const meta: PaginationMeta = (raw as { meta?: PaginationMeta })?.meta ?? {
    total: leads.length,
    page: params?.page ?? 1,
    limit: params?.limit ?? 20,
    totalPages: Math.ceil(leads.length / (params?.limit ?? 20)),
  };

  return {
    data: leads,
    meta,
  };
}

export async function getSingleLead(id: string): Promise<Lead | null> {
  const res = await serverFetch.get(`/leads/${id}`);
  if (!res.ok) return null;
  const raw = await res.json().catch(() => null);
  if (!raw) return null;
  return normalizeLead(raw);
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
  if (!res.ok || !body) {
    return {
      success: false,
      message: body?.message || 'Tracking ID not found',
    };
  }

  const unwrapped = body.data ?? body;

  return {
    success: true,
    data: {
      ...unwrapped,
      stage: unwrapped.stage ?? 'NEW',
      category: unwrapped.category ?? 'TOUR',
      milestoneChecklist: normalizeMilestones(unwrapped.milestoneChecklist),
      documentChecklist: normalizeDocuments(unwrapped.documentChecklist),
    },
  };
}

