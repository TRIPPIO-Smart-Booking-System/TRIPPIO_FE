// app/verify-otp/page.tsx
'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { postJSON } from '@/lib/http';

type VerifyPayload = { email: string; otp: string };
// ✅ Helper: lấy message an toàn từ unknown
function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'object' && err && 'message' in err) {
    return String((err as { message?: unknown }).message ?? 'Đã xảy ra lỗi');
  }
  return 'Đã xảy ra lỗi không xác định';
}
export default function VerifyOtpPage() {
  const sp = useSearchParams();
  const router = useRouter();

  const [email, setEmail] = useState(sp.get('email') || '');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    const v = sp.get('email');
    if (v) setEmail(v);
  }, [sp]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    setLoading(true);
    try {
      await postJSON<void>('/api/admin/auth/verify-email', { email, otp } as VerifyPayload);
      setMsg('Xác minh thành công! Đang chuyển vào trang chủ…');
      setTimeout(() => router.push('/'), 600);
    } catch (e: unknown) {
      // ⬅️ đổi any -> unknown
      setErr(getErrorMessage(e) || 'OTP không hợp lệ');
    } finally {
      setLoading(false);
    }
  }

  async function resendOtp() {
    setErr(null);
    setMsg(null);
    setResendLoading(true);
    try {
      await postJSON<void>('/api/admin/auth/resend-otp', { email });
      setMsg('Đã gửi lại OTP vào email của bạn.');
    } catch (e: unknown) {
      // ⬅️ đổi any -> unknown
      setErr(getErrorMessage(e) || 'Không thể gửi lại OTP');
    } finally {
      setResendLoading(false);
    }
  }
  return (
    <div className="container max-w-screen-2xl py-16">
      <div className="mx-auto max-w-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Nhập mã OTP</h1>
          <p className="mt-2 text-muted-foreground">
            Mã OTP đã gửi tới email <span className="font-semibold">{email || '—'}</span>
          </p>
        </div>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              className="mt-1 w-full rounded-md border px-3 py-2"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Mã OTP</label>
            <input
              className="mt-1 w-full rounded-md border px-3 py-2 tracking-widest"
              placeholder="••••••"
              value={otp}
              onChange={(e) => setOtp(e.target.value.trim())}
              required
              inputMode="numeric"
              maxLength={10}
            />
          </div>

          {err && <p className="text-sm text-red-600">{err}</p>}
          {msg && <p className="text-sm text-emerald-600">{msg}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-primary px-4 py-2 font-semibold text-white disabled:opacity-60"
          >
            {loading ? 'Đang xác minh…' : 'Xác minh'}
          </button>

          <button
            type="button"
            onClick={resendOtp}
            disabled={resendLoading}
            className="mt-3 w-full rounded-lg border px-4 py-2 font-semibold"
          >
            {resendLoading ? 'Đang gửi lại…' : 'Gửi lại OTP'}
          </button>
        </form>
      </div>
    </div>
  );
}
