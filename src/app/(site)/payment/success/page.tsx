/* eslint react/prop-types: 0 */
'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Check, Home, Receipt, Star } from 'lucide-react';
import { getAccessToken } from '@/lib/auth';

/* ================= Basics ================= */

type Props = { searchParams?: { orderCode?: string } };
const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:7142';

const EVT_REVIEWS_CHANGED = 'reviews:changed';
const EVT_PAYMENTS_CHANGED = 'payments:changed';
const LS_REVIEWS = 'TRIPPIO_ORDER_REVIEWS';

const fmtVND = (n: number) =>
  (Number(n) || 0).toLocaleString('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  });

type StatusResp = {
  code?: number;
  message?: string;
  data?: {
    orderCode: number;
    amount: number;
    status: 'PENDING' | 'PAID' | 'CANCELLED' | 'EXPIRED' | string;
    transactions?: Array<{
      reference?: string;
      amount?: number;
      accountNumber?: string;
      description?: string;
      transactionDateTime?: string; // ISO
      virtualAccountName?: string | null;
      virtualAccountNumber?: string | null;
      counterAccountBankId?: string | null;
      counterAccountBankName?: string | null;
      counterAccountName?: string | null;
      counterAccountNumber?: string | null;
    }>;
  };
};

/* ================= Local Review Store (by orderCode) ================= */

type Review = {
  id: string;
  orderId: number; // = orderCode
  rating: number; // 1..5
  comment: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO
};

function loadReviewsMap(): Record<string, Review> {
  try {
    const raw = localStorage.getItem(LS_REVIEWS);
    if (!raw) return {};
    const obj = JSON.parse(raw) as Record<string, Review>;
    return obj && typeof obj === 'object' ? obj : {};
  } catch {
    return {};
  }
}
function saveReviewsMap(map: Record<string, Review>) {
  localStorage.setItem(LS_REVIEWS, JSON.stringify(map));
}
function getLocalReviewByOrder(orderId: number): Review | null {
  const map = loadReviewsMap();
  return map[String(orderId)] ?? null;
}
function createLocalReview(input: { orderId: number; rating: number; comment: string }): Review {
  const now = new Date().toISOString();
  const map = loadReviewsMap();
  const rv: Review = {
    id: Math.random().toString(36).slice(2),
    orderId: input.orderId,
    rating: input.rating,
    comment: input.comment,
    createdAt: now,
    updatedAt: now,
  };
  map[String(input.orderId)] = rv; // 1 order = 1 review
  saveReviewsMap(map);
  return rv;
}
function updateLocalReviewByOrder(
  orderId: number,
  input: { rating: number; comment: string }
): Review {
  const map = loadReviewsMap();
  const key = String(orderId);
  const old = map[key];
  if (!old) throw new Error('Không tìm thấy review theo orderCode');
  const rv: Review = {
    ...old,
    rating: input.rating,
    comment: input.comment,
    updatedAt: new Date().toISOString(),
  };
  map[key] = rv;
  saveReviewsMap(map);
  return rv;
}
function deleteLocalReviewByOrder(orderId: number) {
  const map = loadReviewsMap();
  const key = String(orderId);
  if (!map[key]) throw new Error('Không tìm thấy review theo orderCode');
  delete map[key];
  saveReviewsMap(map);
}

/* ===== broadcast helpers ===== */
function broadcast(type: 'reviews' | 'payments') {
  const evt = type === 'reviews' ? EVT_REVIEWS_CHANGED : EVT_PAYMENTS_CHANGED;
  try {
    window.dispatchEvent(new CustomEvent(evt));
  } catch {}
}

/* ================= Page ================= */

export default function PaymentSuccessPage({ searchParams }: Props) {
  // ---- read orderCode from query
  const orderCodeRaw = searchParams?.orderCode ?? '';
  const orderCode = useMemo(() => {
    const n = Number(orderCodeRaw);
    return Number.isFinite(n) && n > 0 ? n : undefined;
  }, [orderCodeRaw]);

  const [amount, setAmount] = useState<number | undefined>(undefined);
  const [status, setStatus] = useState<string>('PENDING');
  const prevStatusRef = useRef<string>('PENDING');
  const [txns, setTxns] = useState<StatusResp['data']['transactions']>([]);
  const [err, setErr] = useState<string | null>(null);

  /* ===== Review UI states (local only; shared with Orders page) ===== */
  const [existing, setExisting] = useState<Review | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [hover, setHover] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  const reviewSent = !!existing;
  const canSubmitReview = status === 'PAID' && orderCode && rating > 0 && comment.trim().length > 0;

  // Load sẵn review local nếu có (key = orderCode)
  useEffect(() => {
    if (!orderCode) return;
    const rv = getLocalReviewByOrder(orderCode);
    setExisting(rv);
    if (rv) {
      setRating(rv.rating);
      setComment(rv.comment);
    } else {
      setRating(0);
      setComment('');
    }
  }, [orderCode]);

  // Cross-tab sync (nếu sửa/xoá ở trang Orders)
  useEffect(() => {
    const onStorage = (ev: StorageEvent) => {
      if (ev.key === LS_REVIEWS && orderCode) {
        const rv = getLocalReviewByOrder(orderCode);
        setExisting(rv);
        if (rv) {
          setRating(rv.rating);
          setComment(rv.comment);
        }
      }
    };
    const onReviewsChanged = () => {
      if (!orderCode) return;
      const rv = getLocalReviewByOrder(orderCode);
      setExisting(rv);
      if (rv) {
        setRating(rv.rating);
        setComment(rv.comment);
      }
    };
    window.addEventListener('storage', onStorage);
    window.addEventListener(EVT_REVIEWS_CHANGED, onReviewsChanged as EventListener);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener(EVT_REVIEWS_CHANGED, onReviewsChanged as EventListener);
    };
  }, [orderCode]);

  /* ====== Fetch status ====== */
  const fetchStatus = useCallback(async () => {
    if (!orderCode) return;
    try {
      setErr(null);
      const token =
        getAccessToken() ||
        (typeof window !== 'undefined' ? (localStorage.getItem('accessToken') ?? '') : '');

      const r = await fetch(`${API_BASE}/api/Checkout/status/${orderCode}`, {
        method: 'GET',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        cache: 'no-store',
        credentials: 'include',
      });
      if (!r.ok) throw new Error(`Status failed: HTTP ${r.status}`);
      const data = (await r.json()) as StatusResp;
      if (data?.code && data.code !== 200) {
        throw new Error(data?.message || 'Status error');
      }

      setAmount(data?.data?.amount);
      const newStatus = data?.data?.status || 'UNKNOWN';
      setStatus(newStatus);

      // nếu vừa chuyển sang PAID lần đầu -> broadcast để Orders tự refresh
      if (prevStatusRef.current !== 'PAID' && newStatus === 'PAID') {
        broadcast('payments');
      }
      prevStatusRef.current = newStatus;

      setTxns(data?.data?.transactions || []);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setErr(msg || 'Không tải được thông tin thanh toán');
    }
  }, [orderCode]);

  // Poll đến khi không còn PENDING
  useEffect(() => {
    if (!orderCode) return;
    void fetchStatus();
    const id = window.setInterval(() => {
      if (status === 'PENDING') void fetchStatus();
    }, 3000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderCode, fetchStatus]);

  /* ====== Submit review (LOCAL) + broadcast ====== */
  const handleSubmitReview = useCallback(async () => {
    if (!orderCode || (!existing && !canSubmitReview)) return;
    try {
      setSubmitting(true);
      if (existing) {
        const updated = updateLocalReviewByOrder(orderCode, {
          rating,
          comment: comment.trim(),
        });
        setExisting(updated);
      } else {
        const created = createLocalReview({
          orderId: orderCode,
          rating,
          comment: comment.trim(),
        });
        setExisting(created);
      }
      // thông báo cho màn Orders / các tab khác
      broadcast('reviews');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      alert(msg || 'Gửi đánh giá thất bại');
    } finally {
      setSubmitting(false);
    }
  }, [orderCode, existing, canSubmitReview, rating, comment]);

  const handleDeleteReview = useCallback(() => {
    if (!existing || !orderCode) return;
    if (!confirm('Xoá đánh giá này?')) return;
    try {
      deleteLocalReviewByOrder(orderCode);
      setExisting(null);
      setRating(0);
      setComment('');
      broadcast('reviews');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      alert(msg || 'Không xoá được đánh giá');
    }
  }, [existing, orderCode]);

  /* ================= Render ================= */

  return (
    <div className="relative min-h-[100dvh] overflow-hidden">
      {/* BG đẹp */}
      <div aria-hidden className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-sky-50 to-indigo-50" />
        <div className="absolute inset-0 bg-[radial-gradient(700px_300px_at_10%_-5%,rgba(16,185,129,.25),transparent_60%),radial-gradient(800px_300px_at_90%_0%,rgba(59,130,246,.25),transparent_60%)]" />
      </div>

      {/* Confetti khi PAID */}
      {status === 'PAID' && <Confetti />}

      {/* Container */}
      <div className="mx-auto w-full max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl overflow-hidden rounded-3xl border border-white/50 bg-white/80 p-8 shadow-xl backdrop-blur">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div
              className={[
                'inline-flex items-center gap-2 rounded-full px-3 py-1 ring-1',
                status === 'PAID'
                  ? 'bg-emerald-100 text-emerald-700 ring-emerald-200'
                  : status === 'PENDING'
                    ? 'bg-amber-100 text-amber-700 ring-amber-200'
                    : 'bg-slate-100 text-slate-700 ring-slate-200',
              ].join(' ')}
            >
              <Check className="h-4 w-4" />
              <span className="text-xs font-semibold">
                {status === 'PAID'
                  ? 'Thanh toán thành công'
                  : status === 'PENDING'
                    ? 'Đang chờ thanh toán'
                    : `Trạng thái: ${status}`}
              </span>
            </div>

            {status !== 'PAID' && (
              <button
                onClick={() => void fetchStatus()}
                className="text-[12px] font-semibold text-sky-700 underline-offset-4 hover:underline"
              >
                Làm mới
              </button>
            )}
          </div>

          {/* Hero */}
          <div className="mt-6 flex flex-col items-center text-center">
            <CheckBurst />

            <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              {status === 'PAID'
                ? 'Cảm ơn bạn! Thanh toán đã hoàn tất.'
                : 'Đang kiểm tra trạng thái thanh toán...'}
            </h1>

            <p className="mt-2 max-w-xl text-sm text-slate-600">
              Mã đơn hàng của bạn{' '}
              <span className="font-semibold text-slate-900">{orderCode ?? '—'}</span>
              {typeof amount === 'number' ? (
                <>
                  {' '}
                  với số tiền{' '}
                  <span className="font-semibold text-emerald-700">{fmtVND(amount)}</span>.
                </>
              ) : (
                '.'
              )}
            </p>

            {err && <p className="mt-2 text-sm text-red-600">{err}</p>}
          </div>

          {/* Card info */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border bg-white p-4 shadow-sm">
              <div className="text-[12px] text-slate-500">Mã đơn (orderCode)</div>
              <div className="mt-1 font-semibold text-slate-900">{orderCode ?? '—'}</div>
            </div>
            <div className="rounded-2xl border bg-white p-4 shadow-sm">
              <div className="text-[12px] text-slate-500">Số tiền</div>
              <div className="mt-1 font-semibold text-emerald-700">
                {typeof amount === 'number' ? fmtVND(amount) : '—'}
              </div>
            </div>
          </div>

          {/* Transactions */}
          {!!txns?.length && (
            <div className="mt-6 rounded-2xl border bg-white p-4 shadow-sm">
              <div className="mb-2 text-sm font-semibold text-slate-900">Giao dịch</div>
              <div className="divide-y text-sm">
                {txns.map((t, i) => (
                  <div key={i} className="py-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="font-medium">{t?.reference || '(ref)'}</div>
                      <div className="text-emerald-700">{fmtVND(t?.amount ?? 0)}</div>
                    </div>
                    <div className="mt-1 text-[12px] text-slate-600">
                      {t?.transactionDateTime
                        ? new Date(t.transactionDateTime).toLocaleString('vi-VN')
                        : ''}
                    </div>
                    {t?.description && (
                      <div className="mt-1 truncate text-[12px] text-slate-500">
                        {t.description}
                      </div>
                    )}
                    {(t?.counterAccountName || t?.counterAccountNumber) && (
                      <div className="mt-1 text-[12px] text-slate-500">
                        Nguồn: {t?.counterAccountName ?? ''}{' '}
                        {t?.counterAccountNumber ? `(${t.counterAccountNumber})` : ''}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========== REVIEW SECTION (Local, shared) – hiện khi PAID ========== */}
          {status === 'PAID' && orderCode && (
            <div className="mt-8 rounded-2xl border bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-base font-semibold text-slate-900">Đánh giá trải nghiệm</h3>
                {reviewSent && (
                  <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[12px] font-semibold text-emerald-700 ring-1 ring-emerald-200">
                    Đã lưu (Local)
                  </span>
                )}
              </div>

              {/* Nếu đã có review: hiển thị + tool chỉnh sửa nhanh */}
              {existing ? (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <StarRow value={existing.rating} />
                    <span className="text-sm text-slate-600">{existing.rating}/5</span>
                  </div>
                  <p className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                    {existing.comment}
                  </p>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        setRating(existing.rating);
                        setComment(existing.comment);
                      }}
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Sửa đánh giá
                    </button>
                    <button
                      onClick={handleDeleteReview}
                      className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-rose-700"
                    >
                      Xoá
                    </button>
                  </div>

                  {/* Form chỉnh sửa nhanh */}
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm text-sky-700">
                      Chỉnh sửa ngay
                    </summary>
                    <ReviewEditor
                      rating={rating}
                      setRating={setRating}
                      hover={hover}
                      setHover={setHover}
                      comment={comment}
                      setComment={setComment}
                      submitting={submitting}
                      onClear={() => {
                        setRating(existing.rating);
                        setComment(existing.comment);
                      }}
                      onSubmit={() => void handleSubmitReview()}
                      submitLabel={submitting ? 'Đang lưu...' : 'Lưu thay đổi'}
                    />
                  </details>
                </div>
              ) : (
                <ReviewEditor
                  rating={rating}
                  setRating={setRating}
                  hover={hover}
                  setHover={setHover}
                  comment={comment}
                  setComment={setComment}
                  submitting={submitting}
                  onClear={() => {
                    setRating(0);
                    setComment('');
                  }}
                  onSubmit={() => void handleSubmitReview()}
                  disabled={!canSubmitReview}
                  submitLabel={submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
                />
              )}
            </div>
          )}

          {/* Actions */}
          <div className="mt-8 flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/homepage"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 font-semibold text-white shadow-lg transition hover:-translate-y-[1px] hover:bg-emerald-700 active:translate-y-0"
            >
              <Home className="h-5 w-5" />
              Về trang chủ
            </Link>

            <Link
              href="/orders"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
            >
              <Receipt className="h-5 w-5" />
              Xem đơn của tôi
            </Link>
          </div>
        </div>

        {/* footer note */}
        <p className="mx-auto mt-6 max-w-2xl text-center text-[12px] text-slate-500">
          {status === 'PAID'
            ? 'Bạn có thể về trang chủ hoặc xem danh sách đơn. Đừng quên để lại đánh giá nhé!'
            : 'Chúng tôi sẽ làm mới trạng thái định kỳ mỗi vài giây.'}
        </p>
      </div>
    </div>
  );
}

/* ---------- Sub UI ---------- */

function ReviewEditor(props: {
  rating: number;
  setRating: (n: number) => void;
  hover: number;
  setHover: (n: number) => void;
  comment: string;
  setComment: (s: string) => void;
  submitting: boolean;
  onClear: () => void;
  onSubmit: () => void;
  submitLabel: string;
  disabled?: boolean;
}) {
  const {
    rating,
    setRating,
    hover,
    setHover,
    comment,
    setComment,
    submitting,
    onClear,
    onSubmit,
    submitLabel,
    disabled,
  } = props;

  return (
    <>
      {/* Stars */}
      <div className="mb-3 flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((i) => {
          const active = (hover || rating) >= i;
          return (
            <button
              key={i}
              type="button"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setRating(i)}
              className="p-1"
              aria-label={`Chọn ${i} sao`}
            >
              <Star
                className={`h-7 w-7 ${active ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
              />
            </button>
          );
        })}
        {rating > 0 && <span className="ml-2 text-sm text-slate-600">{rating}/5 sao</span>}
      </div>

      {/* Comment */}
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={4}
        className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:ring-2 focus:ring-sky-200"
        placeholder="Hãy chia sẻ cảm nhận của bạn về đơn hàng, quy trình thanh toán..."
      />

      <div className="mt-3 flex items-center justify-end gap-3">
        <button
          onClick={onClear}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          type="button"
          disabled={submitting}
        >
          Xóa
        </button>
        <button
          onClick={onSubmit}
          disabled={Boolean(disabled) || submitting}
          className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          type="button"
        >
          {submitLabel}
        </button>
      </div>
    </>
  );
}

function StarRow({ value }: { value: number }) {
  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i <= value ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
        />
      ))}
    </div>
  );
}

function CheckBurst() {
  return (
    <div className="relative">
      <div className="absolute inset-0 -z-10 animate-ping rounded-full bg-emerald-300/40 blur-md" />
      <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg ring-4 ring-emerald-100">
        <Check className="h-8 w-8" />
      </div>
    </div>
  );
}

function Confetti() {
  const pieces = 40;
  const nodes = Array.from({ length: pieces });
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @keyframes confettiFall {
            0%   { transform: translateY(-120%) rotate(0deg); opacity: 0 }
            10%  { opacity: 1 }
            100% { transform: translateY(120vh) rotate(720deg); opacity: 0.9 }
          }
        `,
        }}
      />
      <div className="absolute inset-x-0 top-0 mx-auto grid h-0 w-full max-w-6xl grid-cols-8 gap-2">
        {nodes.map((_, i) => {
          const d = 4 + Math.random() * 6;
          const delay = Math.random() * 0.6;
          const dur = 3.2 + Math.random() * 1.8;
          const colors = [
            '#10b981',
            '#06b6d4',
            '#3b82f6',
            '#f59e0b',
            '#ef4444',
            '#a855f7',
          ] as const;
          const bg = colors[i % colors.length];
          const leftOffset = `${Math.random() * 100}%`;
          const borderRadius = Math.random() > 0.5 ? '9999px' : '6px';
          const skew = `skew(${Math.random() * 16 - 8}deg, ${Math.random() * 16 - 8}deg)`;
          return (
            <span
              key={i}
              style={{
                position: 'fixed',
                top: '-10px',
                left: leftOffset,
                width: `${d}px`,
                height: `${d * (Math.random() > 0.5 ? 1 : 1.8)}px`,
                backgroundColor: bg,
                borderRadius,
                transform: skew,
                animation: `confettiFall ${dur}s ${delay}s linear forwards`,
                opacity: 0.9,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
