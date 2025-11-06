// src/app/(site)/layout.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Headers from '@/components/layout/Header';
import FloatingDock from '@/components/FloatingDock';
import ChatWidget from '@/components/ChatWidget';

/* ---------- Types ---------- */
type JwtPayload = {
  roles?: string[] | string;
  role?: string;
  [k: string]: unknown;
};

/* ---------- Helpers ---------- */
function hasToken(): boolean {
  try {
    const keys = ['accessToken', 'authToken', 'userId', 'trippio_token'];
    return keys.some((k) => {
      const v = localStorage.getItem(k);
      return typeof v === 'string' && v.length > 0;
    });
  } catch {
    return false;
  }
}

function parseJwt(token?: string): JwtPayload | null {
  if (!token) return null;
  try {
    const b64 = token.split('.')[1];
    if (!b64) return null;
    const json = atob(b64.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json) as unknown as JwtPayload;
  } catch {
    return null;
  }
}

function normalizeRoles(rs: unknown): string[] {
  const arr = Array.isArray(rs) ? rs : typeof rs === 'string' ? [rs] : [];
  return arr
    .map((r) => String(r || '').toLowerCase())
    .map((r) => (r.startsWith('role_') ? r.slice(5) : r));
}

function getRolesFromLocal(): string[] {
  try {
    const raw = localStorage.getItem('roles');
    if (raw) return normalizeRoles(JSON.parse(raw));
    const tok =
      localStorage.getItem('accessToken') ||
      localStorage.getItem('authToken') ||
      localStorage.getItem('trippio_token') ||
      '';
    const payload = parseJwt(tok) || {};
    return normalizeRoles(payload.roles ?? (payload.role ? [payload.role] : []));
  } catch {
    return [];
  }
}

function isCustomer(roles: string[]): boolean {
  return roles.includes('customer') || roles.includes('user');
}

function isPublicPath(p: string): boolean {
  const allow = [
    '/', // cho phép vào root, ta sẽ tự điều hướng theo role
    '/login',
    '/register',
    '/verify-otp',
    '/forgot-password',
    '/reset-password',
    '/api',
    '/_next',
    '/favicon.ico',
  ];
  return allow.some((x) => p === x || p.startsWith(x + '/'));
}

/* ---------- Layout ---------- */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname() || '/';
  const [ready, setReady] = useState(false);
  const [allowed, setAllowed] = useState<boolean | null>(null);

  // No unnecessary deps warning: compute once (reload on 'auth:changed' anyway)
  const tokenExists = useMemo(() => (typeof window !== 'undefined' ? hasToken() : false), []);
  const isPublic = useMemo(() => isPublicPath(pathname), [pathname]);

  useEffect(() => {
    setReady(true);
    const onAuth = () => location.reload();
    window.addEventListener('auth:changed', onAuth as EventListener);
    return () => window.removeEventListener('auth:changed', onAuth as EventListener);
  }, []);

  useEffect(() => {
    if (!ready) return;

    // PUBLIC
    if (isPublic) {
      if (pathname === '/' && tokenExists) {
        const roles = getRolesFromLocal();
        if (roles.includes('admin')) {
          router.replace('/admin');
          return setAllowed(false);
        }
        if (roles.includes('staff')) {
          router.replace('/staff');
          return setAllowed(false);
        }
      }
      setAllowed(true);
      return;
    }

    // PRIVATE: cần token
    if (!tokenExists) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      setAllowed(false);
      return;
    }

    const roles = getRolesFromLocal();
    if (roles.length === 0) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      setAllowed(false);
      return;
    }

    const inAdmin = pathname.startsWith('/admin');
    const inStaff = pathname.startsWith('/staff');
    const inAccount = pathname.startsWith('/account');

    // /account: CHO MỌI ROLE ĐÃ LOGIN
    if (inAccount) {
      setAllowed(true);
      return;
    }

    // Admin area
    if (roles.includes('admin')) {
      if (inAdmin) {
        setAllowed(true);
        return;
      }
      router.replace('/admin');
      setAllowed(false);
      return;
    }

    // Staff area
    if (roles.includes('staff')) {
      if (inStaff) {
        setAllowed(true);
        return;
      }
      router.replace('/staff');
      setAllowed(false);
      return;
    }

    // Customer
    if (isCustomer(roles)) {
      if (inAdmin || inStaff) {
        router.replace('/homepage');
        setAllowed(false);
        return;
      }
      setAllowed(true);
      return;
    }

    router.replace('/403');
    setAllowed(false);
  }, [ready, isPublic, tokenExists, pathname, router]);

  if (!ready || allowed === null) return null;

  return (
    <div className="min-h-screen overflow-x-clip bg-slate-50">
      <Headers />
      <main className="min-h-[calc(100vh-64px)]">{children}</main>
      <FloatingDock />
      <ChatWidget />
    </div>
  );
}
