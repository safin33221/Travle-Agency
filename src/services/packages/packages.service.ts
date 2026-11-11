'use server';

import { revalidatePath } from 'next/cache';
import { serverFetch } from '@/lib/serverFetch';
import { PaginatedResponse, ServiceCategory, TourPackage } from '@/types/api';

export async function getPackages(params?: {
  page?: number;
  limit?: number;
  category?: ServiceCategory;
  search?: string;
  destination?: string;
  isArchived?: boolean;
}): Promise<PaginatedResponse<TourPackage>> {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.category) query.set('category', params.category);
  if (params?.search) query.set('search', params.search);
  if (params?.destination) query.set('destination', params.destination);
  // Only send isArchived when explicitly true.
  // Sending 'false' causes class-transformer's Boolean("false") to parse as true on the backend!
  if (params?.isArchived === true) {
    query.set('isArchived', 'true');
  }

  const endpoint = `/packages${query.toString() ? `?${query.toString()}` : ''}`;
  const res = await serverFetch.get(endpoint);

  if (!res.ok) {
    return {
      data: [],
      meta: { total: 0, page: 1, limit: 20, totalPages: 0 },
    };
  }

  const json = (await res.json().catch(() => null)) as PaginatedResponse<TourPackage> | null;
  return {
    data: Array.isArray(json?.data) ? json.data : [],
    meta: json?.meta ?? { total: 0, page: 1, limit: 20, totalPages: 0 },
  };
}

export async function getSinglePackage(
  id: string,
): Promise<TourPackage | null> {
  const res = await serverFetch.get(`/packages/${id}`);
  if (!res.ok) return null;
  return (await res.json()) as TourPackage;
}

export async function createPackage(payload: {
  category?: ServiceCategory;
  title: string;
  destination: string;
  durationDays: number;
  description: string;
  inclusions: string[];
  exclusions: string[];
  requiredDocuments?: string[];
  structuredSpecs?: Record<string, unknown>;
  basePrice: number;
  currency?: string;
  validFrom?: string;
  validUntil?: string;
  notes?: string;
}): Promise<{ success: boolean; message: string; data?: TourPackage }> {
  const res = await serverFetch.post('/packages', {
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const body = await res.json().catch(() => null);
  if (!res.ok) {
    return {
      success: false,
      message: body?.message || 'Failed to create package',
    };
  }

  revalidatePath('/dashboard/packages');
  revalidatePath('/packages');
  revalidatePath('/');

  return {
    success: true,
    message: 'Package created successfully',
    data: body as TourPackage,
  };
}

export async function archivePackage(
  id: string,
): Promise<{ success: boolean; message: string }> {
  const res = await serverFetch.delete(`/packages/${id}`);
  const body = await res.json().catch(() => null);

  if (!res.ok) {
    return {
      success: false,
      message: body?.message || 'Failed to archive package',
    };
  }

  revalidatePath('/dashboard/packages');
  revalidatePath('/packages');
  revalidatePath('/');

  return {
    success: true,
    message: 'Package archived successfully',
  };
}
