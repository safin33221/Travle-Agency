export type StaffRole = 'OWNER_ADMIN' | 'SALES_AGENT';
export type StaffStatus = 'ACTIVE' | 'INACTIVE';

export type ServiceCategory =
  | 'TOUR'
  | 'HAJJ_UMRAH'
  | 'WORK_PERMIT'
  | 'STUDENT_VISA';

export type DocumentItemStatus = 'PENDING' | 'RECEIVED' | 'VERIFIED' | 'REJECTED';

export interface LeadDocumentChecklistItem {
  key: string;
  title: string;
  required?: boolean;
  status: DocumentItemStatus;
  note?: string;
  updatedAt?: string;
}

export type MilestoneItemStatus = 'PENDING' | 'IN_PROGRESS' | 'DONE';

export interface LeadMilestoneItem {
  key: string;
  title: string;
  status: MilestoneItemStatus;
  completedAt?: string;
}

export type LeadStage =
  | 'NEW'
  | 'QUALIFIED'
  | 'QUOTED'
  | 'FOLLOW_UP'
  | 'WON'
  | 'LOST';

export type LeadSource =
  | 'PHONE'
  | 'WEBSITE'
  | 'MESSENGER'
  | 'WHATSAPP'
  | 'WALK_IN'
  | 'OTHER';

export type QuotationStatus = 'DRAFT' | 'APPROVED' | 'VOID';
export type FollowUpStatus = 'OPEN' | 'DONE' | 'CANCELLED';

export type AiDraftType =
  | 'CUSTOMER_REPLY'
  | 'QUALIFICATION_QUESTIONS'
  | 'QUOTATION_EXPLANATION';

export type AiDraftStatus = 'DRAFT' | 'REVIEWED' | 'USED' | 'DISCARDED';

export interface StaffUser {
  id: string;
  email: string;
  name: string;
  role: StaffRole;
  status: StaffStatus;
  lastLoginAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

// Alias for compatibility with auth utilities
export type User = StaffUser;
export type UserRole = StaffRole;

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface AgencySettings {
  id: string;
  agencyName: string;
  legalName?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  website?: string | null;
  logoUrl?: string | null;
  primaryColor?: string | null;
  defaultCurrency: string;
  taxRate: string | number;
  quotationTerms?: string | null;
  quotationValidityDays: number;
  updatedAt: string;
}

export interface TourPackage {
  id: string;
  category?: ServiceCategory;
  title: string;
  destination: string;
  durationDays: number;
  durationNights?: number;
  description: string;
  inclusions: string[];
  exclusions: string[];
  requiredDocuments?: string[];
  structuredSpecs?: Record<string, unknown> | null;
  basePrice: string | number;
  currency: string;
  validFrom?: string | null;
  validUntil?: string | null;
  notes?: string | null;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LeadNote {
  id: string;
  leadId: string;
  actorId: string;
  content: string;
  createdAt: string;
  actor?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface FollowUpTask {
  id: string;
  leadId: string;
  assignedToId: string;
  dueAt: string;
  status: FollowUpStatus;
  note: string;
  completedAt?: string | null;
  createdAt: string;
  assignedTo?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface QuotationItem {
  id?: string;
  packageId?: string | null;
  label: string;
  description?: string | null;
  quantity: number;
  unitPrice: string | number;
  total: string | number;
  currency: string;
}

export interface Quotation {
  id: string;
  leadId: string;
  revision: number;
  status: QuotationStatus;
  currency: string;
  subtotal: string | number;
  discount: string | number;
  taxRate: string | number;
  taxAmount: string | number;
  grandTotal: string | number;
  validUntil?: string | null;
  terms?: string | null;
  notes?: string | null;
  createdById: string;
  approvedById?: string | null;
  approvedAt?: string | null;
  sharedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  items: QuotationItem[];
  lead?: {
    id: string;
    customerName: string;
    customerPhone?: string | null;
    customerEmail?: string | null;
    destination?: string | null;
  };
  createdBy?: {
    id: string;
    name: string;
    email: string;
  };
  approvedBy?: {
    id: string;
    name: string;
    email: string;
  } | null;
}

export interface AiDraft {
  id: string;
  leadId?: string | null;
  actorId: string;
  type: AiDraftType;
  language: string;
  customerInquiry?: string | null;
  suggestedText: string;
  missingInformation: string[];
  sourcePackageIds: string[];
  modelUsed: string;
  needsHumanReview: boolean;
  status: AiDraftStatus;
  createdAt: string;
}

export interface Lead {
  id: string;
  trackingCode?: string | null;
  category?: ServiceCategory;
  customerName: string;
  customerPhone?: string | null;
  customerEmail?: string | null;
  source: LeadSource;
  destination?: string | null;
  travelStartDate?: string | null;
  travelEndDate?: string | null;
  travelerCount?: number | null;
  budget?: string | number | null;
  requirements?: string | null;
  stage: LeadStage;
  eligibilityStatus?: string | null;
  documentChecklist?: LeadDocumentChecklistItem[] | null;
  milestoneChecklist?: LeadMilestoneItem[] | null;
  metadata?: Record<string, unknown> | null;
  assignedToId?: string | null;
  createdAt: string;
  updatedAt: string;
  assignedTo?: {
    id: string;
    name: string;
    email: string;
  } | null;
  notes?: LeadNote[];
  followUpTasks?: FollowUpTask[];
  quotations?: Quotation[];
  aiDrafts?: AiDraft[];
  _count?: {
    notes: number;
    quotations: number;
    followUpTasks: number;
  };
}

export interface DashboardSummary {
  leads: {
    total: number;
    byStage: Record<LeadStage, number>;
  };
  quotations: {
    total: number;
    draft: number;
    approved: number;
    wonRevenue: string | number;
  };
  followUps: {
    openCount: number;
    overdueCount: number;
    upcomingTasks: Array<
      FollowUpTask & {
        lead?: {
          id: string;
          customerName: string;
          customerPhone?: string | null;
          stage: LeadStage;
        };
      }
    >;
  };
  packages: {
    activeCount: number;
  };
}

export interface AuditLog {
  id: string;
  actorId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  actor?: {
    id: string;
    name: string;
    email: string;
    role: StaffRole;
  } | null;
}
