'use server';

import { revalidatePath } from 'next/cache';
import { serverFetch } from '@/lib/serverFetch';
import {
  AgencyServiceStatus,
  Country,
  CountryCoverageStatus,
  PaginatedResponse,
  VisaAdminOverview,
  VisaCategory,
  VisaInquiry,
  VisaPublicationStatus,
  VisaService,
  VisaServiceRequirement,
} from '@/types/api';

// ============================================================================
// PUBLIC VISA & IMMIGRATION SERVICES API
// ============================================================================

export async function getPublicCountries(params?: {
  page?: number;
  limit?: number;
  search?: string;
  category?: VisaCategory;
  isFeatured?: boolean;
}): Promise<PaginatedResponse<Country>> {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.search) query.set('search', params.search);
  if (params?.category) query.set('category', params.category);
  if (params?.isFeatured !== undefined)
    query.set('isFeatured', String(params.isFeatured));

  const res = await serverFetch.get(
    `/countries${query.toString() ? `?${query.toString()}` : ''}`,
  );
  if (!res.ok) {
    return {
      data: [],
      meta: { total: 0, page: 1, limit: 20, totalPages: 0 },
    };
  }
  return (await res.json()) as PaginatedResponse<Country>;
}

export async function getPublicCountryBySlug(
  slug: string,
): Promise<Country | null> {
  const res = await serverFetch.get(`/countries/${encodeURIComponent(slug)}`);
  if (!res.ok) return null;
  return (await res.json()) as Country;
}

export async function getPublicVisaServices(params?: {
  page?: number;
  limit?: number;
  search?: string;
  countrySlug?: string;
  countryId?: string;
  category?: VisaCategory;
  serviceStatus?: AgencyServiceStatus;
  isFeatured?: boolean;
}): Promise<PaginatedResponse<VisaService>> {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.search) query.set('search', params.search);
  if (params?.countrySlug) query.set('countrySlug', params.countrySlug);
  if (params?.countryId) query.set('countryId', params.countryId);
  if (params?.category) query.set('category', params.category);
  if (params?.serviceStatus) query.set('serviceStatus', params.serviceStatus);
  if (params?.isFeatured !== undefined)
    query.set('isFeatured', String(params.isFeatured));

  const res = await serverFetch.get(
    `/visa-services${query.toString() ? `?${query.toString()}` : ''}`,
  );
  if (!res.ok) {
    return {
      data: [],
      meta: { total: 0, page: 1, limit: 20, totalPages: 0 },
    };
  }
  return (await res.json()) as PaginatedResponse<VisaService>;
}

export async function getPublicVisaServiceDetail(
  countrySlug: string,
  serviceSlug: string,
): Promise<VisaService | null> {
  const res = await serverFetch.get(
    `/visa-services/${encodeURIComponent(countrySlug)}/${encodeURIComponent(serviceSlug)}`,
  );
  if (!res.ok) return null;
  return (await res.json()) as VisaService;
}

export async function submitVisaInquiry(payload: {
  fullName: string;
  phone: string;
  email?: string;
  countryId: string;
  visaServiceId?: string;
  category?: VisaCategory;
  message?: string;
  consentGiven: boolean;
}): Promise<{
  success: boolean;
  message: string;
  data?: {
    id: string;
    leadId: string;
    trackingCode?: string;
    countryName: string;
    serviceTitle: string;
  };
}> {
  const res = await serverFetch.post('/visa-inquiries', {
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const body = await res.json().catch(() => null);
  if (!res.ok) {
    return {
      success: false,
      message: body?.message || 'Could not submit inquiry. Please verify your details.',
    };
  }

  revalidatePath('/dashboard/visa-immigration');
  revalidatePath('/dashboard/visa-immigration/inquiries');
  revalidatePath('/dashboard/leads');

  return {
    success: true,
    message: body?.message || 'Inquiry submitted successfully!',
    data: body,
  };
}

// ============================================================================
// ADMIN VISA & IMMIGRATION MANAGEMENT API
// ============================================================================

export async function getAdminVisaOverview(): Promise<VisaAdminOverview> {
  const res = await serverFetch.get('/admin/visa-overview');
  if (!res.ok) {
    return {
      totalCountries: 0,
      countriesWithPublishedServices: 0,
      publishedServicesCount: 0,
      acceptingInquiriesCount: 0,
      pausedServicesCount: 0,
      visaInquiriesCount: 0,
      visaLeadsCount: 0,
    };
  }
  return (await res.json()) as VisaAdminOverview;
}

export async function getAdminCountries(params?: {
  page?: number;
  limit?: number;
  search?: string;
  coverageStatus?: CountryCoverageStatus;
  isFeatured?: boolean;
}): Promise<PaginatedResponse<Country>> {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.search) query.set('search', params.search);
  if (params?.coverageStatus)
    query.set('coverageStatus', params.coverageStatus);
  if (params?.isFeatured !== undefined)
    query.set('isFeatured', String(params.isFeatured));

  const res = await serverFetch.get(
    `/admin/countries${query.toString() ? `?${query.toString()}` : ''}`,
  );
  if (!res.ok) {
    return {
      data: [],
      meta: { total: 0, page: 1, limit: 20, totalPages: 0 },
    };
  }
  return (await res.json()) as PaginatedResponse<Country>;
}

export async function getAdminCountryById(id: string): Promise<Country | null> {
  const res = await serverFetch.get(`/admin/countries/${id}`);
  if (!res.ok) return null;
  return (await res.json()) as Country;
}

export async function createAdminCountry(payload: {
  name: string;
  isoCode: string;
  slug?: string;
  flagEmoji?: string;
  shortIntro: string;
  detailedDescription?: string;
  coverageStatus?: CountryCoverageStatus;
  isFeatured?: boolean;
  displayOrder?: number;
  seoTitle?: string;
  seoDescription?: string;
}): Promise<{ success: boolean; message: string; data?: Country }> {
  const res = await serverFetch.post('/admin/countries', {
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    return {
      success: false,
      message: body?.message || 'Failed to create country',
    };
  }
  revalidatePath('/dashboard/visa-immigration');
  revalidatePath('/dashboard/visa-immigration/countries');
  revalidatePath('/visa-services');
  return {
    success: true,
    message: 'Destination country created',
    data: body as Country,
  };
}

export async function updateAdminCountry(
  id: string,
  payload: Partial<{
    name: string;
    isoCode: string;
    slug: string;
    flagEmoji: string;
    shortIntro: string;
    detailedDescription: string;
    coverageStatus: CountryCoverageStatus;
    isFeatured: boolean;
    displayOrder: number;
    seoTitle: string;
    seoDescription: string;
  }>,
): Promise<{ success: boolean; message: string }> {
  const res = await serverFetch.patch(`/admin/countries/${id}`, {
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    return {
      success: false,
      message: body?.message || 'Failed to update country',
    };
  }
  revalidatePath('/dashboard/visa-immigration');
  revalidatePath('/dashboard/visa-immigration/countries');
  revalidatePath(`/dashboard/visa-immigration/countries/${id}`);
  revalidatePath('/visa-services');
  return { success: true, message: 'Country updated successfully' };
}

export async function archiveAdminCountry(
  id: string,
): Promise<{ success: boolean; message: string }> {
  const res = await serverFetch.delete(`/admin/countries/${id}`);
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    return {
      success: false,
      message: body?.message || 'Failed to archive country',
    };
  }
  revalidatePath('/dashboard/visa-immigration');
  revalidatePath('/dashboard/visa-immigration/countries');
  revalidatePath('/visa-services');
  return { success: true, message: 'Country soft-archived' };
}

export async function getAdminVisaServices(params?: {
  page?: number;
  limit?: number;
  search?: string;
  countryId?: string;
  category?: VisaCategory;
  serviceStatus?: AgencyServiceStatus;
  publicationStatus?: VisaPublicationStatus;
}): Promise<PaginatedResponse<VisaService>> {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.search) query.set('search', params.search);
  if (params?.countryId) query.set('countryId', params.countryId);
  if (params?.category) query.set('category', params.category);
  if (params?.serviceStatus) query.set('serviceStatus', params.serviceStatus);
  if (params?.publicationStatus)
    query.set('publicationStatus', params.publicationStatus);

  const res = await serverFetch.get(
    `/admin/visa-services${query.toString() ? `?${query.toString()}` : ''}`,
  );
  if (!res.ok) {
    return {
      data: [],
      meta: { total: 0, page: 1, limit: 20, totalPages: 0 },
    };
  }
  return (await res.json()) as PaginatedResponse<VisaService>;
}

export async function getAdminVisaServiceById(
  id: string,
): Promise<VisaService | null> {
  const res = await serverFetch.get(`/admin/visa-services/${id}`);
  if (!res.ok) return null;
  return (await res.json()) as VisaService;
}

export async function createAdminVisaService(payload: {
  countryId: string;
  category: VisaCategory;
  customCategoryLabel?: string;
  title: string;
  slug?: string;
  shortDescription: string;
  fullDescription: string;
  eligibilityInfo?: string;
  requirements?: VisaServiceRequirement[];
  applicationProcessSteps?: string[];
  estimatedProcessingTime?: string;
  agencyServiceFee?: number;
  governmentFeeInfo?: string;
  currency?: string;
  importantNotes?: string;
  disclaimer?: string;
  informationSourceUrl?: string;
  displayOrder?: number;
  isFeatured?: boolean;
  publicationStatus?: VisaPublicationStatus;
  serviceStatus?: AgencyServiceStatus;
}): Promise<{ success: boolean; message: string; data?: VisaService }> {
  const res = await serverFetch.post('/admin/visa-services', {
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    return {
      success: false,
      message: body?.message || 'Failed to create visa service',
    };
  }
  revalidatePath('/dashboard/visa-immigration');
  revalidatePath('/dashboard/visa-immigration/services');
  revalidatePath('/visa-services');
  return {
    success: true,
    message: 'Visa service created successfully',
    data: body as VisaService,
  };
}

export async function updateAdminVisaService(
  id: string,
  payload: Partial<{
    countryId: string;
    category: VisaCategory;
    customCategoryLabel: string;
    title: string;
    slug: string;
    shortDescription: string;
    fullDescription: string;
    eligibilityInfo: string;
    requirements: VisaServiceRequirement[];
    applicationProcessSteps: string[];
    estimatedProcessingTime: string;
    agencyServiceFee: number | null;
    governmentFeeInfo: string;
    currency: string;
    importantNotes: string;
    disclaimer: string;
    informationSourceUrl: string;
    displayOrder: number;
    isFeatured: boolean;
    publicationStatus: VisaPublicationStatus;
    serviceStatus: AgencyServiceStatus;
  }>,
): Promise<{ success: boolean; message: string }> {
  const res = await serverFetch.patch(`/admin/visa-services/${id}`, {
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    return {
      success: false,
      message: body?.message || 'Failed to update visa service',
    };
  }
  revalidatePath('/dashboard/visa-immigration');
  revalidatePath('/dashboard/visa-immigration/services');
  revalidatePath(`/dashboard/visa-immigration/services/${id}`);
  revalidatePath('/visa-services');
  return { success: true, message: 'Visa service updated' };
}

export async function archiveAdminVisaService(
  id: string,
): Promise<{ success: boolean; message: string }> {
  const res = await serverFetch.delete(`/admin/visa-services/${id}`);
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    return {
      success: false,
      message: body?.message || 'Failed to archive visa service',
    };
  }
  revalidatePath('/dashboard/visa-immigration');
  revalidatePath('/dashboard/visa-immigration/services');
  revalidatePath('/visa-services');
  return { success: true, message: 'Visa service soft-archived' };
}

export async function getAdminVisaInquiries(params?: {
  page?: number;
  limit?: number;
  search?: string;
  countryId?: string;
  visaServiceId?: string;
  category?: VisaCategory;
}): Promise<PaginatedResponse<VisaInquiry>> {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.search) query.set('search', params.search);
  if (params?.countryId) query.set('countryId', params.countryId);
  if (params?.visaServiceId) query.set('visaServiceId', params.visaServiceId);
  if (params?.category) query.set('category', params.category);

  const res = await serverFetch.get(
    `/admin/visa-inquiries${query.toString() ? `?${query.toString()}` : ''}`,
  );
  if (!res.ok) {
    return {
      data: [],
      meta: { total: 0, page: 1, limit: 20, totalPages: 0 },
    };
  }
  return (await res.json()) as PaginatedResponse<VisaInquiry>;
}

// Action aliases for UI components
export const getAdminCountryByIdAction = getAdminCountryById;
export const getAdminCountriesAction = getAdminCountries;
export const getAdminVisaInquiriesAction = getAdminVisaInquiries;
export const getVisaAdminOverviewAction = getAdminVisaOverview;
export const getAdminVisaServiceByIdAction = getAdminVisaServiceById;
export const getAdminVisaServicesAction = getAdminVisaServices;
export const getPublicVisaServiceDetailAction = getPublicVisaServiceDetail;
export const getPublicCountryBySlugAction = getPublicCountryBySlug;
export const getPublicCountriesAction = getPublicCountries;
export const getPublicVisaServicesAction = getPublicVisaServices;
export const archiveCountryAction = archiveAdminCountry;
export const createCountryAction = createAdminCountry;
export const updateCountryAction = updateAdminCountry;
export const submitPublicVisaInquiryAction = submitVisaInquiry;
export const archiveVisaServiceAction = archiveAdminVisaService;
export const updateVisaServiceAction = updateAdminVisaService;
export const createVisaServiceAction = createAdminVisaService;

