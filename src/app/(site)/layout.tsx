'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Headers from '@/components/layout/Header';
import FloatingCartButton from '@/components/cart/FloatingCartButton';

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

function isPublicPath(p: string): boolean {
  const allow = [
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

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname() || '/';

  const [checked, setChecked] = useState(false);
  const tokenExists = useMemo(
    () => (typeof window !== 'undefined' ? hasToken() : false),
    [pathname]
  );
  const isPublic = useMemo(() => isPublicPath(pathname), [pathname]);

  useEffect(() => {
    // chờ client mount rồi mới quyết định
    setChecked(true);
    // nếu muốn: lắng nghe thay đổi token
    const onAuth = () => location.reload();
    window.addEventListener('auth:changed', onAuth as EventListener);
    return () => window.removeEventListener('auth:changed', onAuth as EventListener);
  }, []);

  useEffect(() => {
    if (!checked) return;
    if (!isPublic && !tokenExists) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [checked, isPublic, tokenExists, pathname, router]);

  // Optional: khi chưa check xong, tránh nhấp nháy
  if (!checked) return null;

  return (
    <div className="min-h-screen overflow-x-clip bg-slate-50">
      <Headers />
      <main className="min-h-[calc(100vh-64px)]">{children}</main>
      <FloatingCartButton />
    </div>
  );
}
