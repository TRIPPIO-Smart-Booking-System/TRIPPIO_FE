'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import RequireRole from '@/components/auth/RequireRole';
import { LogOut } from 'lucide-react';

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    try {
      localStorage.removeItem('userId');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('authToken');
      localStorage.removeItem('trippio_token');
    } catch {}
    window.dispatchEvent(new Event('auth:changed'));
    window.location.href = '/login';
  };

  return (
    <RequireRole roles={['admin', 'staff']}>
      {mounted && (
        <>
          {/* Top bar with logout */}
          <div className="fixed top-0 left-0 right-0 h-14 bg-gradient-to-r from-slate-900 to-blue-900 border-b border-blue-700/30 shadow-lg z-50 flex items-center justify-between px-6">
            <Link
              href="/staff"
              className="text-white font-bold text-lg hover:text-blue-200 transition-colors"
            >
              Trippio Staff
            </Link>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/40 border border-red-500/50 text-red-200 font-semibold transition-colors"
            >
              <LogOut className="h-4 w-4" /> Đăng xuất
            </button>
          </div>
          {/* Content area with padding for top bar */}
          <div className="pt-14">{children}</div>
        </>
      )}
    </RequireRole>
  );
}
