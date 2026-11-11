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

export async function getDashboardSummary(): Promise<DashboardSummary> {
  try {
    const res = await serverFetch.get('/dashboard/summary');
    if (!res.ok) return EMPTY_SUMMARY;
    const data = (await res.json().catch(() => null)) as Record<string, unknown> | null;
    if (!data || typeof data !== 'object') return EMPTY_SUMMARY;

    const quotations = (data['quotations'] as Record<string, unknown>) || {};
    const leads = (data['leads'] as Record<string, unknown>) || {};
    const followUps = (data['followUps'] as Record<string, unknown>) || {};
    const packages = (data['packages'] as Record<string, unknown>) || {};
    const byStage = (leads['byStage'] as Record<string, unknown>) || {};

    const draft = Number(quotations['draft'] ?? quotations['draftCount']) || 0;
    const approved = Number(quotations['approved'] ?? quotations['approvedCount']) || 0;
    const totalQuotes = Number(quotations['total']) || draft + approved;

    return {
      leads: {
        total: Number(leads['total']) || 0,
        byStage: {
          NEW: Number(byStage['NEW']) || 0,
          QUALIFIED: Number(byStage['QUALIFIED']) || 0,
          QUOTED: Number(byStage['QUOTED']) || 0,
          FOLLOW_UP: Number(byStage['FOLLOW_UP']) || 0,
          WON: Number(byStage['WON']) || 0,
          LOST: Number(byStage['LOST']) || 0,
        },
      },
      quotations: {
        total: totalQuotes,
        draft,
        approved,
        wonRevenue: (quotations['wonRevenue'] as string | number) ?? '0',
      },
      followUps: {
        openCount: Number(followUps['openCount']) || 0,
        overdueCount: Number(followUps['overdueCount']) || 0,
        upcomingTasks: Array.isArray(followUps['upcomingTasks'])
          ? (followUps['upcomingTasks'] as DashboardSummary['followUps']['upcomingTasks'])
          : [],
      },
      packages: {
        activeCount: Number(packages['activeCount']) || 0,
      },
    };
  } catch {
    return EMPTY_SUMMARY;
  }
}
