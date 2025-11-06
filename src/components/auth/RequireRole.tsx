'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { hasAnyRole, Role } from '../../lib/roles';

type Props = { children: React.ReactNode; roles?: Role[] };

export default function RequireRole({ children, roles }: Props) {
  const router = useRouter();
  const [ok, setOk] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // Ưu tiên cookie session qua /me
        const r = await fetch('/api/admin/auth/me', { credentials: 'include', cache: 'no-store' });
        if (!r.ok) throw new Error('unauthorized');
        const j = await r.json();
        const rolesArr: string[] = j?.data?.user?.roles || j?.user?.roles || [];
        const pass = !roles || hasAnyRole(rolesArr, roles);
        if (mounted) setOk(pass);
        if (!pass) router.replace('/403');
      } catch {
        // fallback: thử localStorage (trường hợp BE chưa set cookie)
        try {
          const raw = localStorage.getItem('roles');
          const rolesArr = raw ? JSON.parse(raw) : [];
          const pass = !roles || hasAnyRole(rolesArr, roles);
          if (mounted) setOk(pass);
          if (!pass) router.replace('/403');
        } catch {
          if (mounted) setOk(false);
          router.replace(`/login?redirect=${encodeURIComponent(location.pathname)}`);
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, [router, roles]);

  if (ok === null) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-neutral-500">
        Checking permission…
      </div>
    );
  }

  return ok ? <>{children}</> : null;
}
