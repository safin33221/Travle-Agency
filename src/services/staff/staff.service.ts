'use server';

import { revalidatePath } from 'next/cache';
import { serverFetch } from '@/lib/serverFetch';
import {
  PaginatedResponse,
  StaffRole,
  StaffStatus,
  StaffUser,
} from '@/types/api';

export async function getStaffList(): Promise<PaginatedResponse<StaffUser>> {
  const res = await serverFetch.get('/staff');
  if (!res.ok) {
    return {
      data: [],
      meta: { total: 0, page: 1, limit: 20, totalPages: 0 },
    };
  }
  return (await res.json()) as PaginatedResponse<StaffUser>;
}

export async function createStaff(payload: {
  name: string;
  email: string;
  password: string;
  role: StaffRole;
}): Promise<{ success: boolean; message: string; data?: StaffUser }> {
  const res = await serverFetch.post('/staff', {
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const body = await res.json().catch(() => null);
  if (!res.ok) {
    return {
      success: false,
      message: body?.message || 'Failed to create staff account',
    };
  }

  revalidatePath('/dashboard/staff');
  return {
    success: true,
    message: 'Staff account provisioned',
    data: body as StaffUser,
  };
}

export async function updateStaff(
  id: string,
  payload: { role?: StaffRole; status?: StaffStatus; name?: string },
): Promise<{ success: boolean; message: string }> {
  const res = await serverFetch.patch(`/staff/${id}`, {
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const body = await res.json().catch(() => null);
  if (!res.ok) {
    return {
      success: false,
      message: body?.message || 'Failed to update staff account',
    };
  }

  revalidatePath('/dashboard/staff');
  return {
    success: true,
    message: 'Staff updated',
  };
}
