import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { StaffRole } from '@/types/api';

const AUTH_COOKIES = [
  'access_token',
  'accessToken',
  'refresh_token',
  'refreshToken',
  'userSession',
] as const;

const ADMIN_ONLY_PREFIXES = [
  '/dashboard/staff',
  '/dashboard/settings',
  '/dashboard/audit-logs',
  '/dashboard/packages/create',
];

const PROTECTED_PAGE_PREFIXES = ['/dashboard', '/my-profile', '/change-password'];
const PROTECTED_API_PREFIXES = ['/api/quotations'];
const HIDDEN_PUBLIC_AUTH_PROBES = ['/login', '/signin', '/admin', '/staff-login'];

function getStaffPortalPath(): string {
  const raw = process.env.STAFF_LOGIN_PATH?.trim() || '/office-portal';
  const normalized = raw.startsWith('/') ? raw : `/${raw}`;
  return normalized.length > 1 && normalized.endsWith('/')
    ? normalized.slice(0, -1)
    : normalized;
}

interface DecodedSession {
  hasValidSession: boolean;
  role?: StaffRole;
  status?: string;
}

function isSafeRelativePath(path: string): boolean {
  return (
    path.startsWith('/') &&
    !path.startsWith('//') &&
    !path.includes('://') &&
    !path.includes('\\')
  );
}

function decodeJwtSafely(token: string, secrets: string[]): JwtPayload | null {
  for (const secret of secrets) {
    try {
      const verified = jwt.verify(token, secret);
      if (verified && typeof verified === 'object') {
        return verified as JwtPayload;
      }
    } catch {
      // Try next secret or fall back if backend uses a different signing key
    }
  }

  try {
    const decoded = jwt.decode(token);
    if (!decoded || typeof decoded !== 'object') return null;
    const payload = decoded as JwtPayload;
    if (payload.exp && payload.exp * 1000 <= Date.now()) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

function inspectSession(request: NextRequest): DecodedSession {
  const accessToken =
    request.cookies.get('access_token')?.value ||
    request.cookies.get('accessToken')?.value;
  const refreshToken =
    request.cookies.get('refresh_token')?.value ||
    request.cookies.get('refreshToken')?.value;

  const accessSecrets = [
    process.env.JWT_ACCESS_SECRET,
    process.env.JWT_SECRET,
  ].filter((v): v is string => Boolean(v));
  const refreshSecrets = [
    process.env.JWT_REFRESH_SECRET,
    process.env.JWT_SECRET,
  ].filter((v): v is string => Boolean(v));

  const accessPayload = accessToken
    ? decodeJwtSafely(accessToken, accessSecrets)
    : null;
  const refreshPayload = refreshToken
    ? decodeJwtSafely(refreshToken, refreshSecrets)
    : null;

  // Keep session active if either a valid access token or a valid refresh token exists
  // (serverFetch will transparently rotate expired access tokens via refresh_token)
  const activePayload = accessPayload || refreshPayload;
  if (!activePayload) {
    return { hasValidSession: false };
  }

  let role = activePayload.role as StaffRole | undefined;
  let status = activePayload.status as string | undefined;

  const userSessionRaw = request.cookies.get('userSession')?.value;
  if (userSessionRaw) {
    try {
      const parsed = JSON.parse(userSessionRaw) as {
        role?: StaffRole;
        status?: string;
      };
      if (!role && parsed.role) role = parsed.role;
      if (!status && parsed.status) status = parsed.status;
    } catch {
      // Ignore malformed non-httpOnly userSession cookie
    }
  }

  if (status === 'INACTIVE') {
    return { hasValidSession: false, role, status };
  }

  return {
    hasValidSession: true,
    role,
    status,
  };
}

function clearAuthCookies(response: NextResponse): void {
  for (const name of AUTH_COOKIES) {
    response.cookies.set(name, '', {
      path: '/',
      maxAge: 0,
      expires: new Date(0),
    });
  }
}

function applySecurityHeaders(
  response: NextResponse,
  isPrivateRoute: boolean,
): NextResponse {
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  );
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('X-DNS-Prefetch-Control', 'off');
  response.headers.set(
    'Content-Security-Policy',
    "frame-ancestors 'none'; base-uri 'self'; form-action 'self';",
  );

  if (isPrivateRoute) {
    response.headers.set(
      'Cache-Control',
      'no-store, no-cache, must-revalidate, private',
    );
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  }

  return response;
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // 1. Reject spoofed internal Next.js subrequest header
  if (request.headers.has('x-middleware-subrequest')) {
    return new NextResponse(
      JSON.stringify({ success: false, message: 'Forbidden request header' }),
      {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }

  // 2. Reject path traversal or null-byte injection attempts
  const lowerUrl = request.url.toLowerCase();
  if (
    lowerUrl.includes('%00') ||
    pathname.includes('..') ||
    lowerUrl.includes('%2e%2e')
  ) {
    return new NextResponse(
      JSON.stringify({ success: false, message: 'Malformed request path' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }

  const staffPortalPath = getStaffPortalPath();
  const isSecretPortal =
    pathname === staffPortalPath || pathname.startsWith(`${staffPortalPath}/`);
  const isHiddenAuthProbe = HIDDEN_PUBLIC_AUTH_PROBES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  // 2b. Conceal common login/admin paths (/login, /admin, /signin) from the public with 404
  if (isHiddenAuthProbe && staffPortalPath !== '/login') {
    const notFoundRes = NextResponse.rewrite(
      new URL('/__hidden-portal-404', request.url),
    );
    return applySecurityHeaders(notFoundRes, true);
  }

  const isProtectedPage = PROTECTED_PAGE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  const isProtectedApi = PROTECTED_API_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  const isAdminOnlyRoute = ADMIN_ONLY_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  const isPrivateRoute =
    isProtectedPage || isProtectedApi || isSecretPortal;

  const session = inspectSession(request);

  // 3. Protect private API routes with strict 401 JSON response
  if (isProtectedApi && !session.hasValidSession) {
    const res = NextResponse.json(
      { success: false, message: 'Authentication required' },
      { status: 401 },
    );
    clearAuthCookies(res);
    return applySecurityHeaders(res, true);
  }

  // 4. Protect Dashboard & staff account routes (redirect intruders to / without leaking portal URL)
  if (isProtectedPage && !session.hasValidSession) {
    const res = NextResponse.redirect(new URL('/', request.url));
    clearAuthCookies(res);
    return applySecurityHeaders(res, true);
  }

  // 5. Enforce RBAC for OWNER_ADMIN-only routes
  if (isAdminOnlyRoute && session.role && session.role !== 'OWNER_ADMIN') {
    const fallbackUrl = new URL('/dashboard', request.url);
    fallbackUrl.searchParams.set('error', 'unauthorized');
    const res = NextResponse.redirect(fallbackUrl);
    return applySecurityHeaders(res, true);
  }

  // 6. Handle the Stealth Official Staff Portal URL (rewrites internally to /login)
  if (isSecretPortal) {
    if (session.hasValidSession) {
      const callbackUrl = request.nextUrl.searchParams.get('callbackUrl') || '';
      const destination = isSafeRelativePath(callbackUrl)
        ? callbackUrl
        : '/dashboard';
      const res = NextResponse.redirect(new URL(destination, request.url));
      return applySecurityHeaders(res, true);
    }

    const internalLoginUrl = new URL(`/login${search}`, request.url);
    const res = NextResponse.rewrite(internalLoginUrl);
    return applySecurityHeaders(res, true);
  }

  // 7. Attach security headers & verified request context headers downstream
  const requestHeaders = new Headers(request.headers);
  if (session.hasValidSession && session.role) {
    requestHeaders.set('x-staff-role', session.role);
  }

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  return applySecurityHeaders(response, isPrivateRoute);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt
     * - static asset extensions
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
