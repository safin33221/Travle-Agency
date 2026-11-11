import { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies';

export const getDefaultCookieOptions = (
  overrides: Partial<ResponseCookie> = {},
): Partial<ResponseCookie> => {
  const isProd = process.env.NODE_ENV === 'production';

  return {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    ...overrides,
  };
};
