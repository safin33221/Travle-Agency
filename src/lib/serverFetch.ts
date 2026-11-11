import { getCookies, setCookie } from '@/services/auth/tokenHandler';
import { getDefaultCookieOptions } from '@/services/auth/cookieOptions';

export function parseCookieString(cookieStr: string): Record<string, string> {
  const result: Record<string, string> = {};
  if (!cookieStr) return result;

  cookieStr.split(';').forEach((part, index) => {
    const [rawKey, ...rawVal] = part.trim().split('=');
    if (rawKey) {
      const key = rawKey.trim();
      const val = rawVal.join('=').trim();
      result[key] = val ? decodeURIComponent(val) : '';
      if (index === 0) {
        result.name = key;
        result.value = result[key];
      }
    }
  });
  return result;
}

const BackendURL =
  process.env.BACKEND_URL ??
  process.env.NEXT_PUBLIC_BACKEND_URL ??
  'http://localhost:5000';

export const buildRequestUrl = (endpoint: string): string | null => {
  if (!BackendURL) return null;

  try {
    const normalizedBase = BackendURL.endsWith('/')
      ? BackendURL
      : `${BackendURL}/`;
    let normalizedEndpoint = endpoint.startsWith('/')
      ? endpoint.slice(1)
      : endpoint;

    if (
      !normalizedEndpoint.startsWith('api/v1') &&
      !normalizedEndpoint.startsWith('api/')
    ) {
      normalizedEndpoint = `api/v1/${normalizedEndpoint}`;
    }

    return new URL(normalizedEndpoint, normalizedBase).toString();
  } catch {
    return null;
  }
};

const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken =
    (await getCookies('refresh_token')) || (await getCookies('refreshToken'));
  if (!refreshToken) return null;

  const requestUrl = buildRequestUrl('/api/v1/auth/refresh');
  if (!requestUrl) return null;

  const res = await fetch(requestUrl, {
    method: 'POST',
    headers: {
      Cookie: `refresh_token=${refreshToken}`,
      'x-refresh-token': refreshToken,
    },
    cache: 'no-store',
  });

  if (!res.ok) return null;

  const body = await res.json().catch(() => null);
  let newAccessToken: string | null = body?.accessToken || null;
  let newRefreshToken: string | null = null;

  const setCookieHeaders = res.headers.getSetCookie();
  if (setCookieHeaders?.length) {
    for (const cookie of setCookieHeaders) {
      const parsed = parseCookieString(cookie);
      if (parsed.access_token || parsed.name === 'access_token') {
        newAccessToken = parsed.access_token || parsed.value || newAccessToken;
      }
      if (parsed.refresh_token || parsed.name === 'refresh_token') {
        newRefreshToken = parsed.refresh_token || parsed.value || null;
      }
    }
  }

  if (!newAccessToken) return null;

  try {
    await setCookie('access_token', newAccessToken, {
      ...getDefaultCookieOptions(),
      maxAge: 15 * 60,
    });
    await setCookie('accessToken', newAccessToken, {
      ...getDefaultCookieOptions(),
      maxAge: 15 * 60,
    });

    if (newRefreshToken) {
      await setCookie('refresh_token', newRefreshToken, {
        ...getDefaultCookieOptions(),
        maxAge: 7 * 24 * 60 * 60,
      });
      await setCookie('refreshToken', newRefreshToken, {
        ...getDefaultCookieOptions(),
        maxAge: 7 * 24 * 60 * 60,
      });
    }
  } catch {
    // Cookie mutation may fail inside Server Component render
  }

  return newAccessToken;
};

const serverFetchHelper = async (
  endpoint: string,
  options: RequestInit,
  allowRetry = true,
): Promise<Response> => {
  const { headers, ...restOptions } = options;
  const accessToken =
    (await getCookies('access_token')) || (await getCookies('accessToken'));
  const refreshToken =
    (await getCookies('refresh_token')) || (await getCookies('refreshToken'));
  const requestUrl = buildRequestUrl(endpoint);

  if (!requestUrl) {
    return new Response(
      JSON.stringify({
        code: 'CONFIG_ERROR',
        message: 'Backend URL is missing or invalid',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }

  const requestHeaders = new Headers(headers);
  const authCookies = [
    accessToken ? `access_token=${accessToken}` : null,
    refreshToken ? `refresh_token=${refreshToken}` : null,
  ].filter(Boolean);

  if (authCookies.length > 0) {
    requestHeaders.set('Cookie', authCookies.join('; '));
  }

  if (accessToken && !requestHeaders.has('Authorization')) {
    requestHeaders.set('Authorization', `Bearer ${accessToken}`);
  }

  try {
    const response = await fetch(requestUrl, {
      headers: requestHeaders,
      cache: restOptions.cache ?? 'no-store',
      ...restOptions,
    });

    if (response.status === 401 && refreshToken && allowRetry) {
      const newAccessToken = await refreshAccessToken();
      if (newAccessToken) {
        const retryHeaders = new Headers(headers);
        retryHeaders.set('Authorization', `Bearer ${newAccessToken}`);
        retryHeaders.set(
          'Cookie',
          [
            `access_token=${newAccessToken}`,
            refreshToken ? `refresh_token=${refreshToken}` : null,
          ]
            .filter(Boolean)
            .join('; '),
        );
        return serverFetchHelper(
          endpoint,
          { ...restOptions, headers: retryHeaders },
          false,
        );
      }
    }

    return response;
  } catch {
    return new Response(
      JSON.stringify({
        code: 'SERVICE_UNAVAILABLE',
        message: 'Unable to reach TravelPilot backend server',
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }
};

export const serverFetch = {
  get: async (endpoint: string, options: RequestInit = {}): Promise<Response> =>
    serverFetchHelper(endpoint, { ...options, method: 'GET' }),
  post: async (endpoint: string, options: RequestInit = {}): Promise<Response> =>
    serverFetchHelper(endpoint, { ...options, method: 'POST' }),
  put: async (endpoint: string, options: RequestInit = {}): Promise<Response> =>
    serverFetchHelper(endpoint, { ...options, method: 'PUT' }),
  patch: async (
    endpoint: string,
    options: RequestInit = {},
  ): Promise<Response> =>
    serverFetchHelper(endpoint, { ...options, method: 'PATCH' }),
  delete: async (
    endpoint: string,
    options: RequestInit = {},
  ): Promise<Response> =>
    serverFetchHelper(endpoint, { ...options, method: 'DELETE' }),
};
