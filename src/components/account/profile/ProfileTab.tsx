// components/account/profile/ProfileTab.tsx
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Button from '@/components/ui/Button';
import PersonalInfo, { Gender, DOB } from './PersonalInfo';
import EmailList, { Email } from './EmailList';
import PhoneList, { Phone } from './PhoneList';
import LinkedProviders, { Linked } from './LinkedProviders';
import SectionCard from '../SectionCard';
import { UserResponse, apiUploadAvatar } from '@/lib/api';

/* ================= Helpers ================= */
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
  return e instanceof Error ? e.message : 'Đã xảy ra lỗi';
}
/** Chuẩn hoá URL ảnh (ghép BASE_URL nếu BE trả về path tương đối) */
const API_BASE = (process.env.NEXT_PUBLIC_API_BASE ?? 'https://trippio.azurewebsites.net').replace(
  /\/+$/,
  ''
);
function toAbsolute(src?: string | null) {
  if (!src) return '';
  if (/^https?:\/\//i.test(src)) return src;
  if (src.startsWith('/')) return `${API_BASE}${src}`;
  return `${API_BASE}/${src.replace(/^\/+/, '')}`;
}
/** Bust cache để ép tải lại ảnh sau khi cập nhật */
function withBust(url: string, ver: number) {
  if (!url) return url;
  return `${url}${url.includes('?') ? '&' : '?'}v=${ver}`;
}

/* ================= Component ================= */
export default function ProfileTab({
  user,
  onUserChange,
}: {
  user: UserResponse | null;
  onUserChange: (u: UserResponse) => void;
}) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState<Gender>('male');
  const [dob, setDob] = useState<DOB>({ d: '', m: '', y: '' });
  const [city, setCity] = useState('');
  const [emailAddr, setEmailAddr] = useState<string>('');
  const [phones, setPhones] = useState<Phone[]>([]);

  // Avatar
  const [avatar, setAvatar] = useState<string>(''); // URL từ BE (có thể tương đối)
  const [avatarPreview, setAvatarPreview] = useState<string>(''); // objectURL tạm khi chọn file
  const [avatarVer, setAvatarVer] = useState(0); // tăng để bust cache

  const [saveErr, setSaveErr] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);
  const [avatarBusy, setAvatarBusy] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  // ====== NEW: modal xem full ảnh ======
  const [openPreview, setOpenPreview] = useState(false);
  const overlayRef = useRef<HTMLDivElement | null>(null);

  // ESC để đóng preview
  useEffect(() => {
    if (!openPreview) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpenPreview(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [openPreview]);

  // init từ user
  useEffect(() => {
    if (!user) return;
    setFirstName(user.firstName ?? '');
    setLastName(user.lastName ?? '');
    setDob(toDobParts(user.dob));
    setEmailAddr(user.email ?? '');
    setPhones(user.phoneNumber ? [{ id: 1, number: user.phoneNumber }] : []);
    setAvatar(user.avatar ?? '');
    setAvatarPreview('');
    setAvatarVer((v) => v + 1); // ép reload ảnh cũ nếu cache
  }, [user]);

  // cleanup objectURL
  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, []);

  const fullName = useMemo(() => `${firstName} ${lastName}`.trim(), [firstName, lastName]);

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

  /* ============ Upload avatar (FILE ONLY) ============ */
  async function onPickAvatarFile(e: React.ChangeEvent<HTMLInputElement>) {
    if (!user) return;
    const file = e.target.files?.[0];
    if (!file) return;

    // preview ngay
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const objUrl = URL.createObjectURL(file);
    objectUrlRef.current = objUrl;
    setAvatarPreview(objUrl);
    setSaveErr(null);
    setOkMsg(null);

    setAvatarBusy(true);
    try {
      const updated = await apiUploadAvatar(file); // POST /api/user/avatar (multipart 'file')
      onUserChange(updated);
      setAvatar(updated.avatar ?? '');
      setAvatarPreview('');
      setAvatarVer((v) => v + 1);
      setOkMsg('Đã cập nhật avatar. Trang sẽ tải lại trong 2 giây...');

      // Reload page after 2 seconds to show new avatar in header and everywhere
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err) {
      setSaveErr(errToMsg(err));
    } finally {
      setAvatarBusy(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    }
  }

  const linked: Linked[] = [
    { id: 'google', name: 'Google', connected: !!user?.isEmailVerified },
    { id: 'apple', name: 'Apple', connected: false },
    { id: 'facebook', name: 'Facebook', connected: false },
  ];

  // Tạo src hiển thị: ưu tiên preview; chuẩn hoá về URL tuyệt đối; bust cache
  const displaySrc = avatarPreview || toAbsolute(avatar);
  const bustedSrc = withBust(displaySrc, avatarVer);

  return (
    <div className="space-y-6">
      {/* Alerts */}
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
        }
      >
        {/* Preview avatar */}
        <div className="mb-4 mt-1 flex items-center gap-3">
          {displaySrc ? (
            <button
              type="button"
              onClick={() => setOpenPreview(true)}
              className="rounded-full ring-1 ring-slate-200 transition hover:brightness-105 focus:outline-none focus:ring-2 focus:ring-sky-500"
              title="Bấm để xem lớn"
            >
              <Image
                key={avatarVer} // force remount
                src={bustedSrc}
                alt="Avatar"
                width={64}
                height={64}
                className="h-16 w-16 rounded-full object-cover"
                unoptimized
                onError={() => {
                  // Don't immediately show error on first load fail
                  // Give it a chance to retry with the busted cache
                  console.warn('Avatar failed to load:', bustedSrc);
                }}
              />
            </button>
          ) : (
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white text-sm font-bold">
              {user?.firstName?.charAt(0).toUpperCase() || 'U'}
            </div>
          )}
          <div className="text-xs text-slate-500">Bấm vào ảnh để xem kích thước lớn.</div>
        </div>

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
        <PhoneList
          phones={phones}
          onAdd={(n) => setPhones([{ id: 1, number: n }])}
          onRemove={() => setPhones([])}
        />
      </SectionCard>

      <SectionCard title="Tài khoản đã liên kết">
        <LinkedProviders providers={linked} />
      </SectionCard>

      {/* ======= FULL IMAGE PREVIEW MODAL ======= */}
      {openPreview && (
        <>
          <div
            ref={overlayRef}
            className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm"
            onClick={(e) => {
              if (e.target === overlayRef.current) setOpenPreview(false);
            }}
          />
          <div
            className="fixed inset-0 z-[71] grid place-items-center p-4"
            role="dialog"
            aria-modal="true"
          >
            <div className="relative max-h-[90vh] max-w-[90vw] overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
              {/* Ảnh lớn (giữ bust-cache để đồng bộ) */}
              <Image
                src={bustedSrc}
                alt="Avatar preview"
                width={1000}
                height={1000}
                className="h-auto max-h-[90vh] w-auto max-w-[90vw] object-contain bg-white"
                unoptimized
              />
              <button
                type="button"
                onClick={() => setOpenPreview(false)}
                aria-label="Đóng"
                className="absolute right-2 top-2 rounded-full bg-black/60 px-3 py-1 text-sm font-semibold text-white hover:bg-black/70"
                title="Đóng (Esc)"
              >
                Đóng
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
