'use server';

import { cookies } from 'next/headers';
import { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies';
import { getDefaultCookieOptions } from './cookieOptions';

export const setCookie = async (
  key: string,
  value: string,
  options: Partial<ResponseCookie> = {},
) => {
  const cookiesStore = await cookies();
  cookiesStore.set(key, value, getDefaultCookieOptions(options));
};

export const getCookies = async (key: string) => {
  const cookiesStore = await cookies();
  return cookiesStore.get(key)?.value || null;
};

export const deleteCookies = async (key: string) => {
  const cookiesStore = await cookies();
  cookiesStore.set(
    key,
    '',
    getDefaultCookieOptions({
      maxAge: 0,
      expires: new Date(0),
    }),
  );
};
