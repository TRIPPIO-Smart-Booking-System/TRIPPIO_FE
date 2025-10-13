// app/account/page.tsx
'use client';

import { useEffect, useState } from 'react';
import ProfileTab from '@/components/account/profile/ProfileTab';
import SecurityTab from '@/components/account/SecurityTab';
import SidebarAccount from '@/components/account/SidebarAccount';

import { getCurrentUserId, UserResponse, apiGetUserById } from '@/lib/api';
import { AUTH_EVENT_NAME } from '@/lib/auth';

export default function AccountPage() {
  const [tab, setTab] = useState<'profile' | 'security'>('profile');
  const [user, setUser] = useState<UserResponse | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'unauth' | 'error'>('idle');

  const load = async () => {
    setStatus('loading');
    try {
      // Nếu BE dựa cookie session: có thể không cần userId.
      // Nhưng endpoint của bạn là /api/admin/user/{id} -> vẫn cần id.
      // Lấy id từ localStorage/JWT; nếu không có thì đánh dấu unauth.
      const uid = getCurrentUserId();
      if (!uid) {
        setUser(null);
        setStatus('unauth');
        return;
      }

      const u = await apiGetUserById(uid);
      setUser(u);
      setStatus('ok');
    } catch (e: any) {
      // Bắt 401 từ fetch helper (message chứa "HTTP 401")
      const msg = String(e?.message || '');
      if (msg.includes('HTTP 401')) {
        setUser(null);
        setStatus('unauth');
      } else {
        console.error('Fetch user failed:', e);
        setStatus('error');
      }
    }
  };

  useEffect(() => {
    // luôn thử load khi vào trang (kể cả chưa có accessToken, trường hợp dùng cookie server)
    load();

    // refetch khi có thay đổi đăng nhập/đăng xuất
    const onAuth = () => load();
    window.addEventListener(AUTH_EVENT_NAME, onAuth);
    return () => window.removeEventListener(AUTH_EVENT_NAME, onAuth);
  }, []);

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
            {status === 'loading' && (
              <div className="rounded-xl border bg-white p-6 text-sm text-muted-foreground">
                Đang tải thông tin tài khoản...
              </div>
            )}

            {status === 'unauth' && (
              <div className="rounded-xl border bg-white p-6 text-sm text-muted-foreground">
                Bạn chưa đăng nhập. Vui lòng đăng nhập để xem tài khoản.
              </div>
            )}

            {status === 'error' && (
              <div className="rounded-xl border bg-white p-6 text-sm text-red-600">
                Không tải được thông tin tài khoản. Vui lòng thử lại.
              </div>
            )}

            {status === 'ok' &&
              user &&
              (tab === 'profile' ? (
                <ProfileTab user={user} onUserChange={setUser} />
              ) : (
                <SecurityTab />
              ))}
          </section>
        </div>
      </div>
    </main>
  );
}
