// src/components/auth/LogoutButton.tsx
'use client';

import { useRouter } from 'next/navigation';
import { logoutClientOnly } from '@/lib/logout';

export default function LogoutButton() {
  const router = useRouter();
  const handle = async () => {
    await logoutClientOnly();
    router.replace('/login');
    router.refresh();
  };
  return (
    <button onClick={handle} className="rounded-xl border px-3 py-2 text-sm hover:bg-zinc-50">
      Đăng xuất
    </button>
  );
}
