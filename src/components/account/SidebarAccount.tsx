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
      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
            <User2 className="h-6 w-6" />
          </div>
          <div>
            <div className="font-semibold">{fullName}</div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <BadgePercent className="h-3.5 w-3.5" /> Bronze member
            </div>
          </div>
        </div>
        <div className="space-y-1">
          <button
            onClick={() => setTab('profile')}
            className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-muted ${
              activeTab === 'profile' ? 'bg-muted font-medium' : ''
            }`}
          >
            <User2 className="h-4 w-4" /> Tài khoản
          </button>
          <button
            onClick={() => setTab('security')}
            className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-muted ${
              activeTab === 'security' ? 'bg-muted font-medium' : ''
            }`}
          >
            <ShieldCheck className="h-4 w-4" /> Mật khẩu & bảo mật
          </button>
          <Link
            href="#"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted"
          >
            <Bell className="h-4 w-4" /> Cài đặt thông báo
          </Link>
          <Link
            href="#"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted"
          >
            <Heart className="h-4 w-4" /> Danh sách đã lưu
          </Link>
          <Link
            href="#"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted"
          >
            <CreditCard className="h-4 w-4" /> Thanh toán
          </Link>
          <Link
            href="#"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted"
          >
            <LogOut className="h-4 w-4" /> Đăng xuất
          </Link>
        </div>
      </div>
    </aside>
  );
}
