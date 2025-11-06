// src/app/account/page.tsx
'use client';

import { useEffect, useState } from 'react';
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

  async function loadMe() {
    setErr(null);
    try {
      const u = await apiGetMe();
      setUser(u);
      mergeCachedUser(u); // đồng bộ local cache cho các nơi khác dùng
      setStatus('ok');
    } catch (e: any) {
      const msg = String(e?.message || '');
      if (msg.includes('HTTP 401') || msg.includes('HTTP 403')) {
        setUser(null);
        setStatus('unauth');
      } else {
        setErr(msg);
        setStatus('unauth');
      }
    }
  }

  // nạp user thật từ BE khi mở trang
  useEffect(() => {
    loadMe();
    // khi login/logout ở nơi khác → reload
    const onAuth = () => loadMe();
    window.addEventListener(AUTH_EVENT_NAME, onAuth);
    return () => window.removeEventListener(AUTH_EVENT_NAME, onAuth);
  }, []);

  const onUserChange = (u: UserResponse) => {
    setUser(u);
    mergeCachedUser(u);
  };

  return (
    <main className="min-h-[80vh] bg-slate-50">
      <div className="mx-auto w/full max-w-7xl px-4 py-6">
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
