'use server';

import { serverFetch } from '@/lib/serverFetch';
import { getCookies, setCookie } from './tokenHandler';
import { getDefaultCookieOptions } from './cookieOptions';
import { StaffUser } from '@/types/api';

export async function getMe(): Promise<StaffUser | null> {
  const token =
    (await getCookies('access_token')) ||
    (await getCookies('accessToken')) ||
    (await getCookies('refresh_token'));

  if (!token) return null;

  try {
    const res = await serverFetch.get('/auth/me');
    if (res.ok) {
      const data = (await res.json()) as StaffUser;
      if (data?.id) {
        try {
          await setCookie('userSession', JSON.stringify(data), {
            ...getDefaultCookieOptions({ httpOnly: false }),
            maxAge: 7 * 24 * 60 * 60,
          });
        } catch {
          // Ignore cookie write inside static RSC render
        }
        return data;
      }
    }
  } catch {
    // Fall back to cached session if backend is temporarily unreachable
  }

  const sessionStr = await getCookies('userSession');
  if (sessionStr) {
    try {
      const parsed = JSON.parse(sessionStr) as StaffUser;
      if (parsed?.id && parsed?.role) {
        return parsed;
      }
    } catch {
      return null;
    }
  }

  return null;
}
