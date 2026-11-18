'use server';

import fs from 'fs/promises';
import path from 'path';
import { revalidatePath } from 'next/cache';
import { serverFetch } from '@/lib/serverFetch';
import {
  buildLiveBrandInfo,
  DEFAULT_LIVE_BRAND,
  LiveBrandInfo,
} from '@/lib/brand';
import { AgencySettings } from '@/types/api';

const SETTINGS_CACHE_PATH = path.join(
  process.cwd(),
  '.next',
  'agency-settings-cache.json',
);

async function writeSettingsCache(settings: AgencySettings): Promise<void> {
  try {
    await fs.mkdir(path.dirname(SETTINGS_CACHE_PATH), { recursive: true });
    await fs.writeFile(
      SETTINGS_CACHE_PATH,
      JSON.stringify(settings),
      'utf-8',
    );
  } catch {
    // Ignore cache write errors in read-only environments
  }
}

async function readSettingsCache(): Promise<AgencySettings | null> {
  try {
    const raw = await fs.readFile(SETTINGS_CACHE_PATH, 'utf-8');
    return JSON.parse(raw) as AgencySettings;
  } catch {
    return null;
  }
}

function unwrapSettings(raw: unknown): AgencySettings | null {
  if (!raw || typeof raw !== 'object') return null;
  const obj = raw as Record<string, unknown>;
  const inner =
    'data' in obj && obj.data && typeof obj.data === 'object' ? obj.data : obj;
  return inner as AgencySettings;
}

export async function getAgencySettings(): Promise<AgencySettings | null> {
  const res = await serverFetch.get('/settings/agency');
  if (!res.ok) return readSettingsCache();
  const body = await res.json().catch(() => null);
  const parsed = unwrapSettings(body);
  if (parsed) {
    await writeSettingsCache(parsed);
  }
  return parsed;
}

export async function getLiveBrandInfo(): Promise<LiveBrandInfo> {
  try {
    const res = await serverFetch.get('/settings/agency');
    if (res.ok) {
      const body = await res.json().catch(() => null);
      const parsed = unwrapSettings(body);
      if (parsed) {
        await writeSettingsCache(parsed);
        return buildLiveBrandInfo(parsed);
      }
    }

    const publicRes = await serverFetch.get('/settings/public');
    if (publicRes.ok) {
      const body = await publicRes.json().catch(() => null);
      const parsed = unwrapSettings(body);
      if (parsed) {
        await writeSettingsCache(parsed);
        return buildLiveBrandInfo(parsed);
      }
    }

    const cached = await readSettingsCache();
    if (cached) {
      return buildLiveBrandInfo(cached);
    }

    return DEFAULT_LIVE_BRAND;
  } catch {
    const cached = await readSettingsCache();
    return cached ? buildLiveBrandInfo(cached) : DEFAULT_LIVE_BRAND;
  }
}

export async function updateAgencySettings(
  payload: Partial<{
    agencyName: string;
    legalName: string;
    email: string;
    phone: string;
    address: string;
    website: string;
    defaultCurrency: string;
    taxRate: number;
    quotationTerms: string;
    quotationValidityDays: number;
  }>,
): Promise<{ success: boolean; message: string; data?: AgencySettings }> {
  const res = await serverFetch.patch('/settings/agency', {
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const body = await res.json().catch(() => null);
  if (!res.ok) {
    return {
      success: false,
      message: body?.message || 'Failed to update agency settings',
    };
  }

  const saved = unwrapSettings(body);
  if (saved) {
    await writeSettingsCache(saved);
  }

  revalidatePath('/', 'layout');
  revalidatePath('/dashboard', 'layout');
  revalidatePath('/dashboard/settings');

  return {
    success: true,
    message: 'Agency settings saved & applied across website',
    data: saved ?? (body as AgencySettings),
  };
}
