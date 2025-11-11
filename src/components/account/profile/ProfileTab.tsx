// components/account/profile/ProfileTab.tsx
'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import Button from '@/components/ui/Button';
import PersonalInfo, { Gender, DOB } from './PersonalInfo';
import EmailList, { Email } from './EmailList';
import PhoneList, { Phone } from './PhoneList';
import LinkedProviders, { Linked } from './LinkedProviders';
import SectionCard from '../SectionCard';
import { UserResponse, apiUploadAvatar, apiGetMe } from '@/lib/api';
import { showSuccess, showError } from '@/lib/toast';

function toDobParts(iso?: string | null): DOB {
  if (!iso) return { d: '', m: '', y: '' };
  const dt = new Date(iso);
  if (Number.isNaN(dt.getTime())) return { d: '', m: '', y: '' };
  return {
    d: String(dt.getUTCDate()).padStart(2, '0'),
    m: String(dt.getUTCMonth() + 1).padStart(2, '0'),
    y: String(dt.getUTCFullYear()),
  };
}
function errToMsg(e: unknown): string {
  if (e instanceof Error) return e.message;
  return 'Đã xảy ra lỗi';
}

export default function ProfileTab({
  user,
  onUserChange,
}: {
  user: UserResponse | null;
  onUserChange: (u: UserResponse) => void;
}) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState<Gender>('male'); // demo
  const [dob, setDob] = useState<DOB>({ d: '', m: '', y: '' });
  const [city, setCity] = useState(''); // demo field (UI-only)
  const [emailAddr, setEmailAddr] = useState<string>('');
  const [phones, setPhones] = useState<Phone[]>([]);
  const [avatar, setAvatar] = useState<string>('');

  const [saveErr, setSaveErr] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  const [avatarBusy, setAvatarBusy] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // init từ user
  useEffect(() => {
    if (!user) return;
    setFirstName(user.firstName ?? '');
    setLastName(user.lastName ?? '');
    setDob(toDobParts(user.dob));
    setEmailAddr(user.email ?? '');
    setPhones(user.phoneNumber ? [{ id: 1, number: user.phoneNumber }] : []);
    setAvatar(user.avatar ?? '');
  }, [user]);

  const fullName = useMemo(() => `${firstName} ${lastName}`.trim(), [firstName, lastName]);

  // Email list (1 primary, chỉ hiển thị/local state)
  const emails: Email[] = useMemo(
    () =>
      emailAddr
        ? [{ id: 1, address: emailAddr, verified: user?.isEmailVerified, primary: true }]
        : [],
    [emailAddr, user?.isEmailVerified]
  );
  const addEmail = (address: string) => setEmailAddr(address);
  const makePrimary = () => {};
  const removeEmail = () => setEmailAddr('');

  // Phone list (chỉ local state)
  const addPhone = (number: string) => setPhones([{ id: 1, number }]);
  const removePhone = () => setPhones([]);

  // ===== Avatar handlers (giữ lại) =====
  async function onPickAvatarFile(e: React.ChangeEvent<HTMLInputElement>) {
    if (!user) return;
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarBusy(true);
    setSaveErr(null);
    setOkMsg(null);
    try {
      const updated = await apiUploadAvatar(file);
      onUserChange(updated);
      setAvatar(updated.avatar ?? '');
      showSuccess('Đã cập nhật avatar thành công');
      setOkMsg('Đã cập nhật avatar.');
      setTimeout(() => setOkMsg(null), 1200);

      // Refresh user data from server to ensure sync
      try {
        const freshUser = await apiGetMe();
        onUserChange(freshUser);
      } catch (err) {
        console.error('Failed to refresh user data:', err);
      }
    } catch (err: unknown) {
      const msg = errToMsg(err);
      setSaveErr(msg);
      showError(`Lỗi cập nhật avatar: ${msg}`);
    } finally {
      setAvatarBusy(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function onSubmitAvatarUrl() {
    // Avatar URL setting is no longer supported - only file upload is available
    return;
  }

  const linked: Linked[] = [
    { id: 'google', name: 'Google', connected: !!user?.isEmailVerified },
    { id: 'apple', name: 'Apple', connected: false },
    { id: 'facebook', name: 'Facebook', connected: false },
  ];

  return (
    <div className="space-y-6">
      {/* Status alerts */}
      <div className="space-y-2">
        {saveErr && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {saveErr}
          </div>
        )}
        {okMsg && (
          <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {okMsg}
          </div>
        )}
      </div>

      <SectionCard
        title="Dữ liệu cá nhân"
        actions={
          <div className="flex items-center gap-2">
            {/* Avatar actions */}
            <label className="relative inline-flex cursor-pointer items-center rounded-lg border px-3 py-1.5 text-sm">
              {avatarBusy ? 'Đang cập nhật…' : 'Tải avatar'}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                onChange={onPickAvatarFile}
                disabled={avatarBusy}
              />
            </label>
          </div>
        }
      >
        <PersonalInfo
          fullName={fullName}
          onFullName={(v) => {
            const parts = v.trim().split(/\s+/);
            setLastName(parts.pop() ?? '');
            setFirstName(parts.join(' '));
          }}
          gender={gender}
          onGender={setGender}
          dob={dob}
          onDob={setDob}
          city={city}
          onCity={setCity}
        />
      </SectionCard>

      <SectionCard title="Email">
        <EmailList
          emails={emails}
          onAdd={addEmail}
          onMakePrimary={makePrimary}
          onRemove={removeEmail}
        />
      </SectionCard>

      <SectionCard title="Số di động">
        <PhoneList phones={phones} onAdd={addPhone} onRemove={removePhone} />
      </SectionCard>

      <SectionCard title="Tài khoản đã liên kết">
        <LinkedProviders providers={linked} />
      </SectionCard>
    </div>
  );
}
