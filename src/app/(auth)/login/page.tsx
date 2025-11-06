'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { postJSON } from '@/lib/http';
import { extractUserIdFromJwt, setAuth } from '@/lib/auth';

/* ----------------------------- Types ----------------------------- */
type LoginPayload = { usernameOrPhone: string; password: string };

type UserInfo = {
  id?: string;
  email?: string;
  userName?: string;
  isEmailVerified?: boolean;
  emailConfirmed?: boolean;
  isFirstLogin?: boolean;
  roles?: string[] | string; // cho phép string hoặc string[]
  [k: string]: unknown;
};

type LoginResp = {
  isSuccess?: boolean;
  message?: string;
  requireEmailVerification?: boolean;
  requirePhoneVerification?: boolean;
  loginResponse?: {
    accessToken: string;
    refreshToken?: string;
    expiresAt?: string;
    user?: UserInfo;
  };
};

type LoginBase = {
  isSuccess?: boolean;
  email?: string;
  user?: UserInfo;
};

/* --------------------------- Utils --------------------------- */
function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'object' && err && 'message' in err) {
    return String((err as { message?: unknown }).message ?? 'Đã xảy ra lỗi');
  }
  return 'Đã xảy ra lỗi không xác định';
}

function pickEmail(data: LoginBase): string {
  if (typeof data.email === 'string' && data.email) return data.email;
  if (typeof data.user?.email === 'string' && data.user.email) return data.user.email;
  return '';
}

/** Decode JWT payload safely */
function parseJwt<T = Record<string, unknown>>(token?: string): T | null {
  if (!token) return null;
  try {
    const base64 = token.split('.')[1];
    if (!base64) return null;
    const json = atob(base64.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

/** Save everything needed for the session */
function persistAuth({
  accessToken,
  refreshToken,
  user,
}: {
  accessToken: string;
  refreshToken?: string;
  user?: UserInfo;
}) {
  // Prefer user.id from response; fallback to JWT payload (id/sub)
  let userId: string | undefined = user?.id as string | undefined;
  if (!userId) {
    const payload = parseJwt<{ id?: string; sub?: string; email?: string }>(accessToken);
    userId = payload?.id || payload?.sub;
  }

  try {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('authToken', accessToken); // for places that read 'authToken'
    if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
    if (userId) localStorage.setItem('userId', userId);
    if (user?.email) localStorage.setItem('userEmail', user.email as string);
  } catch {
    // ignore quota / private mode
  }
}

/** Lấy token/user từ mọi vị trí hay gặp (ưu tiên loginResponse) */
function extractTokens(d: any): { accessToken?: string; refreshToken?: string; user?: UserInfo } {
  if (!d || typeof d !== 'object') return {};
  const accessToken = d?.loginResponse?.accessToken || d?.accessToken || d?.token || d?.jwt;
  const refreshToken = d?.loginResponse?.refreshToken || d?.refreshToken;
  const user = d?.loginResponse?.user || d?.user;
  return { accessToken, refreshToken, user };
}

/* --------- Role helpers --------- */
function normalizeRoles(rs: unknown): string[] {
  const arr = Array.isArray(rs) ? rs : typeof rs === 'string' ? [rs] : [];
  return arr
    .map((r) => String(r || '').toLowerCase())
    .map((r) => (r.startsWith('role_') ? r.slice(5) : r));
}

function extractRoles({
  accessToken,
  user,
}: {
  accessToken?: string;
  user?: { roles?: unknown };
}): string[] {
  // Ưu tiên roles từ response
  let roles = normalizeRoles(user?.roles);
  if (roles.length) return roles;

  // Fallback: đọc từ JWT (roles hoặc role)
  const payload = parseJwt<{ roles?: unknown; role?: unknown }>(accessToken);
  roles = normalizeRoles(payload?.roles ?? (payload?.role ? [payload.role] : []));
  return roles;
}

function pickRedirectByRole(roles: string[], customerFallback = '/homepage') {
  if (roles.includes('admin')) return '/admin';
  if (roles.includes('staff')) return '/staff';
  return customerFallback; // customer/user
}

/* ---------------------------- Spinner ---------------------------- */
function Spinner() {
  return (
    <span className="inline-block h-5 w-5 animate-spin rounded-full border-[3px] border-white/40 border-t-white align-[-2px]" />
  );
}

/* ----------------------------- Icons ----------------------------- */
function EyeOpen({ className, ...rest }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
      {...rest}
    >
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z" />
      <circle cx="12" cy="12" r="3.5" />
    </svg>
  );
}
function EyeClosed({ className, ...rest }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
      {...rest}
    >
      <path d="M3 3l18 18" />
      <path d="M10.6 6.2c.45-.1.92-.15 1.4-.15 7 0 11 6 11 6a21.6 21.6 0 0 1-4.1 4.64" />
      <path d="M6.1 8.53A21.6 21.6 0 0 0 1 12s4 6.99 11 6.99c1.46 0 2.83-.25 4.01-.66" />
    </svg>
  );
}

/* =========================== PAGE =========================== */
export default function LoginForm() {
  const router = useRouter();
  const [form, setForm] = useState<LoginPayload>({ usernameOrPhone: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const isDisabled = useMemo(
    () => !form.usernameOrPhone || !form.password || loading,
    [form, loading]
  );

  // 👇 Forgot password URL (prefill email/phone nếu người dùng đã gõ)
  const forgotHref = useMemo(
    () => `/forgot-password?email=${encodeURIComponent(form.usernameOrPhone || '')}`,
    [form.usernameOrPhone]
  );

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isDisabled) return;

    setErr(null);
    setLoading(true);

    try {
      const data = await postJSON<LoginResp>('/api/admin/auth/login', form);

      // Ưu tiên token trong loginResponse
      const { accessToken, refreshToken, user } = extractTokens(data);
      const base: LoginBase = { isSuccess: data?.isSuccess, user: user, email: user?.email };
      const emailForOtp = pickEmail(base) || form.usernameOrPhone;

      // Nếu có token -> lưu + quyết định verify
      if (accessToken) {
        const decodedId =
          extractUserIdFromJwt(accessToken) ||
          parseJwt<{ sub?: string; id?: string }>(accessToken)?.sub ||
          parseJwt<{ sub?: string; id?: string }>(accessToken)?.id;

        setAuth({
          accessToken,
          refreshToken,
          userId: (user?.id as string) ?? decodedId, // << QUAN TRỌNG
          email: user?.email as string | undefined,
        });
        persistAuth({ accessToken, refreshToken, user });

        // tôn trọng trạng thái verify thực tế của user
        const emailVerified = user?.isEmailVerified === true || user?.emailConfirmed === true;

        if (!emailVerified) {
          router.push(`/verify-otp?email=${encodeURIComponent(emailForOtp || '')}`);
          return;
        }

        // Lấy roles và lưu lại cho guard dùng
        const roles = extractRoles({ accessToken, user });
        try {
          localStorage.setItem('roles', JSON.stringify(roles));
        } catch {}

        // Chọn màn theo role (ưu tiên role)
        const roleTarget = pickRedirectByRole(roles, '/homepage');

        // Nếu muốn ưu tiên ?redirect (tùy bạn bật/tắt):
        const params = new URLSearchParams(window.location.search);
        const redirectParam = params.get('redirect');
        const finalTarget = redirectParam || roleTarget;

        // 1) Điều hướng NGAY
        router.replace(finalTarget);
        router.refresh();

        // 2) Phát auth:changed SAU điều hướng (tránh hủy navigation)
        setTimeout(() => {
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('auth:changed'));
          }
        }, 50);

        return;
      }

      // Không có token trong body -> có thể BE set cookie HttpOnly + isSuccess (KHÔNG dùng /me nữa)
      if (data?.isSuccess) {
        try {
          localStorage.setItem('session', '1');
        } catch {}
        const params = new URLSearchParams(window.location.search);
        const to = params.get('redirect') || '/homepage';
        router.replace(to);
        router.refresh();
        setTimeout(() => {
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('auth:changed'));
          }
        }, 50);
        return;
      }

      // Nếu BE yêu cầu verify email
      if (data?.requireEmailVerification) {
        router.push(`/verify-otp?email=${encodeURIComponent(emailForOtp || '')}`);
        return;
      }

      // Fallback
      setErr('Đăng nhập thất bại. Vui lòng thử lại.');
    } catch (e: unknown) {
      setErr(getErrorMessage(e) || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-[100dvh] overflow-hidden">
      <FullBleedBG />
      <div className="relative z-10 mx-auto flex min-h-[100dvh] items-center px-4 py-10">
        <div className="mx-auto w-full max-w-md md:max-w-lg">
          <div className="relative rounded-3xl p-[1px] shadow-2xl shadow-cyan-900/25 ring-1 ring-white/20 backdrop-blur-xl before:absolute before:inset-0 before:-z-10 before:rounded-3xl before:bg-gradient-to-br before:from-fuchsia-500/50 before:via-sky-400/50 before:to-cyan-400/50">
            <div className="rounded-3xl border border-white/20 bg-white/75 p-6 dark:border-white/10 dark:bg-neutral-900/60">
              {/* header */}
              <div className="mb-5 text-center">
                <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 via-pink-500 to-sky-500 text-white shadow-lg shadow-amber-500/20 ring-1 ring-white/40">
                  <Palm />
                </div>
                <h2 className="text-2xl font-extrabold tracking-tight text-neutral-900 drop-shadow-sm dark:text-white">
                  Đăng nhập Trippio
                </h2>
                <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">
                  Mở khóa ưu đãi & trải nghiệm du lịch tuyệt vời ✈️🏝️
                </p>
              </div>

              {/* form */}
              <form onSubmit={onSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-neutral-800 dark:text-neutral-200">
                    Email / Số điện thoại
                  </label>
                  <div className="relative">
                    <input
                      className="block w-full rounded-2xl border border-white/40 bg-white/70 px-4 py-3 pl-11 text-[15px] text-neutral-800 shadow-inner outline-none ring-0 transition placeholder:text-neutral-400 focus:border-transparent focus:ring-2 focus:ring-sky-500/70 dark:border-white/10 dark:bg-neutral-800/70 dark:text-neutral-100"
                      placeholder="username or phone number"
                      value={form.usernameOrPhone}
                      onChange={(e) => setForm((s) => ({ ...s, usernameOrPhone: e.target.value }))}
                      required
                      autoComplete="username email"
                    />
                    <span className="pointer-events-none absolute inset-y-0 left-3 my-auto inline-flex h-6 w-6 items-center justify-center text-sky-600/80 dark:text-sky-400/80">
                      <svg
                        viewBox="0 0 24 24"
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      >
                        <path d="M2 7a4 4 0 0 1 4-4h12a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V7Z" />
                        <path d="M22 7l-8.97 6.02a2 2 0 0 1-2.06 0L2 7" />
                      </svg>
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-neutral-800 dark:text-neutral-200">
                      Mật khẩu
                    </label>

                    {/* 👇 Forgot password link */}
                    <a
                      href={forgotHref}
                      className="text-sm font-medium text-sky-600 hover:underline underline-offset-4"
                      title="Quên mật khẩu?"
                    >
                      Quên mật khẩu?
                    </a>
                  </div>

                  <div className="relative">
                    <input
                      type={showPwd ? 'text' : 'password'}
                      className="block w-full rounded-2xl border border-white/40 bg-white/70 px-4 py-3 pr-12 text-[15px] text-neutral-800 shadow-inner outline-none ring-0 transition placeholder:text-neutral-400 focus:border-transparent focus:ring-2 focus:ring-fuchsia-500/70 dark:border-white/10 dark:bg-neutral-800/70 dark:text-neutral-100"
                      placeholder="••••••••"
                      value={form.password}
                      onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
                      required
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd((v) => !v)}
                      className="absolute inset-y-0 right-2.5 my-auto inline-flex h-9 w-9 items-center justify-center rounded-xl text-neutral-600 transition hover:bg-white/70 hover:text-neutral-800 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/60 dark:text-neutral-300 dark:hover:bg-neutral-700/70"
                      aria-label={showPwd ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    >
                      {showPwd ? (
                        <EyeClosed className="h-5 w-5" />
                      ) : (
                        <EyeOpen className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {err && (
                  <div className="rounded-xl border border-red-300/40 bg-red-50/80 px-3 py-2 text-sm text-red-700 backdrop-blur-sm dark:border-red-600/30 dark:bg-red-900/30 dark:text-red-300">
                    {err}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isDisabled}
                  className="group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-neutral-900 px-4 py-3 font-semibold text-white shadow-lg shadow-neutral-900/20 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60 dark:bg_white dark:text-neutral-900"
                >
                  <span className="absolute inset-0 -z-10 animate-[pulse_3s_ease-in-out_infinite] bg-[conic-gradient(from_180deg_at_50%_50%,#22d3ee_0%,#f472b6_25%,#f59e0b_50%,#22c55e_75%,#22d3ee_100%)] opacity-0 blur-xl transition group-hover:opacity-40" />
                  {loading ? (
                    <>
                      <Spinner />
                      <span>Đang đăng nhập…</span>
                    </>
                  ) : (
                    <span>Đăng nhập</span>
                  )}
                </button>

                <p className="pt-1.5 text_center text-sm text-neutral-600 dark:text-neutral-300">
                  Chưa có tài khoản?{' '}
                  <a
                    href="/register"
                    className="font-semibold text-sky-600 underline-offset-4 hover:underline"
                  >
                    Đăng ký ngay
                  </a>
                </p>
              </form>
            </div>
          </div>

          {/* badges */}
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-white/90 drop-shadow">
            <span className="rounded-full bg-white/20 px-2 py-1 backdrop-blur-sm">
              Hoàn tiền 24h
            </span>
            <span className="rounded-full bg-white/20 px-2 py-1 backdrop-blur-sm">
              Ưu đãi thành viên
            </span>
            <span className="rounded-full bg-white/20 px-2 py-1 backdrop-blur-sm">Hỗ trợ 24/7</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ====================== FULL-BLEED BACKGROUND ====================== */
function FullBleedBG() {
  return (
    <>
      <div className="fixed inset-0 -z-30 bg-[radial-gradient(1400px_700px_at_70%_-10%,#ffb2c8_0%,transparent_60%),radial-gradient(900px_500px_at_20%_0%,#fde68a_0%,transparent_50%),linear-gradient(180deg,#0ea5e9_0%,#06b6d4_35%,#14b8a6_60%,#0ea5e9_100%)] opacity-90 dark:opacity-80" />
      <div className="fixed inset-0 -z-20 [background:linear-gradient(transparent_23px,rgba(255,255,255,.07)_24px),linear-gradient(90deg,transparent_23px,rgba(255,255,255,.07)_24px)] [background-size:24px_24px] mix-blend-overlay" />
      <div className="fixed inset-0 -z-20 opacity-40 mix-blend-overlay [background-image:url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 opacity=%220.03%22><filter id=%22n%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%222%22/></filter><rect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/></svg>')]" />
      <Plane />
      <svg
        className="fixed inset-x-0 bottom-0 -z-20 h-36 w-full"
        viewBox="0 0 1440 200"
        preserveAspectRatio="none"
      >
        <path
          d="M0,160 C240,140 320,200 480,180 C640,160 720,120 900,150 C1080,180 1200,120 1440,150 L1440,220 L0,220 Z"
          fill="url(#ocean)"
          opacity="0.9"
        />
        <defs>
          <linearGradient id="ocean" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#0891b2" />
            <stop offset="100%" stopColor="#0ea5e9" />
          </linearGradient>
        </defs>
      </svg>
    </>
  );
}

/* ====================== Decorative bits ====================== */
function Plane() {
  return (
    <svg
      className="fixed left-[-15%] top-16 -z-10 h-10 w-10 animate-[fly_18s_linear_infinite]"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path
        d="M2 12l20-8-6 8 6 8-20-8 6 0-6-8z"
        className="text-white/80 drop-shadow-[0_4px_12px_rgba(14,165,233,0.6)]"
      />
      <style>{`
        @keyframes fly {
          0% { transform: translateX(0) translateY(0) rotate(8deg); opacity:.85 }
          50% { transform: translateX(130vw) translateY(15px) rotate(8deg); opacity:1 }
          100% { transform: translateX(130vw) translateY(15px) rotate(8deg); opacity:0 }
        }
      `}</style>
    </svg>
  );
}

function Palm() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 22v-7" />
      <path d="M7 7c2-2 8-2 10 0-3 1-7 1-10 0Z" />
      <path d="M6 11c2-2 10-2 12 0-4 2-8 2-12 0Z" />
      <path d="M8 15c1-1 7-1 8 0-3 2-5 2-8 0Z" />
    </svg>
  );
}
