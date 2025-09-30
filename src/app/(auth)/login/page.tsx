'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { postJSON } from '@/lib/http';

/* ----------------------------- Types ----------------------------- */
type LoginPayload = { usernameOrPhone: string; password: string };

type UserInfo = {
  id?: string;
  email?: string;
  isEmailVerified?: boolean; // cờ chuẩn
  emailConfirmed?: boolean; // phòng backend dùng tên khác
  [k: string]: unknown;
};

type LoginResp =
  | { requireEmailVerify: true; email: string }
  | {
      accessToken: string;
      refreshToken?: string;
      user?: UserInfo;
      // phòng backend trả flag ở root
      isEmailVerified?: boolean;
      email?: string;
    };

/* --------------------------- Utils --------------------------- */
function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'object' && err && 'message' in err) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return String((err as any).message);
  }
  return 'Đã xảy ra lỗi không xác định';
}

/* ---------------------------- Spinner ---------------------------- */
function Spinner() {
  return (
    <span className="inline-block h-5 w-5 animate-spin rounded-full border-[3px] border-white/40 border-t-white align-[-2px]" />
  );
}

/* ----------------------------- Icons ----------------------------- */
function EyeOpen(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={props.className}
    >
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z" />
      <circle cx="12" cy="12" r="3.5" />
    </svg>
  );
}

function EyeClosed(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={props.className}
    >
      <path d="M3 3l18 18" />
      <path d="M10.6 6.2c.45-.1.92-.15 1.4-.15 7 0 11 6 11 6a21.6 21.6 0 0 1-4.1 4.64" />
      <path d="M6.1 8.53A21.6 21.6 0 0 0 1 12s4 6.99 11 6.99c1.46 0 2.83-.25 4.01-.66" />
    </svg>
  );
}

/* --------------------------- Main Form --------------------------- */
export default function LoginForm() {
  const router = useRouter();
  const [form, setForm] = useState<LoginPayload>({
    usernameOrPhone: '',
    password: '',
  });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const isDisabled = useMemo(
    () => !form.usernameOrPhone || !form.password || loading,
    [form, loading]
  );

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isDisabled) return;

    setErr(null);
    setLoading(true);
    try {
      const data = await postJSON<LoginResp>('/api/admin/auth/login', form);

      // 1) Backend bắt buộc verify ngay
      if ('requireEmailVerify' in data && data.requireEmailVerify) {
        router.push(`/verify-otp?email=${encodeURIComponent(data.email)}`);
        return;
      }

      // 2) Đăng nhập thành công
      if ('accessToken' in data && data.accessToken) {
        // Lưu token nếu không dùng cookie httpOnly
        try {
          localStorage.setItem('accessToken', data.accessToken);
          if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
        } catch {
          // ignore quota errors
        }

        // Check isEmailVerified từ user hoặc từ root
        const emailVerified =
          data.isEmailVerified === true ||
          data.user?.isEmailVerified === true ||
          data.user?.emailConfirmed === true;

        // Lấy email để chuyển sang OTP khi chưa verified
        const emailForOtp =
          (data.user?.email && String(data.user.email)) || (data.email && String(data.email)) || '';

        if (!emailVerified) {
          router.push(`/verify-otp?email=${encodeURIComponent(emailForOtp)}`);
          return;
        }

        // Đã verify -> Home
        router.push('/');
        return;
      }

      // Fallback
      router.push('/');
    } catch (e: unknown) {
      setErr(getErrorMessage(e) || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative mx-auto w-full max-w-md">
      {/* Card */}
      <div className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-lg shadow-black/5 dark:border-white/10 dark:bg-neutral-900 dark:shadow-none">
        {/* Header gradient */}
        <div className="h-2 w-full bg-gradient-to-r from-indigo-500 via-sky-500 to-cyan-400" />
        <div className="px-6 pb-2 pt-6 text-center">
          <h2 className="text-2xl font-bold tracking-tight">Đăng nhập</h2>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Trải nghiệm dịch vụ du lịch tốt nhất
          </p>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="space-y-4 px-6 pb-6">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium">Email / Phone</label>
            <div className="group relative">
              <input
                className="block w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-[15px] outline-none ring-0 transition placeholder:text-neutral-400 focus:border-transparent focus:ring-2 focus:ring-indigo-500 dark:border-neutral-700 dark:bg-neutral-800"
                placeholder="username or phone number"
                value={form.usernameOrPhone}
                onChange={(e) => setForm((s) => ({ ...s, usernameOrPhone: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium">Password</label>
              {/* <a className="text-xs text-indigo-600 hover:underline">Quên mật khẩu?</a> */}
            </div>
            <div className="relative">
              <input
                type={showPwd ? 'text' : 'password'}
                className="block w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 pr-12 text-[15px] outline-none ring-0 transition placeholder:text-neutral-400 focus:border-transparent focus:ring-2 focus:ring-indigo-500 dark:border-neutral-700 dark:bg-neutral-800"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
                required
              />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                className="absolute inset-y-0 right-2.5 my-auto inline-flex h-9 w-9 items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:hover:bg-neutral-700 dark:text-neutral-300"
                aria-label={showPwd ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showPwd ? <EyeClosed className="h-5 w-5" /> : <EyeOpen className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {err && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-600/40 dark:bg-red-900/30 dark:text-red-300">
              {err}
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
                <span>Đang đăng nhập…</span>
              </>
            ) : (
              <>
                <span className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 opacity-0 blur-[10px] transition group-hover:opacity-40" />
                <span>Đăng nhập</span>
              </>
            )}
          </button>

          <p className="pt-2 text-center text-sm text-neutral-500 dark:text-neutral-400">
            Chưa có tài khoản?{' '}
            <a href="/register" className="font-medium text-indigo-600 hover:underline">
              Đăng ký ngay
            </a>
          </p>
        </form>
      </div>

      {/* Ambient glow */}
      <div className="pointer-events-none absolute -inset-x-10 -top-10 -z-10 h-40 rounded-full bg-gradient-to-r from-indigo-500/20 via-sky-400/20 to-cyan-400/20 blur-2xl" />
    </div>
  );
}
