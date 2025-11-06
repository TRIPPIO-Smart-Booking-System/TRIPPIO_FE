// src/components/ReviewModal.tsx
'use client';
import { useState } from 'react';
import { apiCreateReview } from '@/lib/review.api';

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

  if (!open) return null;

  const submit = async () => {
    if (!orderId) return;
    setSaving(true);
    setErr(null);
    try {
      await apiCreateReview({ orderId, rating, comment: comment.trim() || undefined });
      onClose(true);
    } catch (e: unknown) {
      setErr(errorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
        <h3 className="text-lg font-semibold">Đánh giá đơn hàng #{orderId}</h3>

        <div className="mt-4">
          <div className="text-sm text-zinc-600 mb-1">Chọn số sao</div>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                className={`text-2xl ${s <= rating ? 'text-yellow-500' : 'text-zinc-300'}`}
                onClick={() => setRating(s)}
                aria-label={`rate-${s}`}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <div className="text-sm text-zinc-600 mb-1">Nhận xét (tuỳ chọn)</div>
          <textarea
            className="w-full rounded-lg border px-3 py-2"
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Cảm nhận của bạn…"
          />
        </div>

        {err && (
          <div className="mt-3 rounded border border-red-200 bg-red-50 p-2 text-red-700 text-sm">
            {err}
          </div>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <button
            className="rounded-lg border px-3 py-2"
            onClick={() => onClose(false)}
            disabled={saving}
          >
            Để sau
          </button>
          <button
            className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60"
            onClick={submit}
            disabled={saving || !orderId}
          >
            {saving ? 'Đang gửi…' : 'Gửi đánh giá'}
          </button>
        </div>
      </div>
    </div>
  );
}
