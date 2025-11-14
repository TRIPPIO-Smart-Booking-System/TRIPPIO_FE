'use client';

import Link from 'next/link';
import { User2, ShieldCheck, Bell, Heart, CreditCard, LogOut, BadgePercent } from 'lucide-react';

export default function SidebarAccount({
  activeTab,
  setTab,
  fullName,
}: {
  activeTab: 'profile' | 'security';
  setTab: (t: 'profile' | 'security') => void;
  fullName: string;
}) {
  return (
    <aside className="space-y-2">
      <div className="rounded-lg sm:rounded-xl border bg-white p-3 sm:p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2 sm:gap-3">
          <div className="grid h-10 sm:h-12 w-10 sm:w-12 place-items-center rounded-full bg-primary/10 text-primary flex-shrink-0">
            <User2 className="h-5 sm:h-6 w-5 sm:w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-semibold text-sm sm:text-base truncate">{fullName}</div>
            <div className="flex items-center gap-1 sm:gap-2 text-xs text-muted-foreground">
              <BadgePercent className="h-3 sm:h-3.5 w-3 sm:w-3.5 flex-shrink-0" />
              <span className="truncate">Bronze member</span>
            </div>
          </div>
        </div>
        <div className="space-y-1">
          <button
            onClick={() => setTab('profile')}
            className={`flex w-full items-center gap-2 rounded-lg px-2 sm:px-3 py-2 text-left text-xs sm:text-sm hover:bg-muted transition-colors ${
              activeTab === 'profile' ? 'bg-muted font-medium' : ''
            }`}
          >
            <User2 className="h-4 w-4 flex-shrink-0" /> <span className="truncate">Tài khoản</span>
          </button>
          <button
            onClick={() => setTab('security')}
            className={`flex w-full items-center gap-2 rounded-lg px-2 sm:px-3 py-2 text-left text-xs sm:text-sm hover:bg-muted transition-colors ${
              activeTab === 'security' ? 'bg-muted font-medium' : ''
            }`}
          >
            <ShieldCheck className="h-4 w-4 flex-shrink-0" />{' '}
            <span className="truncate">Mật khẩu & bảo mật</span>
          </button>
          <Link
            href="#"
            className="flex items-center gap-2 rounded-lg px-2 sm:px-3 py-2 text-xs sm:text-sm hover:bg-muted transition-colors"
          >
            <Bell className="h-4 w-4 flex-shrink-0" />{' '}
            <span className="truncate">Cài đặt thông báo</span>
          </Link>
          <Link
            href="#"
            className="flex items-center gap-2 rounded-lg px-2 sm:px-3 py-2 text-xs sm:text-sm hover:bg-muted transition-colors"
          >
            <Heart className="h-4 w-4 flex-shrink-0" />{' '}
            <span className="truncate">Danh sách đã lưu</span>
          </Link>
          <Link
            href="#"
            className="flex items-center gap-2 rounded-lg px-2 sm:px-3 py-2 text-xs sm:text-sm hover:bg-muted transition-colors"
          >
            <CreditCard className="h-4 w-4 flex-shrink-0" />{' '}
            <span className="truncate">Thanh toán</span>
          </Link>
          <Link
            href="#"
            className="flex items-center gap-2 rounded-lg px-2 sm:px-3 py-2 text-xs sm:text-sm hover:bg-muted transition-colors"
          >
            <LogOut className="h-4 w-4 flex-shrink-0" /> <span className="truncate">Đăng xuất</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}
