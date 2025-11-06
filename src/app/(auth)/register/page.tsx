'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { postJSON } from '@/lib/http';

/* ----------------------------- Types ----------------------------- */
type RegisterApiResp = {
  isSuccess: boolean;
  message?: string;
  requireEmailVerification?: boolean;
  requirePhoneVerification?: boolean;
  loginResponse?: unknown;
};

/* --------------------------- Utils --------------------------- */
type WithMessage = { message?: unknown };
function hasMessage(x: unknown): x is WithMessage {
  return typeof x === 'object' && x !== null && 'message' in x;
}

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;

  if (hasMessage(err)) {
    const m = err.message;
    if (typeof m === 'string' && m.trim()) return m;
    try {
      return JSON.stringify(m) || 'Đã xảy ra lỗi';
    } catch {
      return 'Đã xảy ra lỗi';
    }
  }

  return 'Đã xảy ra lỗi không xác định';
}

const PASSWORD_MIN = 6;
const NON_NUMERIC_REGEX = /\D/; // ít nhất 1 ký tự không phải số

function Spinner() {
  return (
    <span className="inline-block h-5 w-5 animate-spin rounded-full border-[3px] border-white/40 border-t-white align-[-2px]" />
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

/* --------------------------- Component --------------------------- */
export default function RegisterForm() {
  const router = useRouter();

  const [form, setForm] = useState({
    username: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    dateOfBirthLocal: '',
  });

  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const passMismatch = form.confirmPassword.length > 0 && form.password !== form.confirmPassword;
  const passTooShort = form.password.length > 0 && form.password.length < PASSWORD_MIN;
  const passNeedsNonNumeric = form.password.length > 0 && !NON_NUMERIC_REGEX.test(form.password);

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
      passMismatch ||
      passTooShort ||
      passNeedsNonNumeric,
    [loading, form, passMismatch, passTooShort, passNeedsNonNumeric]
  );

  function localDateToISO(dateLocal: string): string {
    return new Date(`${dateLocal}T00:00:00`).toISOString();
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isDisabled) return;

    setErr(null);
    setMsg(null);
    setLoading(true);

    try {
      const payload = {
        username: form.username.trim(),
        email: form.email.trim(),
        phoneNumber: form.phoneNumber.trim(),
        password: form.password,
        confirmPassword: form.confirmPassword,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        dateOfBirth: localDateToISO(form.dateOfBirthLocal),
      };

      const data = await postJSON<RegisterApiResp>('/api/admin/auth/register', payload);

      // Gom các điều kiện có thể yêu cầu OTP
      const needEmailOTP =
        data?.requireEmailVerification === true ||
        /verify|otp|xác minh|kiểm tra email/i.test(data?.message ?? '') ||
        (data?.isSuccess === true && data?.loginResponse == null);

      if (data?.isSuccess) {
        if (needEmailOTP) {
          router.replace(`/verify-otp?email=${encodeURIComponent(form.email.trim())}`);
          return;
        }
        setMsg(data.message || 'Đăng ký thành công! Mời bạn đăng nhập.');
        setTimeout(() => router.replace('/login'), 400);
        return;
      }

      throw new Error(data?.message || 'Đăng ký thất bại');
    } catch (e: unknown) {
      setErr(getErrorMessage(e) || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-[100dvh] overflow-hidden">
      <FullBleedBG />

      <div className="relative z-10 mx-auto flex min-h-[100dvh] items-center px-4 py-10">
        <div className="mx-auto w-full max-w-md md:max-w-lg">
          {/* Glass card with gradient border */}
          <div className="relative rounded-3xl p-[1px] shadow-2xl shadow-cyan-900/25 ring-1 ring-white/20 backdrop-blur-xl before:absolute before:inset-0 before:-z-10 before:rounded-3xl before:bg-gradient-to-br before:from-fuchsia-500/50 before:via-sky-400/50 before:to-cyan-400/50">
            <div className="rounded-3xl border border-white/20 bg-white/75 p-6 dark:border-white/10 dark:bg-neutral-900/60">
              {/* Header */}
              <div className="mb-5 text-center">
                <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 via-pink-500 to-sky-500 text-white shadow-lg shadow-amber-500/20 ring-1 ring-white/40">
                  <Palm />
                </div>
                <h2 className="text-2xl font-extrabold tracking-tight text-neutral-900 drop-shadow-sm dark:text-white">
                  Tạo tài khoản Trippio
                </h2>
                <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">
                  Nhận ưu đãi & trải nghiệm du lịch tuyệt vời ✈️🏝️
                </p>
              </div>

              {/* Form */}
              <form onSubmit={onSubmit} className="space-y-4">
                {/* Họ tên */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-neutral-800 dark:text-neutral-200">
                      Họ
                    </label>
                    <input
                      className="block w-full rounded-2xl border border-white/40 bg-white/70 px-4 py-3 text-[15px] text-neutral-800 shadow-inner outline-none ring-0 transition placeholder:text-neutral-400 focus:border-transparent focus:ring-2 focus:ring-sky-500/70 dark:border-white/10 dark:bg-neutral-800/70 dark:text-neutral-100"
                      placeholder="Nguyễn"
                      value={form.firstName}
                      onChange={(e) => setForm((s) => ({ ...s, firstName: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-neutral-800 dark:text-neutral-200">
                      Tên
                    </label>
                    <input
                      className="block w-full rounded-2xl border border-white/40 bg-white/70 px-4 py-3 text-[15px] text-neutral-800 shadow-inner outline-none ring-0 transition placeholder:text-neutral-400 focus:border-transparent focus:ring-2 focus:ring-sky-500/70 dark:border-white/10 dark:bg-neutral-800/70 dark:text-neutral-100"
                      placeholder="An"
                      value={form.lastName}
                      onChange={(e) => setForm((s) => ({ ...s, lastName: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                {/* Username */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-neutral-800 dark:text-neutral-200">
                    Username
                  </label>
                  <input
                    className="block w-full rounded-2xl border border-white/40 bg-white/70 px-4 py-3 text-[15px] text-neutral-800 shadow-inner outline-none ring-0 transition placeholder:text-neutral-400 focus:border-transparent focus:ring-2 focus:ring-sky-500/70 dark:border-white/10 dark:bg-neutral-800/70 dark:text-neutral-100"
                    placeholder="your_username"
                    value={form.username}
                    onChange={(e) => setForm((s) => ({ ...s, username: e.target.value }))}
                    required
                  />
                </div>

                {/* Email + Phone */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-neutral-800 dark:text-neutral-200">
                      Email
                    </label>
                    <input
                      type="email"
                      className="block w-full rounded-2xl border border-white/40 bg-white/70 px-4 py-3 text-[15px] text-neutral-800 shadow-inner outline-none ring-0 transition placeholder:text-neutral-400 focus:border-transparent focus:ring-2 focus:ring-sky-500/70 dark:border-white/10 dark:bg-neutral-800/70 dark:text-neutral-100"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-neutral-800 dark:text-neutral-200">
                      Số điện thoại
                    </label>
                    <input
                      inputMode="tel"
                      className="block w-full rounded-2xl border border-white/40 bg-white/70 px-4 py-3 text-[15px] text-neutral-800 shadow-inner outline-none ring-0 transition placeholder:text-neutral-400 focus:border-transparent focus:ring-2 focus:ring-sky-500/70 dark:border-white/10 dark:bg-neutral-800/70 dark:text-neutral-100"
                      placeholder="09xxxxxxxx"
                      value={form.phoneNumber}
                      onChange={(e) => setForm((s) => ({ ...s, phoneNumber: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                {/* DOB */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-neutral-800 dark:text-neutral-200">
                    Ngày sinh
                  </label>
                  <input
                    type="date"
                    className="block w-full rounded-2xl border border-white/40 bg-white/70 px-4 py-3 text-[15px] text-neutral-800 shadow-inner outline-none ring-0 transition placeholder:text-neutral-400 focus:border-transparent focus:ring-2 focus:ring-sky-500/70 dark:border-white/10 dark:bg-neutral-800/70 dark:text-neutral-100"
                    value={form.dateOfBirthLocal}
                    onChange={(e) => setForm((s) => ({ ...s, dateOfBirthLocal: e.target.value }))}
                    required
                  />
                </div>

                {/* Passwords */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-neutral-800 dark:text-neutral-200">
                      Mật khẩu
                    </label>
                    <div className="relative">
                      <input
                        type={showPwd ? 'text' : 'password'}
                        className="block w-full rounded-2xl border border-white/40 bg-white/70 px-4 py-3 pr-12 text-[15px] text-neutral-800 shadow-inner outline-none ring-0 transition placeholder:text-neutral-400 focus:border-transparent focus:ring-2 focus:ring-fuchsia-500/70 dark:border-white/10 dark:bg-neutral-800/70 dark:text-neutral-100"
                        placeholder="••••••••"
                        value={form.password}
                        onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
                        minLength={PASSWORD_MIN}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPwd((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs text-neutral-600 hover:bg-white/50 dark:text-neutral-300 dark:hover:bg-neutral-700/40"
                        aria-label={showPwd ? 'Hide password' : 'Show password'}
                      >
                        {showPwd ? 'Ẩn' : 'Hiện'}
                      </button>
                    </div>
                    {form.password.length > 0 && (
                      <>
                        {passTooShort && (
                          <p className="text-xs text-red-600">
                            Mật khẩu tối thiểu {PASSWORD_MIN} ký tự.
                          </p>
                        )}
                        {passNeedsNonNumeric && (
                          <p className="text-xs text-red-600">
                            Mật khẩu phải có ít nhất <b>1 ký tự không phải số</b>.
                          </p>
                        )}
                        {!passTooShort && !passNeedsNonNumeric && (
                          <p className="text-xs text-emerald-600">✔ Hợp lệ</p>
                        )}
                      </>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-neutral-800 dark:text-neutral-200">
                      Nhập lại mật khẩu
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPwd ? 'text' : 'password'}
                        className={`block w-full rounded-2xl border px-4 py-3 pr-12 text-[15px] outline-none ring-0 transition placeholder:text-neutral-400 focus:border-transparent focus:ring-2 ${
                          passMismatch
                            ? 'border-red-300 focus:ring-red-500 dark:border-red-600'
                            : 'border-white/40 focus:ring-fuchsia-500/70 dark:border-white/10'
                        } bg-white/70 text-neutral-800 shadow-inner dark:bg-neutral-800/70 dark:text-neutral-100`}
                        placeholder="••••••••"
                        value={form.confirmPassword}
                        onChange={(e) =>
                          setForm((s) => ({ ...s, confirmPassword: e.target.value }))
                        }
                        minLength={PASSWORD_MIN}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPwd((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs text-neutral-600 hover:bg-white/50 dark:text-neutral-300 dark:hover:bg-neutral-700/40"
                        aria-label={showConfirmPwd ? 'Hide password' : 'Show password'}
                      >
                        {showConfirmPwd ? 'Ẩn' : 'Hiện'}
                      </button>
                    </div>
                    {passMismatch && (
                      <p className="text-xs text-red-600">Mật khẩu nhập lại không khớp.</p>
                    )}
                  </div>
                </div>

                {err && (
                  <div className="rounded-xl border border-red-300/40 bg-red-50/80 px-3 py-2 text-sm text-red-700 backdrop-blur-sm dark:border-red-600/30 dark:bg-red-900/30 dark:text-red-300">
                    {err}
                  </div>
                )}
                {msg && (
                  <div className="rounded-xl border border-emerald-300/40 bg-emerald-50/80 px-3 py-2 text-sm text-emerald-800 backdrop-blur-sm dark:border-emerald-600/30 dark:bg-emerald-900/30 dark:text-emerald-300">
                    {msg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isDisabled}
                  className="group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-neutral-900 px-4 py-3 font-semibold text-white shadow-lg shadow-neutral-900/20 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-neutral-900"
                >
                  <span className="absolute inset-0 -z-10 animate-[pulse_3s_ease-in-out_infinite] bg-[conic-gradient(from_180deg_at_50%_50%,#22d3ee_0%,#f472b6_25%,#f59e0b_50%,#22c55e_75%,#22d3ee_100%)] opacity-0 blur-xl transition group-hover:opacity-40" />
                  {loading ? (
                    <>
                      <Spinner />
                      <span>Đang tạo tài khoản…</span>
                    </>
                  ) : (
                    <span>Đăng ký</span>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* nhỏ xinh dưới form */}
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-white/90 drop-shadow">
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
