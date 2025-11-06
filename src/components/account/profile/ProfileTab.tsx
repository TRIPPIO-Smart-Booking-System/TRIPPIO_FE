// components/account/profile/ProfileTab.tsx
'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import Button from '@/components/ui/Button';
import PersonalInfo, { Gender, DOB } from './PersonalInfo';
import EmailList, { Email } from './EmailList';
import PhoneList, { Phone } from './PhoneList';
import LinkedProviders, { Linked } from './LinkedProviders';
import SectionCard from '../SectionCard';
import { UserResponse, apiUploadAvatar, apiUpdateAvatarUrl } from '@/lib/api';

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
function toIso(dob: DOB): string | undefined {
  const { d, m, y } = dob;
  if (!d || !m || !y) return undefined;
  return new Date(Date.UTC(Number(y), Number(m) - 1, Number(d))).toISOString();
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

  const [saving, setSaving] = useState(false);
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
  }, [user?.id]);

  const fullName = useMemo(() => `${firstName} ${lastName}`.trim(), [firstName, lastName]);

  // Email list (1 primary)
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

  // Phone list (1 số)
  const addPhone = (number: string) => setPhones([{ id: 1, number }]);
  const removePhone = () => setPhones([]);

  // ===== Avatar handlers (mới) =====
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
      setOkMsg('Đã cập nhật avatar.');
      setTimeout(() => setOkMsg(null), 1200);
    } catch (err: any) {
      setSaveErr(String(err?.message ?? 'Upload avatar thất bại'));
    } finally {
      setAvatarBusy(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function onSubmitAvatarUrl() {
    if (!user || !avatar?.trim()) return;
    setAvatarBusy(true);
    setSaveErr(null);
    setOkMsg(null);
    try {
      const updated = await apiUpdateAvatarUrl(avatar.trim());
      onUserChange(updated);
      setAvatar(updated.avatar ?? avatar.trim());
      setOkMsg('Đã cập nhật avatar (URL).');
      setTimeout(() => setOkMsg(null), 1200);
    } catch (err: any) {
      setSaveErr(String(err?.message ?? 'Cập nhật avatar thất bại'));
    } finally {
      setAvatarBusy(false);
    }
  }

  // ===== Lưu thông tin cá nhân =====
  const savePersonal = async () => {
    if (!user || saving) return;
    setSaving(true);
    setSaveErr(null);
    setOkMsg(null);
    try {
      const body = {
        firstName,
        lastName,
        email: emailAddr || undefined,
        phoneNumber: phones[0]?.number || undefined,
        dob: toIso(dob),
        // avatar không gửi ở đây nữa; avatar dùng endpoint riêng /api/user/avatar
      };
      const updated = await apiUpdateUserById(user.id, body);
      onUserChange(updated);
      setOkMsg('Đã lưu thay đổi.');
      setTimeout(() => setOkMsg(null), 1500);
    } catch (e: any) {
      setSaveErr(String(e?.message ?? 'Lưu thất bại'));
    } finally {
      setSaving(false);
    }
  };

  const linked: Linked[] = [
    { id: 'google', name: 'Google', connected: !!user?.isEmailVerified },
    { id: 'apple', name: 'Apple', connected: false },
    { id: 'facebook', name: 'Facebook', connected: false },
  ];

  return (
    <div className="space-y-6">
      <SectionCard
        title="Dữ liệu cá nhân"
        subtitle={okMsg ?? (saveErr ? undefined : 'Cập nhật tên, ngày sinh…')}
        error={saveErr ?? undefined}
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
            <Button size="sm" onClick={onSubmitAvatarUrl} disabled={avatarBusy}>
              Dùng URL
            </Button>
            <Button size="sm" onClick={savePersonal} disabled={saving}>
              {saving ? 'Đang lưu…' : 'Lưu'}
            </Button>
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
          avatar={avatar}
          onAvatar={setAvatar} // dùng cho ô nhập URL ảnh
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
function apiUpdateUserById(
  id: string,
  body: {
    firstName: string;
    lastName: string;
    email: string | undefined;
    phoneNumber: string | undefined;
    dob: string | undefined;
  }
) {
  throw new Error('Function not implemented.');
}
