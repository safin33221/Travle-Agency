'use server';

import { serverFetch } from '@/lib/serverFetch';
import { AuditLog, PaginatedResponse } from '@/types/api';

export async function getAuditLogs(): Promise<PaginatedResponse<AuditLog>> {
  const res = await serverFetch.get('/audit-logs?limit=50');
  if (!res.ok) {
    return {
      data: [],
      meta: { total: 0, page: 1, limit: 50, totalPages: 0 },
    };
  }
  const json = (await res.json().catch(() => null)) as {
    data?: AuditLog[];
    meta?: PaginatedResponse<AuditLog>['meta'];
  } | null;
  return {
    data: Array.isArray(json?.data) ? json.data : [],
    meta: json?.meta ?? { total: 0, page: 1, limit: 50, totalPages: 0 },
  };
}
