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

const DEFAULT_SECTOR_DOCUMENTS: Record<ServiceCategory, string[]> = {
  TOUR: [
    'Passport Copy (Minimum 6 Months Validity)',
    'Recent Passport Size Photograph (White Background)',
    'Bank Statement (Last 6 Months) & Solvency Certificate',
    'NOC / Leave Approval Letter or Trade License Copy',
    'National ID (NID) Copy',
  ],
  HAJJ_UMRAH: [
    'Original Passport (Minimum 6 Months Validity)',
    'National ID (NID) or Birth Certificate Copy',
    'Passport Size Photo (White Background)',
    'Saudi Visa Bio (Biometric) Confirmation Slip',
    'Meningitis & Seasonal Flu Vaccination Card',
    'Pre-Registration (PID) / Nusuk Reference (For Hajj)',
  ],
  WORK_PERMIT: [
    'Original Passport (Minimum 12 Months Validity)',
    'Police Clearance Certificate (PCC)',
    'GAMCA / Wafid Medical Fit Report',
    'Passport Size Photos (White Background, Matte Paper)',
    'National ID (NID) Copy & Nominee NID',
    'Skill / Experience / Trade Certificate (If Applicable)',
    'BMET Registration & PDO Certificate',
  ],
  STUDENT_VISA: [
    'Valid Passport Copy',
    'SSC & HSC Marksheets and Certificates',
    'Bachelor / Master Transcript & Provisional Certificate',
    'IELTS / PTE / Duolingo / MOI Score Report',
    'Updated Academic CV / Resume',
    'Statement of Purpose (SOP) / Study Plan',
    'Two Academic / Professional Reference Letters (LOR)',
    'Sponsor Bank Solvency & 6 Months Bank Statement',
  ],
};

const DEFAULT_SECTOR_MILESTONES: Record<
  ServiceCategory,
  Array<{ key: string; title: string }>
> = {
  TOUR: [
    { key: 'INQUIRY_LOGGED', title: 'Inquiry & Travel Preferences Recorded' },
    { key: 'PACKAGE_QUOTED', title: 'Approved Package Quotation Issued' },
    { key: 'DOCS_COLLECTED', title: 'Passport & Visa Documents Collected' },
    { key: 'VISA_OR_TICKET', title: 'Visa & Air Ticket / Hotel Confirmed' },
    { key: 'READY_TO_TRAVEL', title: 'Final Travel Voucher & Briefing Ready' },
  ],
  HAJJ_UMRAH: [
    { key: 'PRE_REGISTRATION', title: 'File Opened & Pre-Registration / Booking' },
    { key: 'BIOMETRIC_VACCINE', title: 'Saudi Biometric & Vaccine Verification' },
    { key: 'NUSUK_MOFA_VISA', title: 'Nusuk / MOFA & Umrah/Hajj Visa Issued' },
    { key: 'HOTEL_TRANSPORT', title: 'Makkah/Madinah Hotel & Flight Assigned' },
    { key: 'MOALLEM_BRIEFING', title: 'Training, Ihram Kit & Ready for Flight' },
  ],
  WORK_PERMIT: [
    { key: 'FILE_OPENED', title: 'Passport Received & Job Category Selected' },
    { key: 'MEDICAL_PCC', title: 'Police Clearance & GAMCA Medical Completed' },
    { key: 'OFFER_PERMIT', title: 'Work Permit / Calling / Demand Approved' },
    { key: 'EMBASSY_STAMPING', title: 'Mofa & Embassy Visa Stamping Done' },
    { key: 'BMET_MANPOWER', title: 'BMET Smart Card / Manpower Clearance' },
    { key: 'FLIGHT_READY', title: 'Air Ticket Issued & Ready for Departure' },
  ],
  STUDENT_VISA: [
    { key: 'PROFILE_ASSESSED', title: 'Academic Profile & University Shortlisted' },
    { key: 'OFFER_APPLIED', title: 'Application Submitted for Offer Letter' },
    { key: 'OFFER_RECEIVED', title: 'Conditional / Unconditional Offer Received' },
    { key: 'TUITION_CAS_I20', title: 'Tuition Deposit Paid & CAS / I-20 / COE Issued' },
    { key: 'VISA_BIOMETRICS', title: 'Financial File, SOP & Embassy Biometrics Done' },
    { key: 'VISA_DECISION', title: 'Student Visa Approved & Pre-Departure Briefing' },
  ],
};

function parseChecklistItem(item: unknown): Record<string, unknown> | string {
  if (typeof item === 'string') {
    const trimmed = item.trim();
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          return parsed as Record<string, unknown>;
        }
      } catch {
        // Not JSON, treat as plain title string
      }
    }
    return trimmed;
  }
  if (item && typeof item === 'object' && !Array.isArray(item)) {
    return item as Record<string, unknown>;
  }
  return {};
}

function isValidChecklistEntry(item: unknown): boolean {
  const parsed = parseChecklistItem(item);
  if (typeof parsed === 'string') return parsed.trim().length > 0;
  return Boolean(
    (typeof parsed.title === 'string' && parsed.title.trim()) ||
      (typeof parsed.label === 'string' && parsed.label.trim()) ||
      (typeof parsed.name === 'string' && parsed.name.trim()),
  );
}

function normalizeMilestones(
  raw: unknown,
  category: ServiceCategory = 'TOUR',
): LeadMilestoneItem[] {
  const sectorDefaults =
    DEFAULT_SECTOR_MILESTONES[category] ?? DEFAULT_SECTOR_MILESTONES.TOUR;

  if (
    !Array.isArray(raw) ||
    raw.length === 0 ||
    !raw.some(isValidChecklistEntry)
  ) {
    return sectorDefaults.map((m, idx) => ({
      key: m.key,
      title: m.title,
      status: idx === 0 ? 'DONE' : 'PENDING',
    }));
  }

  return raw.map((item, idx) => {
    const fallback = sectorDefaults[idx];
    const parsed = parseChecklistItem(item);
    if (typeof parsed === 'string') {
      return {
        key: fallback?.key ?? `MILESTONE_${idx + 1}`,
        title: parsed || fallback?.title || `Step ${idx + 1}`,
        status: 'PENDING',
      };
    }

    const obj = parsed;
    const rawStatus = typeof obj.status === 'string' ? obj.status.toUpperCase() : '';
    const hasExplicitStatus = Boolean(rawStatus) || obj.completed !== undefined || obj.done !== undefined;
    const status: LeadMilestoneItem['status'] =
      rawStatus === 'DONE' ||
      rawStatus === 'COMPLETED' ||
      obj.completed === true ||
      obj.done === true
        ? 'DONE'
        : rawStatus === 'IN_PROGRESS'
          ? 'IN_PROGRESS'
          : !hasExplicitStatus && idx === 0
            ? 'DONE'
            : 'PENDING';

    return {
      key:
        typeof obj.key === 'string' && obj.key
          ? obj.key
          : fallback?.key ?? `MILESTONE_${idx + 1}`,
      title:
        typeof obj.title === 'string' && obj.title
          ? obj.title
          : typeof obj.label === 'string' && obj.label
            ? obj.label
            : typeof obj.name === 'string' && obj.name
              ? obj.name
              : fallback?.title ?? `Step ${idx + 1}`,
      status,
      completedAt: typeof obj.completedAt === 'string' ? obj.completedAt : undefined,
    };
  });
}

function normalizeDocuments(
  raw: unknown,
  category: ServiceCategory = 'TOUR',
): LeadDocumentChecklistItem[] {
  const sectorDefaults =
    DEFAULT_SECTOR_DOCUMENTS[category] ?? DEFAULT_SECTOR_DOCUMENTS.TOUR;

  if (
    !Array.isArray(raw) ||
    raw.length === 0 ||
    !raw.some(isValidChecklistEntry)
  ) {
    return sectorDefaults.map((title, idx) => ({
      key: `DOC_${idx + 1}`,
      title,
      required: true,
      status: 'PENDING',
    }));
  }

  return raw.map((item, idx) => {
    const fallbackTitle = sectorDefaults[idx];
    const parsed = parseChecklistItem(item);
    if (typeof parsed === 'string') {
      return {
        key: `DOC_${idx + 1}`,
        title: parsed || fallbackTitle || `Document ${idx + 1}`,
        required: true,
        status: 'PENDING',
      };
    }

    const obj = parsed;
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
              : fallbackTitle ?? `Document ${idx + 1}`,
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
  const category = (
    typeof unwrapped.category === 'string' ? unwrapped.category : 'TOUR'
  ) as ServiceCategory;
  return {
    ...(unwrapped as unknown as Lead),
    stage: (typeof unwrapped.stage === 'string' ? unwrapped.stage : 'NEW') as LeadStage,
    source: (typeof unwrapped.source === 'string' ? unwrapped.source : 'OTHER') as LeadSource,
    category,
    eligibilityStatus:
      typeof unwrapped.eligibilityStatus === 'string' ? unwrapped.eligibilityStatus : undefined,
    documentChecklist: normalizeDocuments(unwrapped.documentChecklist, category),
    milestoneChecklist: normalizeMilestones(unwrapped.milestoneChecklist, category),
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
  const serializedPayload: Record<string, unknown> = {};
  if (payload.documentChecklist) {
    serializedPayload.documentChecklist = payload.documentChecklist.map((d) =>
      JSON.stringify(d),
    );
  }
  if (payload.milestoneChecklist) {
    serializedPayload.milestoneChecklist = payload.milestoneChecklist.map((m) =>
      JSON.stringify(m),
    );
  }

  const res = await serverFetch.patch(`/leads/${leadId}`, {
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(serializedPayload),
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
  revalidatePath('/track-status');

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
  const category = unwrapped.category ?? 'TOUR';

  return {
    success: true,
    data: {
      ...unwrapped,
      stage: unwrapped.stage ?? 'NEW',
      category,
      milestoneChecklist: normalizeMilestones(
        unwrapped.milestoneChecklist,
        category,
      ),
      documentChecklist: normalizeDocuments(
        unwrapped.documentChecklist,
        category,
      ),
    },
  };
}

