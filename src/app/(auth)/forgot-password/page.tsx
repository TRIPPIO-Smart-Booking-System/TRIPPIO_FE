'use client';

import React, { Suspense, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { postJSON } from '@/lib/http';

type Resp = { isSuccess?: boolean; message?: string };

function Spinner() {
  return (
    <span className="inline-block h-5 w-5 animate-spin rounded-full border-[3px] border-white/40 border-t-white align-[-2px]" />
  );
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M2 7a4 4 0 0 1 4-4h12a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V7Z" />
      <path d="M22 7l-8.97 6.02a2 2 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

/**
 * Page wrapper: BẮT BUỘC có Suspense để dùng useSearchParams bên trong.
 */
export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-sm text-neutral-600">Loading…</div>}>
      <ForgotPasswordInner />
    </Suspense>
  );
}

/**
 * Component con: chứa toàn bộ logic & UI gốc (dùng useSearchParams ở đây).
 */
function ForgotPasswordInner() {
  const router = useRouter();
  const params = useSearchParams();

  const [email, setEmail] = useState(params.get('email') ?? '');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const emailValid = useMemo(() => {
    if (!email) return false;
    const re = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    return re.test(email.trim());
  }, [email]);

  const disabled = useMemo(() => !emailValid || loading, [emailValid, loading]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (disabled) return;
    setErr(null);
    setOk(null);
    setLoading(true);
    try {
      const r = await postJSON<Resp>('/api/admin/auth/forgot-password', { email: email.trim() });
      if (r?.isSuccess === false) {
        setErr(r?.message || 'Không gửi được OTP. Vui lòng thử lại.');
        return;
      }
      setOk('Đã gửi OTP! Vui lòng kiểm tra hộp thư của bạn.');
      const qs = new URLSearchParams({
        email: email.trim(),
        redirect: '/reset-password',
        mode: 'reset',
      });
      setTimeout(() => router.push(`/verify-otp?${qs.toString()}`), 450);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : typeof err === 'string'
            ? err
            : 'Không gửi được OTP. Vui lòng thử lại.';
      setErr(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-[100dvh] overflow-hidden">
      {/* Lớp nền gradient + grid overlay */}
      <div className="fixed inset-0 -z-30 bg-[radial-gradient(1400px_700px_at_70%_-10%,#f0abfc_0%,transparent_60%),radial-gradient(900px_500px_at_20%_0%,#bae6fd_0%,transparent_50%),linear-gradient(180deg,#0ea5e9_0%,#06b6d4_35%,#14b8a6_60%,#0ea5e9_100%)] opacity-90" />
      <div className="fixed inset-0 -z-20 [background:linear-gradient(transparent_23px,rgba(255,255,255,.08)_24px),linear-gradient(90deg,transparent_23px,rgba(255,255,255,.08)_24px)] [background-size:24px_24px] mix-blend-overlay" />

      <div className="relative z-10 mx-auto flex min-h-[100dvh] items-center px-4 py-10">
        <div className="mx-auto w-full max-w-lg">
          {/* Card viền gradient */}
          <div className="relative rounded-[28px] p-[1px] shadow-2xl shadow-cyan-900/25 ring-1 ring-white/25 backdrop-blur-xl before:absolute before:inset-0 before:-z-10 before:rounded-[28px] before:bg-gradient-to-br before:from-fuchsia-500/60 before:via-sky-400/60 before:to-cyan-400/60">
            <div className="rounded-[28px] border border-white/20 bg-white/75 p-6 md:p-8 dark:border-white/10 dark:bg-neutral-900/60">
              {/* Header */}
              <div className="mb-6 text-center">
                <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 via-pink-500 to-sky-500 text-white shadow-lg shadow-amber-500/20 ring-1 ring-white/40">
                  <MailIcon className="h-6 w-6" />
                </div>
                <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900 drop-shadow-sm dark:text-white">
                  Quên mật khẩu
                </h1>
                <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">
                  Nhập <span className="font-semibold">email</span> để nhận mã OTP khôi phục.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={onSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-neutral-800 dark:text-neutral-200">
                    Email
                  </label>
                  <div className="relative">
                    <input
                      className={`block w-full rounded-2xl border px-4 py-3 pl-11 text-[15px] shadow-inner outline-none transition focus:border-transparent focus:ring-2 ${
                        email.length === 0
                          ? 'border-white/40 bg-white/70 focus:ring-sky-500/70'
                          : emailValid
                            ? 'border-emerald-300 bg-emerald-50/70 focus:ring-emerald-400/60'
                            : 'border-rose-300 bg-rose-50/70 focus:ring-rose-400/70'
                      } dark:border-white/10 dark:bg-neutral-800/70 dark:text-neutral-100`}
                      type="email"
                      placeholder="user@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                    />
                    <span className="pointer-events-none absolute inset-y-0 left-3 my-auto inline-flex h-6 w-6 items-center justify-center text-sky-600/80 dark:text-sky-400/80">
                      <MailIcon className="h-5 w-5" />
                    </span>
                  </div>
                  <div className="min-h-[18px] text-xs">
                    {email ? (
                      emailValid ? (
                        <span className="text-emerald-600">Email hợp lệ</span>
                      ) : (
                        <span className="text-rose-600">Email chưa đúng định dạng</span>
                      )
                    ) : null}
                  </div>
                </div>

                {/* Thông báo */}
                {err && (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-rose-700">
                    {err}
                  </div>
                )}
                {ok && (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-700">
                    {ok}
                  </div>
                )}

                {/* CTA */}
                <button
                  type="submit"
                  disabled={disabled}
                  className="group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-sky-600 px-4 py-3 font-semibold text-white shadow-lg shadow-sky-600/30 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className="absolute inset-0 -z-10 animate-[pulse_3s_ease-in-out_infinite] bg-[conic-gradient(from_180deg_at_50%_50%,#22d3ee_0%,#f472b6_25%,#f59e0b_50%,#22c55e_75%,#22d3ee_100%)] opacity-0 blur-xl transition group-hover:opacity-40" />
                  {loading ? (
                    <>
                      <Spinner />
                      <span>Đang gửi OTP…</span>
                    </>
                  ) : (
                    <span>Gửi OTP</span>
                  )}
                </button>

                <p className="text-center text-sm text-neutral-700 dark:text-neutral-300">
                  Nhớ mật khẩu?{' '}
                  <a
                    href="/login"
                    className="font-semibold text-sky-700 underline-offset-4 hover:underline"
                  >
                    Đăng nhập
                  </a>
                </p>
              </form>
            </div>
          </div>

          {/* Badges nhỏ */}
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-white/90 drop-shadow">
            <span className="rounded-full bg-white/20 px-2 py-1 backdrop-blur-sm">
              Gửi OTP tự động
            </span>
            <span className="rounded-full bg-white/20 px-2 py-1 backdrop-blur-sm">
              Bảo mật thông tin
            </span>
            <span className="rounded-full bg-white/20 px-2 py-1 backdrop-blur-sm">Hỗ trợ 24/7</span>
          </div>
        </div>
      </div>
    </div>
  );
}
