// src/components/ReviewModal.tsx
'use client';
import { useState } from 'react';
import { Loader2, Star, X } from 'lucide-react';
import { getAuth } from '@/lib/auth';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'https://trippio.azurewebsites.net';

function getToken(): string | null {
  try {
    return localStorage.getItem('authToken') ?? localStorage.getItem('accessToken');
  } catch {
    return null;
  }
}

function errorMessage(err: unknown, fallback = 'Gửi đánh giá thất bại'): string {
  if (err instanceof Error) return err.message || fallback;
  if (typeof err === 'string') return err || fallback;
  try {
    const s = JSON.stringify(err);
    return s === '{}' ? fallback : s;
  } catch {
    return fallback;
  }
}

export default function ReviewModal({
  open,
  orderId,
  onClose,
}: {
  open: boolean;
  orderId?: number | string;
  onClose: (ok?: boolean) => void;
}) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!open) return null;

  const submit = async () => {
    if (!orderId) {
      setErr('Không tìm thấy đơn hàng');
      return;
    }

    setSaving(true);
    setErr(null);
    setSuccess(false);

    try {
      // Try getAuth() first (recommended), then fallback to localStorage
      const authFromStorage = getAuth();
      const token = authFromStorage.accessToken || getToken();

      console.log(
        '[ReviewModal.submit] Auth source:',
        authFromStorage.accessToken ? 'getAuth()' : 'getToken()'
      );
      console.log('[ReviewModal.submit] Token available:', token ? '✓ Yes' : '✗ No');

      if (!token) {
        console.warn('[ReviewModal.submit] ⚠️ No token found at all');
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log(
          '[ReviewModal.submit] Authorization header set:',
          `Bearer ${token.substring(0, 20)}...`
        );
      }

      const requestBody = {
        orderId: Number(orderId),
        rating,
        comment: comment.trim() || undefined,
      };
      console.log('[ReviewModal.submit] Request body:', requestBody);
      console.log('[ReviewModal.submit] API endpoint:', `${API_BASE}/api/review`);

      const response = await fetch(`${API_BASE}/api/review`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const msg = await response.text().catch(() => 'Lỗi không xác định');
        console.error('[ReviewModal.submit] HTTP Error:', {
          status: response.status,
          statusText: response.statusText,
          message: msg,
          headers: Array.from(response.headers.entries()),
        });
        throw new Error(`HTTP ${response.status}: ${msg}`);
      }

      const data = await response.json();
      console.log('[ReviewModal.submit] Success response:', data);
      setSuccess(true);
      setRating(5);
      setComment('');

      // Close modal sau 1.5s
      setTimeout(() => {
        onClose(true);
      }, 1500);
    } catch (e: unknown) {
      setErr(errorMessage(e));
    } finally {
      setSaving(false);
    }
  };
  const handleClose = () => {
    if (!saving) {
      setRating(5);
      setComment('');
      setErr(null);
      setSuccess(false);
      onClose(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-3 sm:p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-4 sm:p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base sm:text-lg font-semibold text-slate-800">
            Đánh giá đơn hàng #{orderId}
          </h3>
          <button
            onClick={handleClose}
            disabled={saving}
            className="shrink-0 rounded-lg p-1 hover:bg-slate-100 disabled:opacity-50"
            aria-label="Close"
          >
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        {/* Success State */}
        {success ? (
          <div className="py-8 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
              <Star className="h-6 w-6 fill-emerald-600 text-emerald-600" />
            </div>
            <p className="font-semibold text-slate-800">Cảm ơn bạn!</p>
            <p className="mt-1 text-xs sm:text-sm text-slate-600">
              Đánh giá của bạn đã được ghi nhận
            </p>
          </div>
        ) : (
          <>
            {/* Rating Section */}
            <div className="mb-5">
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-3">
                Chọn số sao
              </label>
              <div className="flex items-center gap-1 sm:gap-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setRating(s)}
                    disabled={saving}
                    className="transition-transform hover:scale-110 disabled:opacity-50"
                    aria-label={`Chọn ${s} sao`}
                  >
                    <Star
                      className={`h-6 sm:h-8 w-6 sm:w-8 ${
                        s <= rating
                          ? 'fill-amber-400 text-amber-400'
                          : 'fill-slate-200 text-slate-200'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs sm:text-sm text-slate-600">
                Bạn đánh giá: <span className="font-semibold">{rating} trên 5 sao</span>
              </p>
            </div>

            {/* Comment Section */}
            <div className="mb-4">
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
                Nhận xét (tuỳ chọn)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                disabled={saving}
                rows={4}
                maxLength={500}
                className="w-full rounded-lg border border-slate-200 px-2 sm:px-3 py-2 text-xs sm:text-sm placeholder-slate-400 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-slate-50"
                placeholder="Chia sẻ trải nghiệm của bạn…"
              />
              <p className="mt-1 text-xs text-slate-500">{comment.length}/500 ký tự</p>
            </div>

            {/* Error Message */}
            {err && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-2 sm:p-3 text-xs sm:text-sm text-red-700">
                {err}
              </div>
            )}
          </>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-end gap-2">
          {!success && (
            <>
              <button
                onClick={handleClose}
                disabled={saving}
                className="rounded-lg border border-slate-200 bg-white px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition"
              >
                Để sau
              </button>
              <button
                onClick={submit}
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60 transition"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {saving ? 'Đang gửi…' : 'Gửi đánh giá'}
              </button>
            </>
          )}
          {success && (
            <button
              onClick={handleClose}
              className="rounded-lg bg-blue-600 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white hover:bg-blue-700 transition w-full"
            >
              Đóng
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
