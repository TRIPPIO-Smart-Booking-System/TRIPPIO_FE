'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { postJSON } from '@/lib/http';

/* ----------------------------- Types ----------------------------- */
type RegisterPayload = {
  username: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string; // ISO
};

type RegisterResp =
  | { requireEmailVerify: true; email: string }
  | { userId: string; email?: string };

/* --------------------------- Utils --------------------------- */
function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'object' && err && 'message' in err) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return String((err as any).message);
  }
  return 'Đã xảy ra lỗi không xác định';
}

function Spinner() {
  return (
    <span className="inline-block h-5 w-5 animate-spin rounded-full border-[3px] border-white/40 border-t-white align-[-2px]" />
  );
}

/* --------------------------- Component --------------------------- */
export default function RegisterForm() {
  const router = useRouter();

  // Lưu ý: dateOfBirth nhập dạng yyyy-mm-dd (HTML date), sẽ convert sang ISO khi submit
  const [form, setForm] = useState({
    username: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    dateOfBirthLocal: '', // chỉ dùng để bind UI input type="date"
  });

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const passMismatch = form.confirmPassword.length > 0 && form.password !== form.confirmPassword;

  const isDisabled = useMemo(
    () =>
      loading ||
      !form.username.trim() ||
      !form.email.trim() ||
      !form.phoneNumber.trim() ||
      !form.password ||
      !form.confirmPassword ||
      !form.firstName.trim() ||
      !form.lastName.trim() ||
      !form.dateOfBirthLocal ||
      passMismatch,
    [loading, form, passMismatch]
  );

  function localDateToISO(dateLocal: string): string {
    // Chuyển yyyy-mm-dd -> ISO đầu ngày theo local để tránh lệch TZ
    // (nếu backend yêu cầu giờ cụ thể, sửa lại theo yêu cầu)
    const iso = new Date(`${dateLocal}T00:00:00`).toISOString();
    return iso;
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isDisabled) return;

    setErr(null);
    setMsg(null);
    setLoading(true);

    try {
      const payload: RegisterPayload = {
        username: form.username.trim(),
        email: form.email.trim(),
        phoneNumber: form.phoneNumber.trim(),
        password: form.password,
        confirmPassword: form.confirmPassword,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        dateOfBirth: localDateToISO(form.dateOfBirthLocal),
      };

      const data = await postJSON<RegisterResp>('/api/admin/auth/register', payload);

      if ('requireEmailVerify' in data && data.requireEmailVerify) {
        router.push(`/verify-otp?email=${encodeURIComponent(data.email)}`);
        return;
      }

      if ('email' in data && data.email) {
        setMsg('Đăng ký thành công! Vui lòng xác minh OTP trong email của bạn…');
        setTimeout(() => router.push(`/verify-otp?email=${encodeURIComponent(data.email!)}`), 600);
        return;
      }

      setMsg('Đăng ký thành công! Mời bạn đăng nhập.');
      setTimeout(() => router.push('/login'), 600);
    } catch (e: unknown) {
      setErr(getErrorMessage(e) || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative mx-auto w-full max-w-md">
      <div className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-lg shadow-black/5 dark:border-white/10 dark:bg-neutral-900 dark:shadow-none">
        <div className="h-2 w-full bg-gradient-to-r from-indigo-500 via-sky-500 to-cyan-400" />
        <div className="px-6 pb-2 pt-6 text-center">
          <h2 className="text-2xl font-bold tracking-tight">Tạo tài khoản</h2>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Nhận ưu đãi đặc biệt từ Tripio
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 px-6 pb-6">
          {/* Họ tên */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium">Họ</label>
              <input
                className="block w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-[15px] outline-none ring-0 transition placeholder:text-neutral-400 focus:border-transparent focus:ring-2 focus:ring-indigo-500 dark:border-neutral-700 dark:bg-neutral-800"
                placeholder="Nguyễn"
                value={form.firstName}
                onChange={(e) => setForm((s) => ({ ...s, firstName: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium">Tên</label>
              <input
                className="block w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-[15px] outline-none ring-0 transition placeholder:text-neutral-400 focus:border-transparent focus:ring-2 focus:ring-indigo-500 dark:border-neutral-700 dark:bg-neutral-800"
                placeholder="An"
                value={form.lastName}
                onChange={(e) => setForm((s) => ({ ...s, lastName: e.target.value }))}
                required
              />
            </div>
          </div>

          {/* Username */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium">Username</label>
            <input
              className="block w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-[15px] outline-none ring-0 transition placeholder:text-neutral-400 focus:border-transparent focus:ring-2 focus:ring-indigo-500 dark:border-neutral-700 dark:bg-neutral-800"
              placeholder="your_username"
              value={form.username}
              onChange={(e) => setForm((s) => ({ ...s, username: e.target.value }))}
              required
            />
          </div>

          {/* Email + Phone */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium">Email</label>
              <input
                type="email"
                className="block w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-[15px] outline-none ring-0 transition placeholder:text-neutral-400 focus:border-transparent focus:ring-2 focus:ring-indigo-500 dark:border-neutral-700 dark:bg-neutral-800"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium">Số điện thoại</label>
              <input
                inputMode="tel"
                className="block w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-[15px] outline-none ring-0 transition placeholder:text-neutral-400 focus:border-transparent focus:ring-2 focus:ring-indigo-500 dark:border-neutral-700 dark:bg-neutral-800"
                placeholder="09xxxxxxxx"
                value={form.phoneNumber}
                onChange={(e) => setForm((s) => ({ ...s, phoneNumber: e.target.value }))}
                required
              />
            </div>
          </div>

          {/* Date of birth */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium">Ngày sinh</label>
            <input
              type="date"
              className="block w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-[15px] outline-none ring-0 transition placeholder:text-neutral-400 focus:border-transparent focus:ring-2 focus:ring-indigo-500 dark:border-neutral-700 dark:bg-neutral-800"
              value={form.dateOfBirthLocal}
              onChange={(e) => setForm((s) => ({ ...s, dateOfBirthLocal: e.target.value }))}
              required
            />
          </div>

          {/* Password */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium">Mật khẩu</label>
              <input
                type="password"
                className="block w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-[15px] outline-none ring-0 transition placeholder:text-neutral-400 focus:border-transparent focus:ring-2 focus:ring-indigo-500 dark:border-neutral-700 dark:bg-neutral-800"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
                minLength={6}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium">Nhập lại mật khẩu</label>
              <input
                type="password"
                className={`block w-full rounded-xl border px-4 py-3 text-[15px] outline-none ring-0 transition placeholder:text-neutral-400 focus:border-transparent focus:ring-2 ${
                  passMismatch
                    ? 'border-red-300 focus:ring-red-500 dark:border-red-600'
                    : 'border-neutral-200 focus:ring-indigo-500 dark:border-neutral-700'
                } dark:bg-neutral-800`}
                placeholder="••••••••"
                value={form.confirmPassword}
                onChange={(e) => setForm((s) => ({ ...s, confirmPassword: e.target.value }))}
                minLength={6}
                required
              />
              {passMismatch && (
                <p className="text-xs text-red-600">Mật khẩu nhập lại không khớp.</p>
              )}
            </div>
          </div>

          {err && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-600/40 dark:bg-red-900/30 dark:text-red-300">
              {err}
            </div>
          )}
          {msg && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-600/40 dark:bg-emerald-900/30 dark:text-emerald-300">
              {msg}
            </div>
          )}

          <button
            type="submit"
            disabled={isDisabled}
            className="group relative inline-flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-900 px-4 py-3 font-semibold text-white shadow-sm transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
          >
            {loading ? (
              <>
                <Spinner />
                <span>Đang tạo tài khoản…</span>
              </>
            ) : (
              <>
                <span className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 opacity-0 blur-[10px] transition group-hover:opacity-40" />
                <span>Đăng ký</span>
              </>
            )}
          </button>
        </form>
      </div>

      <div className="pointer-events-none absolute -inset-x-10 -top-10 -z-10 h-40 rounded-full bg-gradient-to-r from-indigo-500/20 via-sky-400/20 to-cyan-400/20 blur-2xl" />
    </div>
  );
}
