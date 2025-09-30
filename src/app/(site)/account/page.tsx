'use client';
import ProfileTab from '@/components/account/profile/ProfileTab';
import SecurityTab from '@/components/account/SecurityTab';
import SidebarAccount from '@/components/account/SidebarAccount';
import { useState } from 'react';

export default function AccountPage() {
  const [tab, setTab] = useState<'profile' | 'security'>('profile');
  const [fullName] = useState('Hoàng Trí');

  return (
    <main className="min-h-[80vh] bg-slate-50">
      {/* Khung ngoài: khớp header nhưng không quá rộng */}
      <div className="mx-auto w-full max-w-7xl px-4 py-6">
        {/* Grid trái-phải, không bị tràn */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-[260px_minmax(0,1fr)]">
          <SidebarAccount activeTab={tab} setTab={setTab} fullName={fullName} />

          {/* Vùng nội dung: GIỚI HẠN RỘNG + ĐƯA VỀ GIỮA */}
          <section className="mx-auto w-full max-w-3xl space-y-6">
            {tab === 'profile' ? <ProfileTab /> : <SecurityTab />}
          </section>
        </div>
      </div>
    </main>
  );
}
