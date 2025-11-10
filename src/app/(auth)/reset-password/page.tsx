'use client';

import React, { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { postJSON } from '@/lib/http';

type ResetResp = { isSuccess?: boolean; message?: string };

/* ----------------------- Error helpers ----------------------- */
type WithMessage = { message?: unknown };
function hasMessage(x: unknown): x is WithMessage {
  return typeof x === 'object' && x !== null && 'message' in x;
}
function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (hasMessage(err) && typeof err.message === 'string' && err.message.trim()) {
    return err.message;
  }
  return 'Đặt lại mật khẩu thất bại. Vui lòng thử lại.';
}

/* ----------------------- Small helpers ----------------------- */
function Eye({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      stroke="currentColor"
      fill="none"
      strokeWidth="1.8"
      className={className}
    >
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z" />
      <circle cx="12" cy="12" r="3.5" />
    </svg>
  );
}
function EyeOff({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      stroke="currentColor"
      fill="none"
      strokeWidth="1.8"
      className={className}
    >
      <path d="M3 3l18 18" />
      <path d="M1 12s4-7 11-7c1.3 0 2.5.2 3.6.5M23 12s-4 7-11 7c-1.2 0-2.4-.2-3.4-.5" />
      <circle cx="12" cy="12" r="3.5" />
    </svg>
  );
}
function Check({ ok }: { ok: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`h-4 w-4 ${ok ? 'text-emerald-600' : 'text-slate-400'}`}
      stroke="currentColor"
      fill="none"
      strokeWidth="2"
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}
function Spinner() {
  return (
    <span className="inline-block h-5 w-5 animate-spin rounded-full border-[3px] border-white/40 border-t-white align-[-2px]" />
  );
}

/* ----------------------- Strength checker ----------------------- */
function scorePassword(pwd: string) {
  let score = 0;
  if (!pwd) return { score: 0, label: 'Rất yếu' };
  const rules = [
    /[a-z]/.test(pwd),
    /[A-Z]/.test(pwd),
    /\d/.test(pwd),
    /[^A-Za-z0-9]/.test(pwd),
    pwd.length >= 8,
    pwd.length >= 12,
  ];
  score = rules.reduce((s, ok) => s + (ok ? 1 : 0), 0);
  if (score >= 5) score = 4;
  else if (score >= 4) score = 3;
  else if (score >= 3) score = 2;
  else if (score >= 2) score = 1;
  else score = 0;
  const label = ['Rất yếu', 'Yếu', 'Trung bình', 'Mạnh', 'Rất mạnh'][score];
  return { score, label };
}

/* =========================== PAGE WRAPPER =========================== */
/** Bọc component con trong Suspense để hợp lệ khi dùng useSearchParams */
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-sm text-neutral-600">Loading…</div>}>
      <ResetPasswordInner />
    </Suspense>
  );
}

/* =========================== INNER (giữ nguyên UI/logic) =========================== */
function ResetPasswordInner() {
  const router = useRouter();
  const params = useSearchParams();

  const [email, setEmail] = useState(params.get('email') ?? '');
  const [otp, setOtp] = useState('');
  const [pwd, setPwd] = useState('');
  const [pwd2, setPwd2] = useState('');
  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);
  const [caps1, setCaps1] = useState(false);
  const [caps2, setCaps2] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const fromSS = (() => {
      try {
        return sessionStorage.getItem('lastOtpForReset') || '';
      } catch {
        return '';
      }
    })();
    if (!fromSS || !email) {
      const qs = new URLSearchParams({ email });
      router.replace(`/verify-otp?${qs.toString()}`);
      return;
    }
    setOtp(fromSS);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pwdScore = useMemo(() => scorePassword(pwd), [pwd]);

  const rules = useMemo(
    () => ({
      len8: pwd.length >= 8,
      upper: /[A-Z]/.test(pwd),
      lower: /[a-z]/.test(pwd),
      num: /\d/.test(pwd),
      special: /[^A-Za-z0-9]/.test(pwd),
      match: pwd.length > 0 && pwd === pwd2,
    }),
    [pwd, pwd2]
  );

  const disabled = useMemo(
    () =>
      !email ||
      !otp ||
      !pwd ||
      !pwd2 ||
      !rules.len8 ||
      !rules.upper ||
      !rules.lower ||
      !rules.num ||
      !rules.match ||
      loading,
    [email, otp, pwd, pwd2, rules, loading]
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (disabled) return;
    setErr(null);
    setLoading(true);
    try {
      const r = await postJSON<ResetResp>('/api/admin/auth/reset-password', {
        email,
        otp,
        newPassword: pwd,
      });
      if (r?.isSuccess === false) {
        setErr(r?.message || 'Đặt lại mật khẩu thất bại. Vui lòng thử lại.');
        return;
      }
      try {
        sessionStorage.removeItem('lastOtpForReset');
      } catch {}
      router.replace('/login');
      router.refresh();
    } catch (e: unknown) {
      setErr(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-[100dvh] overflow-hidden">
      {/* Background layers */}
      <div className="fixed inset-0 -z-30 bg-[radial-gradient(1400px_700px_at_70%_-10%,#f0abfc_0%,transparent_60%),radial-gradient(900px_500px_at_20%_0%,#bae6fd_0%,transparent_50%),linear-gradient(180deg,#0ea5e9_0%,#06b6d4_35%,#14b8a6_60%,#0ea5e9_100%)] opacity-90" />
      <div className="fixed inset-0 -z-20 [background:linear-gradient(transparent_23px,rgba(255,255,255,.08)_24px),linear-gradient(90deg,transparent_23px,rgba(255,255,255,.08)_24px)] [background-size:24px_24px] mix-blend-overlay" />

      <div className="relative z-10 mx-auto flex min-h-[100dvh] items-center px-4 py-10">
        <div className="mx-auto w-full max-w-xl">
          <div className="relative rounded-[28px] p-[1px] shadow-2xl shadow-cyan-900/25 ring-1 ring-white/25 backdrop-blur-xl before:absolute before:inset-0 before:-z-10 before:rounded-[28px] before:bg-gradient-to-br before:from-fuchsia-500/60 before:via-sky-400/60 before:to-cyan-400/60">
            <div className="rounded-[28px] border border-white/20 bg-white/75 p-6 md:p-8 dark:border-white/10 dark:bg-neutral-900/60">
              {/* Header */}
              <div className="mb-6 text-center">
                <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 via-pink-500 to-sky-500 text-white shadow-lg shadow-amber-500/20 ring-1 ring-white/40">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-6 w-6"
                    stroke="currentColor"
                    fill="none"
                    strokeWidth="2"
                  >
                    <path d="M12 22v-7" />
                    <path d="M7 7c2-2 8-2 10 0-3 1-7 1-10 0Z" />
                    <path d="M6 11c2-2 10-2 12 0-4 2-8 2-12 0Z" />
                    <path d="M8 15c1-1 7-1 8 0-3 2-5 2-8 0Z" />
                  </svg>
                </div>
                <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900 drop-shadow-sm">
                  Đặt mật khẩu mới
                </h1>
                <p className="mt-1 text-sm text-neutral-600">
                  Nhập mật khẩu mới cho tài khoản{' '}
                  <span className="font-semibold">{email || '—'}</span>.
                </p>
              </div>

              <form onSubmit={onSubmit} className="space-y-5">
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-neutral-800">Email</label>
                  <input
                    className="mt-1 block w-full rounded-2xl border border-white/40 bg-white/70 px-4 py-3 text-[15px] text-neutral-800 shadow-inner outline-none focus:border-transparent focus:ring-2 focus:ring-sky-500/70"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>

                {/* New password */}
                <div>
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-neutral-800">
                      Mật khẩu mới
                    </label>
                    {caps1 && (
                      <span className="text-xs font-medium text-amber-600">CapsLock đang bật</span>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      className="block w-full rounded-2xl border border-white/40 bg-white/70 px-4 py-3 pr-12 text-[15px] text-neutral-800 shadow-inner outline-none focus:border-transparent focus:ring-2 focus:ring-fuchsia-500/70"
                      type={show1 ? 'text' : 'password'}
                      value={pwd}
                      onChange={(e) => setPwd(e.target.value)}
                      onKeyUp={(e) => setCaps1(e.getModifierState?.('CapsLock') ?? false)}
                      onKeyDown={(e) => setCaps1(e.getModifierState?.('CapsLock') ?? false)}
                      required
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShow1((v) => !v)}
                      className="absolute inset-y-0 right-2.5 my-auto inline-flex h-9 w-9 items-center justify-center rounded-xl text-neutral-600 transition hover:bg-white/70 hover:text-neutral-800"
                      aria-label={show1 ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    >
                      {show1 ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>

                  {/* Strength meter */}
                  <div className="mt-2">
                    <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-200">
                      <div
                        className={`h-2 transition-all ${
                          [
                            'bg-rose-500',
                            'bg-orange-500',
                            'bg-amber-500',
                            'bg-emerald-500',
                            'bg-emerald-600',
                          ][scorePassword(pwd).score]
                        }`}
                        style={{ width: `${(scorePassword(pwd).score + 1) * 20}%` }}
                      />
                    </div>
                    <div className="mt-1 text-xs text-neutral-600">
                      Độ mạnh: {scorePassword(pwd).label}
                    </div>
                  </div>
                </div>

                {/* Confirm */}
                <div>
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-neutral-800">
                      Xác nhận mật khẩu
                    </label>
                    {caps2 && (
                      <span className="text-xs font-medium text-amber-600">CapsLock đang bật</span>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      className="block w-full rounded-2xl border border-white/40 bg-white/70 px-4 py-3 pr-12 text-[15px] text-neutral-800 shadow-inner outline-none focus:border-transparent focus:ring-2 focus:ring-fuchsia-500/70"
                      type={show2 ? 'text' : 'password'}
                      value={pwd2}
                      onChange={(e) => setPwd2(e.target.value)}
                      onKeyUp={(e) => setCaps2(e.getModifierState?.('CapsLock') ?? false)}
                      onKeyDown={(e) => setCaps2(e.getModifierState?.('CapsLock') ?? false)}
                      required
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShow2((v) => !v)}
                      className="absolute inset-y-0 right-2.5 my-auto inline-flex h-9 w-9 items-center justify-center rounded-xl text-neutral-600 transition hover:bg-white/70 hover:text-neutral-800"
                      aria-label={show2 ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    >
                      {show2 ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {pwd && pwd2 && pwd !== pwd2 && (
                    <p className="mt-1 text-sm text-rose-600">Mật khẩu nhập lại không khớp</p>
                  )}
                </div>

                {/* Rule checklist */}
                <div className="rounded-2xl border border-white/30 bg-white/60 p-3 text-[13px] text-neutral-700 shadow-inner">
                  <div className="mb-1 font-semibold text-neutral-800">Yêu cầu mật khẩu</div>
                  <ul className="space-y-1">
                    <li className="flex items-center gap-2">
                      <Check ok={rules.len8} /> Tối thiểu 8 ký tự
                    </li>
                    <li className="flex items-center gap-2">
                      <Check ok={rules.upper} /> Có chữ in hoa (A–Z)
                    </li>
                    <li className="flex items-center gap-2">
                      <Check ok={rules.lower} /> Có chữ thường (a–z)
                    </li>
                    <li className="flex items-center gap-2">
                      <Check ok={rules.num} /> Có số (0–9)
                    </li>
                    <li className="flex items-center gap-2">
                      <Check ok={rules.match} /> Trùng khớp phần xác nhận
                    </li>
                  </ul>
                </div>

                {err && (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-rose-700">
                    {err}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={disabled}
                  className="group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-emerald-600 px-4 py-3 font-semibold text-white shadow-lg shadow-emerald-600/30 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className="absolute inset-0 -z-10 animate-[pulse_3s_ease-in-out_infinite] bg-[conic-gradient(from_180deg_at_50%_50%,#22d3ee_0%,#f472b6_25%,#f59e0b_50%,#22c55e_75%,#22d3ee_100%)] opacity-0 blur-xl transition group-hover:opacity-40" />
                  {loading ? (
                    <>
                      <Spinner />
                      <span>Đang đặt lại…</span>
                    </>
                  ) : (
                    <span>Đặt mật khẩu mới</span>
                  )}
                </button>

                <p className="text-center text-sm">
                  Quay lại{' '}
                  <a
                    href="/login"
                    className="font-semibold text-sky-700 underline-offset-4 hover:underline"
                  >
                    đăng nhập
                  </a>
                </p>
              </form>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-white/90 drop-shadow">
            <span className="rounded-full bg-white/20 px-2 py-1 backdrop-blur-sm">
              Bảo mật AES-256
            </span>
            <span className="rounded-full bg-white/20 px-2 py-1 backdrop-blur-sm">
              Không chia sẻ mật khẩu
            </span>
            <span className="rounded-full bg-white/20 px-2 py-1 backdrop-blur-sm">Hỗ trợ 24/7</span>
          </div>
        </div>
      </div>
    </div>
  );
}
