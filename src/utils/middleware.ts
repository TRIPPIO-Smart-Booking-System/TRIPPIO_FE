// middleware.ts
import { NextResponse, NextRequest } from 'next/server';
import { Role } from '@/lib/roles';

const RULES: Array<{ base: string; roles: Role[] }> = [
  { base: '/admin', roles: ['admin'] },
  { base: '/staff', roles: ['admin', 'staff'] },
  { base: '/account', roles: ['customer', 'staff', 'admin'] },
];

type JwtPayload = {
  roles?: string[];
  role?: string;
} & Record<string, unknown>;

// Parse JWT (Base64 URL-safe) để lấy payload
function parseJwt(token?: string): JwtPayload | null {
  if (!token) return null;
  try {
    const b64 = token.split('.')[1];
    if (!b64) return null;
    const json = Buffer.from(b64.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString();
    const obj: unknown = JSON.parse(json);
    return obj && typeof obj === 'object' ? (obj as JwtPayload) : null;
  } catch {
    return null;
  }
}

function requiredRolesFor(pathname: string): Role[] | null {
  for (const r of RULES) {
    if (pathname.startsWith(r.base)) return r.roles;
  }
  return null;
}

function hasAnyRole(userRoles: string[] | undefined, required: Role[]): boolean {
  if (!required.length) return true;
  const lower = (userRoles ?? []).map((r) => r.toLowerCase());
  if (lower.includes('admin')) return true;
  return required.some((r) => lower.includes(r));
}

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const need = requiredRolesFor(pathname);
  if (!need) return NextResponse.next();

  const token = req.cookies.get('accessToken')?.value || req.cookies.get('authToken')?.value || '';

  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname + (search || ''));
    return NextResponse.redirect(url);
  }

  const payload = parseJwt(token);
  const roles: string[] =
    payload?.roles || (typeof payload?.role === 'string' ? [payload.role] : []) || [];

  if (hasAnyRole(roles, need)) {
    return NextResponse.next();
  }

  const deny = req.nextUrl.clone();
  deny.pathname = '/403';
  return NextResponse.redirect(deny);
}

export const config = {
  matcher: ['/admin/:path*', '/staff/:path*', '/account/:path*'],
};
