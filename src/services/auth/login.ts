'use server';

import { serverFetch, parseCookieString } from '@/lib/serverFetch';
import { getDefaultDashboard } from '@/lib/auth-utils';
import { StaffUser } from '@/types/api';
import { getDefaultCookieOptions } from './cookieOptions';
import { setCookie } from './tokenHandler';

export interface LoginActionResult {
  success: boolean;
  message: string;
  user?: StaffUser;
  redirectTo?: string;
}

export const login = async (
  _prevState: unknown,
  formData: FormData,
): Promise<LoginActionResult> => {
  try {
    const callbackUrl = String(
      formData.get('callbackUrl') || formData.get('redirect') || '',
    ).trim();

    const payload = {
      email: String(formData.get('email') || '')
        .toLowerCase()
        .trim(),
      password: String(formData.get('password') || ''),
    };

    if (!payload.email || !payload.password) {
      return {
        success: false,
        message: 'Email and password are required',
      };
    }

    const res = await serverFetch.post('/auth/login', {
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const result = await res.json().catch(() => null);

    if (!res.ok) {
      return {
        success: false,
        message: result?.message || 'Invalid email or password',
      };
    }

    let accessTokenValue: string | null = result?.accessToken || null;
    let refreshTokenValue: string | null = null;

    const setCookieHeaders = res.headers.getSetCookie();
    if (setCookieHeaders?.length) {
      for (const cookie of setCookieHeaders) {
        const parsed = parseCookieString(cookie);
        if (parsed.access_token || parsed.name === 'access_token') {
          accessTokenValue =
            parsed.access_token || parsed.value || accessTokenValue;
        }
        if (parsed.refresh_token || parsed.name === 'refresh_token') {
          refreshTokenValue = parsed.refresh_token || parsed.value || null;
        }
      }
    }

    if (accessTokenValue) {
      await setCookie('access_token', accessTokenValue, {
        ...getDefaultCookieOptions(),
        maxAge: 15 * 60,
      });
      await setCookie('accessToken', accessTokenValue, {
        ...getDefaultCookieOptions(),
        maxAge: 15 * 60,
      });
    }

    if (refreshTokenValue) {
      await setCookie('refresh_token', refreshTokenValue, {
        ...getDefaultCookieOptions(),
        maxAge: 7 * 24 * 60 * 60,
      });
      await setCookie('refreshToken', refreshTokenValue, {
        ...getDefaultCookieOptions(),
        maxAge: 7 * 24 * 60 * 60,
      });
    }

    const user: StaffUser | undefined = result?.user;
    if (user) {
      await setCookie('userSession', JSON.stringify(user), {
        ...getDefaultCookieOptions({ httpOnly: false }),
        maxAge: 7 * 24 * 60 * 60,
      });
    }

    const defaultDashboard = getDefaultDashboard(user?.role);
    const isSafeCallback =
      callbackUrl.startsWith('/') &&
      !callbackUrl.startsWith('//') &&
      !callbackUrl.includes('://');

    return {
      success: true,
      message: 'Signed in successfully',
      user,
      redirectTo: isSafeCallback ? callbackUrl : defaultDashboard,
    };
  } catch (error: unknown) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'Unable to sign in at this moment',
    };
  }
};
