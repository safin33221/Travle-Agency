'use server';

import { serverFetch } from '@/lib/serverFetch';
import { deleteCookies } from './tokenHandler';

export async function logout(): Promise<{ success: boolean; message: string }> {
  try {
    await serverFetch.post('/auth/logout').catch(() => null);
    await deleteCookies('access_token');
    await deleteCookies('refresh_token');
    await deleteCookies('accessToken');
    await deleteCookies('refreshToken');
    await deleteCookies('userSession');

    return {
      success: true,
      message: 'Logged out successfully',
    };
  } catch (error: unknown) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Logout failed',
    };
  }
}
