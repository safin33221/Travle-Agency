'use server';

import { serverFetch } from '@/lib/serverFetch';
import { DashboardSummary } from '@/types/api';

const EMPTY_SUMMARY: DashboardSummary = {
  leads: {
    total: 0,
    byStage: {
      NEW: 0,
      QUALIFIED: 0,
      QUOTED: 0,
      FOLLOW_UP: 0,
      WON: 0,
      LOST: 0,
    },
  },
  quotations: {
    total: 0,
    draft: 0,
    approved: 0,
    wonRevenue: '0',
  },
  followUps: {
    openCount: 0,
    overdueCount: 0,
    upcomingTasks: [],
  },
  packages: {
    activeCount: 0,
  },
};

interface RawDashboardSummary {
  leads?: {
    total?: number;
    byStage?: Record<string, number>;
  };
  quotations?: {
    total?: number;
    draft?: number;
    draftCount?: number;
    approved?: number;
    approvedCount?: number;
    wonRevenue?: string | number;
  };
  followUps?: {
    openCount?: number;
    overdueCount?: number;
    upcomingTasks?: DashboardSummary['followUps']['upcomingTasks'];
  };
  packages?: {
    activeCount?: number;
  };
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  try {
    const res = await serverFetch.get('/dashboard/summary');
    if (!res.ok) return EMPTY_SUMMARY;
    const raw = (await res.json().catch(() => null)) as RawDashboardSummary | null;
    if (!raw) return EMPTY_SUMMARY;

    const draft = Number(raw?.quotations?.draft ?? raw?.quotations?.draftCount ?? 0);
    const approved = Number(raw?.quotations?.approved ?? raw?.quotations?.approvedCount ?? 0);
    const totalQuotations = Number(raw?.quotations?.total ?? (draft + approved));
    const wonRevenue = raw?.quotations?.wonRevenue ?? '0';

    return {
      leads: {
        total: Number(raw?.leads?.total ?? 0),
        byStage: {
          NEW: Number(raw?.leads?.byStage?.NEW ?? 0),
          QUALIFIED: Number(raw?.leads?.byStage?.QUALIFIED ?? 0),
          QUOTED: Number(raw?.leads?.byStage?.QUOTED ?? 0),
          FOLLOW_UP: Number(raw?.leads?.byStage?.FOLLOW_UP ?? 0),
          WON: Number(raw?.leads?.byStage?.WON ?? 0),
          LOST: Number(raw?.leads?.byStage?.LOST ?? 0),
          ...(raw?.leads?.byStage ?? {}),
        },
      },
      quotations: {
        total: totalQuotations,
        draft,
        approved,
        wonRevenue,
      },
      followUps: {
        openCount: Number(raw?.followUps?.openCount ?? 0),
        overdueCount: Number(raw?.followUps?.overdueCount ?? 0),
        upcomingTasks: Array.isArray(raw?.followUps?.upcomingTasks)
          ? raw.followUps.upcomingTasks
          : [],
      },
      packages: {
        activeCount: Number(raw?.packages?.activeCount ?? 0),
      },
    };
  } catch {
    return EMPTY_SUMMARY;
  }
}
