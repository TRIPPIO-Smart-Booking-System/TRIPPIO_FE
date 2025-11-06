// middleware.ts
import { NextResponse, NextRequest } from 'next/server';

import { Role } from '@/lib/roles';

const RULES: Array<{ base: string; roles: Role[] }> = [
  { base: '/admin', roles: ['admin'] },
  { base: '/staff', roles: ['admin', 'staff'] },
  { base: '/account', roles: ['customer', 'staff', 'admin'] }, // chỉ cần đăng nhập
];

// Parse JWT (Base64 URL-safe) để lấy payload
function parseJwt(token?: string): any | null {
  if (!token) return null;
  try {
    const b64 = token.split('.')[1];
    if (!b64) return null;
    const json = Buffer.from(b64.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString();
    return JSON.parse(json);
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
  // admin luôn được phép
  if (lower.includes('admin')) return true;
  return required.some((r) => lower.includes(r));
}

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const need = requiredRolesFor(pathname);
  if (!need) return NextResponse.next(); // route không bảo vệ

  // Lấy token từ cookie (ưu tiên accessToken; fallback authToken)
  const token = req.cookies.get('accessToken')?.value || req.cookies.get('authToken')?.value || '';

  // Chưa đăng nhập → chuyển về /login?redirect=...
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname + (search || ''));
    return NextResponse.redirect(url);
  }

  // Có token → giải mã lấy roles
  const payload = parseJwt(token);
  const roles: string[] =
    payload?.roles || (typeof payload?.role === 'string' ? [payload.role] : []) || [];

  if (hasAnyRole(roles, need)) {
    return NextResponse.next();
  }

  // Không đủ quyền → /403
  const deny = req.nextUrl.clone();
  deny.pathname = '/403';
  return NextResponse.redirect(deny);
}

export const config = {
  // Bảo vệ các khu vực cần role (route group như (site) không xuất hiện trên URL)
  matcher: ['/admin/:path*', '/staff/:path*', '/account/:path*'],
};
