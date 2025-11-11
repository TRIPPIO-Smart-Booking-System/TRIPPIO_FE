// src/app/account/page.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import ProfileTab from '@/components/account/profile/ProfileTab';
import SecurityTab from '@/components/account/SecurityTab';
import SidebarAccount from '@/components/account/SidebarAccount';
import type { UserResponse } from '@/lib/api';
import { apiGetMe } from '@/lib/api';
import { AUTH_EVENT_NAME, mergeCachedUser } from '@/lib/auth';

export default function AccountPage() {
  const [tab, setTab] = useState<'profile' | 'security'>('profile');
  const [user, setUser] = useState<UserResponse | null>(null);
  const [status, setStatus] = useState<'idle' | 'ok' | 'unauth'>('idle');
  const [err, setErr] = useState<string | null>(null);

  // Guard: bỏ qua AUTH_EVENT phát ra do chính trang này merge cache
  const mergingRef = useRef(false);

  async function loadMe() {
    setErr(null);
    try {
      const u = await apiGetMe();
      setUser(u);

      // Nếu mergeCachedUser hỗ trợ { silent }, dùng nó; nếu không, dùng guard mergingRef
      mergingRef.current = true;
      try {
        mergeCachedUser(u, { silent: true });
      } catch {
        // hàm không nhận opts -> vẫn gọi bình thường, guard sẽ chặn vòng lặp
        mergeCachedUser(u as any);
      } finally {
        // nhả cờ sau microtask để listener không bắt lại event vừa phát
        queueMicrotask(() => (mergingRef.current = false));
      }

      setStatus('ok');
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes('HTTP 401') || msg.includes('HTTP 403')) {
        setUser(null);
        setStatus('unauth');
      } else {
        setErr(msg);
        setStatus('unauth');
      }
    }
  }

  useEffect(() => {
    loadMe();
    const onAuth = () => {
      if (mergingRef.current) return; // bỏ qua event do chính trang phát
      void loadMe();
    };
    window.addEventListener(AUTH_EVENT_NAME, onAuth as EventListener);
    return () => window.removeEventListener(AUTH_EVENT_NAME, onAuth as EventListener);
  }, []);

  const onUserChange = (u: UserResponse) => {
    setUser(u);
    // cập nhật cache nhưng tránh lặp (dùng silent nếu có, fallback sang guard)
    mergingRef.current = true;
    try {
      mergeCachedUser(u, { silent: true });
    } catch {
      mergeCachedUser(u as any);
    } finally {
      queueMicrotask(() => (mergingRef.current = false));
    }
  };

  return (
    <main className="min-h-[80vh] bg-slate-50">
      <div className="mx-auto w-full max-w-7xl px-4 py-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-[260px_minmax(0,1fr)]">
          <SidebarAccount
            activeTab={tab}
            setTab={setTab}
            fullName={user?.fullName ?? (status === 'ok' ? '' : 'Chưa đăng nhập')}
          />

          <section className="mx-auto w-full max-w-3xl space-y-6">
            {status === 'unauth' && (
              <div className="rounded-xl border bg-white p-6 text-sm text-muted-foreground">
                Bạn chưa đăng nhập. Vui lòng đăng nhập để xem tài khoản.
                {err && <div className="mt-2 text-red-600">Lỗi: {err}</div>}
              </div>
            )}

            {status === 'ok' &&
              user &&
              (tab === 'profile' ? (
                <ProfileTab user={user} onUserChange={onUserChange} />
              ) : (
                <SecurityTab />
              ))}
          </section>
        </div>
      </div>
    </main>
  );
}
