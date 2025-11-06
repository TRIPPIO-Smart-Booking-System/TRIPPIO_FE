/* eslint react/prop-types: 0 */
'use client';

import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import {
  Loader2,
  CreditCard,
  Search,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  Pencil,
  Trash2,
  Star,
  ChevronDown,
  ChevronUp,
  Info,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { fmtVND } from '@/lib/payment';

/* ====== Constants ====== */
const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'https://trippio.azurewebsites.net';
const LS_REVIEWS = 'TRIPPIO_ORDER_REVIEWS';
const EVT_REVIEWS_CHANGED = 'reviews:changed';

/* ====== Types ====== */
type ApiOrderItem = {
  id: number;
  orderId: number;
  bookingId: string;
  bookingName: string;
  quantity: number;
  price: number;
};

type ApiOrder = {
  id: number;
  userId: string;
  orderDate: string; // ISO
  totalAmount: number;
  orderItems: ApiOrderItem[];
  status: string; // e.g. Confirmed
};

type UiStatus = 'Paid' | 'Pending' | 'Failed' | 'Refunded' | 'Expired' | 'Other';

type Row = {
  orderId: number;
  items: ApiOrderItem[];
  itemsText: string;
  totalVND: number;
  status: UiStatus;
  orderDate: string; // ISO
};

type Review = {
  id: string;
  orderId: number;
  rating: number; // 1..5
  comment?: string;
};

/* ====== Toast ====== */
function useToasts() {
  const [toasts, setToasts] = useState<{ id: number; title: string; desc?: string }[]>([]);
  const idRef = useRef(1);
  const push = useCallback((title: string, desc?: string) => {
    const id = idRef.current++;
    setToasts((t) => [...t, { id, title, desc }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000);
  }, []);
  const ui = (
    <div className="pointer-events-none fixed inset-x-0 top-3 z-[60] flex w-full justify-center">
      <div className="flex w-full max-w-sm flex-col gap-2 px-3">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ y: -20, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -10, opacity: 0, scale: 0.98 }}
              className="pointer-events-auto overflow-hidden rounded-2xl border border-slate-200 bg-white/90 p-3 shadow-xl backdrop-blur"
            >
              <div className="text-sm font-semibold text-slate-800">{t.title}</div>
              {t.desc && <div className="text-[12px] text-slate-600">{t.desc}</div>}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
  return { push, ui } as const;
}

/* ====== Helpers ====== */
function mapOrderStatus(status: string): UiStatus {
  const s = (status || '').toLowerCase();
  if (s === 'confirmed' || s === 'completed' || s === 'paid') return 'Paid';
  if (s === 'pending' || s === 'processing') return 'Pending';
  if (s === 'refunded') return 'Refunded';
  if (s === 'expired') return 'Expired';
  if (s === 'failed' || s === 'canceled' || s === 'cancelled') return 'Failed';
  return 'Other';
}
function errMsg(e: unknown) {
  return e instanceof Error ? e.message : 'Unexpected error';
}
function pillClass(status: UiStatus) {
  switch (status) {
    case 'Paid':
      return 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-300';
    case 'Pending':
      return 'bg-amber-100 text-amber-700 ring-1 ring-amber-300';
    case 'Failed':
    case 'Expired':
      return 'bg-rose-100 text-rose-700 ring-1 ring-rose-300';
    case 'Refunded':
      return 'bg-sky-100 text-sky-700 ring-1 ring-sky-300';
    default:
      return 'bg-slate-100 text-slate-700 ring-1 ring-slate-300';
  }
}
function pillIcon(status: UiStatus) {
  switch (status) {
    case 'Paid':
      return <CheckCircle2 className="h-4 w-4" />;
    case 'Pending':
      return <Clock className="h-4 w-4" />;
    case 'Refunded':
      return <RotateCcw className="h-4 w-4" />;
    case 'Failed':
    case 'Expired':
    case 'Other':
    default:
      return <XCircle className="h-4 w-4" />;
  }
}

/* ====== Local review (fake) + broadcast ====== */
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
  const map = loadReviewsMap();
  const rv: Review = {
    id: Math.random().toString(36).slice(2),
    orderId: input.orderId,
    rating: input.rating,
    comment: input.comment,
  };
  map[String(input.orderId)] = rv; // 1 order = 1 review
  saveReviewsMap(map);
  return rv;
}
function updateLocalReview(id: string, input: { rating: number; comment: string }): Review {
  const map = loadReviewsMap();
  const key = Object.keys(map).find((k) => map[k]?.id === id);
  if (!key) throw new Error('Không tìm thấy review');
  const old = map[key]!;
  const rv: Review = { ...old, rating: input.rating, comment: input.comment };
  map[key] = rv;
  saveReviewsMap(map);
  return rv;
}
function deleteLocalReview(id: string) {
  const map = loadReviewsMap();
  const key = Object.keys(map).find((k) => map[k]?.id === id);
  if (!key) throw new Error('Không tìm thấy review');
  delete map[key];
  saveReviewsMap(map);
}
function broadcastReviewsChanged() {
  try {
    window.dispatchEvent(new CustomEvent(EVT_REVIEWS_CHANGED));
  } catch {}
}

// wrappers “API”
async function fetchReviewByOrder(orderId: number): Promise<Review | null> {
  return getLocalReviewByOrder(orderId);
}
async function createReview(input: { orderId: number; rating: number; comment: string }) {
  const res = createLocalReview(input);
  broadcastReviewsChanged();
  return res;
}
async function updateReview(id: string, input: { rating: number; comment: string }) {
  const res = updateLocalReview(id, input);
  broadcastReviewsChanged();
  return res;
}
async function deleteReview(id: string) {
  deleteLocalReview(id);
  broadcastReviewsChanged();
  return true;
}

/* ====== PAGE ====== */
export default function OrdersPageVipPlus() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<Row[]>([]);
  const rowsRef = useRef<Row[]>([]); // <<< keep latest rows for handlers

  const [userId, setUserId] = useState<string | null>(null);

  // filters
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<'ALL' | UiStatus>('ALL');
  const [from, setFrom] = useState<string>('');
  const [to, setTo] = useState<string>('');

  // paging
  const [page, setPage] = useState(1);
  const pageSize = 8;

  // reviews
  const [reviewsByOrder, setReviewsByOrder] = useState<Record<string, Review | null>>({});
  const [reviewModal, setReviewModal] = useState<{
    mode: 'create' | 'edit';
    orderId: number;
    reviewId?: string;
    rating: number;
    comment: string;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // expanded cards
  const [openRow, setOpenRow] = useState<number | null>(null);

  // toasts
  const { push, ui: toastUI } = useToasts();

  function getToken(): string | null {
    try {
      return localStorage.getItem('authToken') ?? localStorage.getItem('accessToken');
    } catch {
      return null;
    }
  }
  function getUserId(): string | null {
    try {
      const cached = localStorage.getItem('userId');
      if (cached) return cached;
      const t = getToken();
      if (!t) return null;
      const [, payload] = t.split('.');
      const json = JSON.parse(atob(payload));
      const id = json?.id || json?.userId || json?.sub;
      if (id) localStorage.setItem('userId', id);
      return id ?? null;
    } catch {
      return null;
    }
  }

  async function prefetchReviews(orderIds: number[]) {
    const map: Record<string, Review | null> = {};
    await Promise.all(
      orderIds.map(async (oid) => {
        try {
          map[String(oid)] = await fetchReviewByOrder(oid);
        } catch {
          map[String(oid)] = null;
        }
      })
    );
    setReviewsByOrder((prev) => ({ ...prev, ...map }));
  }

  async function syncReviewsForCurrentOrders() {
    const ids = rowsRef.current.map((r) => r.orderId);
    if (ids.length) await prefetchReviews(ids);
  }

  async function load() {
    try {
      setLoading(true);
      const uid = getUserId();
      setUserId(uid);
      if (!uid) {
        setRows([]);
        rowsRef.current = [];
        return;
      }
      const token = getToken();
      const r = await fetch(`${API_BASE}/api/Order/user/${uid}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        cache: 'no-store',
      });
      if (!r.ok) throw new Error('Không tải được danh sách đơn hàng');
      const raw: unknown = await r.json();
      const list: ApiOrder[] = Array.isArray((raw as { data?: unknown })?.data)
        ? (raw as { data: ApiOrder[] }).data
        : Array.isArray(raw)
          ? (raw as ApiOrder[])
          : [];

      const out: Row[] = list
        .map(
          (o): Row => ({
            orderId: o.id,
            items: o.orderItems || [],
            itemsText: (o.orderItems || [])
              .map((it) => `${it.bookingName} x${it.quantity}`)
              .join(', '),
            totalVND: o.totalAmount,
            status: mapOrderStatus(o.status),
            orderDate: o.orderDate,
          })
        )
        .sort((a, b) => +new Date(b.orderDate) - +new Date(a.orderDate));

      setRows(out);
      rowsRef.current = out; // <<< keep latest

      // prefetch local reviews for current orders
      const uniqueOrderIds = Array.from(new Set(out.map((r2) => r2.orderId)));
      await prefetchReviews(uniqueOrderIds);
    } catch (e: unknown) {
      push('Lỗi tải đơn hàng', errMsg(e));
      setRows([]);
      rowsRef.current = [];
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();

    // reload orders when payment list may change
    const paymentsChanged = () => load();

    // reviews sync: cross-tab (storage) + same-tab (custom event)
    const onStorage = (ev: StorageEvent) => {
      if (ev.key === LS_REVIEWS) void syncReviewsForCurrentOrders();
    };
    const onReviewsChanged = () => {
      void syncReviewsForCurrentOrders();
    };

    window.addEventListener('payments:changed', paymentsChanged);
    window.addEventListener('storage', onStorage);
    window.addEventListener(EVT_REVIEWS_CHANGED, onReviewsChanged as EventListener);

    return () => {
      window.removeEventListener('payments:changed', paymentsChanged);
      window.removeEventListener('storage', onStorage);
      window.removeEventListener(EVT_REVIEWS_CHANGED, onReviewsChanged as EventListener);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    return rows
      .filter((r2) => (status === 'ALL' ? true : r2.status === status))
      .filter((r2) =>
        q ? (String(r2.orderId) + r2.itemsText).toLowerCase().includes(q.toLowerCase()) : true
      )
      .filter((r2) => {
        if (!from && !to) return true;
        const t = +new Date(r2.orderDate);
        const start = from ? +new Date(from) : -Infinity;
        const end = to ? +new Date(to) + 24 * 3600 * 1000 - 1 : Infinity;
        return t >= start && t <= end;
      });
  }, [rows, q, status, from, to]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);

  async function handleSubmitReview() {
    if (!reviewModal) return;
    setSubmitting(true);
    try {
      if (reviewModal.mode === 'create') {
        const created = await createReview({
          orderId: reviewModal.orderId,
          rating: reviewModal.rating,
          comment: reviewModal.comment.trim(),
        });
        setReviewsByOrder((m) => ({ ...m, [String(created.orderId)]: created }));
      } else {
        if (!reviewModal.reviewId) return;
        const updated = await updateReview(reviewModal.reviewId, {
          rating: reviewModal.rating,
          comment: reviewModal.comment.trim(),
        });
        setReviewsByOrder((m) => ({ ...m, [String(updated.orderId)]: updated }));
      }
      setReviewModal(null);
    } catch (e: unknown) {
      push('Lỗi', errMsg(e));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteReview(orderId: number) {
    const rv = reviewsByOrder[String(orderId)];
    if (!rv) return;
    if (!confirm('Xoá đánh giá này?')) return;
    try {
      await deleteReview(rv.id);
      setReviewsByOrder((m) => ({ ...m, [String(orderId)]: null }));
      push('Đã xoá đánh giá', `Order #${orderId}`);
    } catch (e: unknown) {
      push('Lỗi', errMsg(e));
    }
  }

  const totalSpent = useMemo(() => filtered.reduce((s, r) => s + r.totalVND, 0), [filtered]);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-10">
      {toastUI}
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-10 -mx-4 mb-6 bg-gradient-to-r from-sky-50/80 to-indigo-50/80 px-4 py-4 backdrop-blur supports-[backdrop-filter]:backdrop-blur-xl"
      >
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 inline-flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-sky-600/10 text-sky-600 ring-1 ring-sky-200">
              <CreditCard className="h-5 w-5" />
            </span>
            Đơn hàng của tôi
          </h1>
          <div className="text-[12px] text-slate-500">
            {userId ? (
              <>
                User: <span className="font-mono">{userId}</span>
              </>
            ) : (
              'Chế độ local demo'
            )}
          </div>
        </div>

        {/* Smart filter bar */}
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <div className="md:col-span-2 flex items-center rounded-2xl border border-slate-200 bg-white/70 px-3 shadow-sm">
            <Search className="mr-2 h-4 w-4 text-slate-400" />
            <input
              value={q}
              onChange={(e) => {
                setPage(1);
                setQ(e.target.value);
              }}
              placeholder="Tìm theo mã đơn, tên item…"
              className="h-10 w-full bg-transparent outline-none placeholder:text-slate-400"
            />
          </div>
          <select
            value={status}
            onChange={(e) => {
              setPage(1);
              setStatus(e.target.value as UiStatus | 'ALL');
            }}
            className="h-10 rounded-2xl border border-slate-200 bg-white/70 px-3 shadow-sm"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="Paid">Đã thanh toán</option>
            <option value="Pending">Đang xử lý</option>
            <option value="Failed">Thất bại/huỷ</option>
            <option value="Refunded">Hoàn tiền</option>
            <option value="Expired">Hết hạn</option>
            <option value="Other">Khác</option>
          </select>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              value={from}
              onChange={(e) => {
                setPage(1);
                setFrom(e.target.value);
              }}
              className="h-10 rounded-2xl border border-slate-200 bg-white/70 px-3 shadow-sm"
            />
            <input
              type="date"
              value={to}
              onChange={(e) => {
                setPage(1);
                setTo(e.target.value);
              }}
              className="h-10 rounded-2xl border border-slate-200 bg-white/70 px-3 shadow-sm"
            />
          </div>
        </div>

        {/* Sticky summary */}
        <div className="mt-3 grid grid-cols-2 gap-2 text-[12px] text-slate-600 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white/70 px-3 py-2 shadow-sm">
            Số đơn: <b>{filtered.length}</b>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white/70 px-3 py-2 shadow-sm">
            Tổng chi: <b>{fmtVND(totalSpent)}</b>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white/70 px-3 py-2 shadow-sm col-span-2 md:col-span-2">
            Khoảng thời gian: <b>{from || '—'}</b> → <b>{to || '—'}</b>
          </div>
        </div>
      </motion.div>

      {/* Actions */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <button
          onClick={load}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm hover:bg-slate-50"
        >
          <RefreshCw className="h-4 w-4" /> Làm mới
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <VipSkeleton />
      ) : filtered.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-4">
          <AnimatePresence mode="popLayout">
            {pageRows.map((r) => {
              const rv = reviewsByOrder[String(r.orderId)];
              const canReview = r.status === 'Paid' || r.status === 'Other';
              const expanded = openRow === r.orderId;
              return (
                <motion.div
                  key={r.orderId}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
                >
                  {/* Row header */}
                  <div className="grid grid-cols-12 items-center gap-3 px-4 py-3">
                    <div className="col-span-2 flex items-center gap-2">
                      <button
                        onClick={() => setOpenRow((o) => (o === r.orderId ? null : r.orderId))}
                        className="rounded-lg border border-slate-200 p-1 hover:bg-slate-50"
                        aria-label="Toggle items"
                      >
                        {expanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                      <div className="font-mono text-[12px] text-slate-600">#{r.orderId}</div>
                    </div>
                    <div
                      className="col-span-4 truncate text-[13px] text-slate-800"
                      title={r.itemsText}
                    >
                      {r.itemsText}
                    </div>
                    <div className="col-span-2 font-semibold">{fmtVND(r.totalVND)}</div>
                    <div className="col-span-2">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ring-1 ${pillClass(r.status)}`}
                      >
                        {pillIcon(r.status)} {r.status}
                      </span>
                    </div>
                    <div className="col-span-2 text-right text-[12px] text-slate-600">
                      {new Date(r.orderDate).toLocaleString('vi-VN')}
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="mx-4 h-px bg-slate-100" />

                  {/* Action bar */}
                  <div className="flex items-center justify-between px-4 py-2">
                    <div className="flex items-center gap-2 text-[12px] text-slate-500">
                      <Info className="h-4 w-4" /> {r.items.length} item(s)
                    </div>
                    <div className="flex items-center gap-2">
                      {rv ? (
                        <div className="flex items-center gap-2">
                          <StarRow value={rv.rating} />
                          <button
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm hover:bg-slate-50"
                            onClick={() =>
                              setReviewModal({
                                mode: 'edit',
                                orderId: rv.orderId,
                                reviewId: rv.id,
                                rating: rv.rating,
                                comment: rv.comment ?? '',
                              })
                            }
                            title="Sửa đánh giá"
                          >
                            <Pencil className="h-4 w-4" /> Sửa
                          </button>
                          <button
                            className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-white px-2 py-1 text-sm text-rose-600 hover:bg-rose-50"
                            onClick={() => handleDeleteReview(r.orderId)}
                            title="Xoá đánh giá"
                          >
                            <Trash2 className="h-4 w-4" /> Xoá
                          </button>
                        </div>
                      ) : (
                        <button
                          disabled={!canReview}
                          onClick={() =>
                            setReviewModal({
                              mode: 'create',
                              orderId: r.orderId,
                              rating: 5,
                              comment: '',
                            })
                          }
                          className={`rounded-xl px-3 py-1.5 text-sm font-medium shadow-sm transition ${
                            canReview
                              ? 'bg-sky-600 text-white hover:bg-sky-700'
                              : 'bg-slate-200 text-slate-600 cursor-not-allowed'
                          }`}
                        >
                          {canReview ? 'Đánh giá' : 'Chưa thể đánh giá'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expandable items */}
                  <AnimatePresence initial={false}>
                    {expanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-4 pb-4"
                      >
                        <div className="overflow-hidden rounded-2xl border border-slate-200">
                          <div className="grid grid-cols-12 bg-slate-50 px-3 py-2 text-[12px] font-semibold text-slate-700">
                            <div className="col-span-6">Sản phẩm</div>
                            <div className="col-span-2 text-right">Số lượng</div>
                            <div className="col-span-2 text-right">Đơn giá</div>
                            <div className="col-span-2 text-right">Thành tiền</div>
                          </div>
                          {r.items.map((it) => (
                            <div
                              key={it.id}
                              className="grid grid-cols-12 items-center border-t border-slate-100 px-3 py-2 text-[13px] text-slate-700"
                            >
                              <div
                                className="col-span-6 flex items-center gap-3 truncate"
                                title={it.bookingName}
                              >
                                <div className="grid h-8 w-8 place-items-center rounded-xl bg-slate-100 text-[12px] font-semibold text-slate-600">
                                  {it.bookingName.charAt(0).toUpperCase()}
                                </div>
                                <span className="truncate">{it.bookingName}</span>
                              </div>
                              <div className="col-span-2 text-right">{it.quantity}</div>
                              <div className="col-span-2 text-right">{fmtVND(it.price)}</div>
                              <div className="col-span-2 text-right font-medium">
                                {fmtVND(it.price * it.quantity)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Pagination */}
          {pageCount > 1 && (
            <div className="mt-4 flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm hover:bg-slate-50"
              >
                <ChevronLeft className="h-4 w-4" /> Trước
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: pageCount }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`h-8 w-8 rounded-xl text-sm ${
                      page === i + 1
                        ? 'bg-slate-900 text-white'
                        : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm hover:bg-slate-50"
              >
                Sau <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* REVIEW MODAL */}
      {reviewModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl"
          >
            <div className="bg-gradient-to-r from-sky-50 to-indigo-50 px-5 py-4">
              <div className="text-lg font-semibold text-slate-800">
                {reviewModal.mode === 'create' ? 'Đánh giá đơn hàng' : 'Sửa đánh giá'}
              </div>
              <div className="mt-1 text-[12px] text-slate-500">
                Order ID: <span className="font-mono">{reviewModal.orderId}</span>
              </div>
            </div>
            <div className="px-5 py-4">
              <div className="mb-4">
                <div className="mb-1 text-sm font-medium">Điểm đánh giá</div>
                <StarPicker
                  value={reviewModal.rating}
                  onChange={(v) => setReviewModal((m) => (m ? { ...m, rating: v } : m))}
                />
              </div>
              <div className="mb-2">
                <div className="mb-1 text-sm font-medium">Nhận xét</div>
                <textarea
                  rows={4}
                  value={reviewModal.comment}
                  onChange={(e) =>
                    setReviewModal((m) => (m ? { ...m, comment: e.target.value } : m))
                  }
                  className="w-full rounded-2xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-200"
                  placeholder="Cảm nhận của bạn…"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 px-5 pb-5">
              <button
                onClick={() => setReviewModal(null)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50"
                disabled={submitting}
              >
                Huỷ
              </button>
              <button
                onClick={handleSubmitReview}
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-sky-700"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />} Lưu
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

/* ====== Sub-components ====== */
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
function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          onClick={() => onChange(i)}
          type="button"
          className="p-1"
          aria-label={`Chọn ${i} sao`}
        >
          <Star
            className={`h-7 w-7 ${i <= value ? 'fill-amber-400 text-amber-400 drop-shadow' : 'text-slate-300'}`}
          />
        </button>
      ))}
      <span className="ml-2 text-sm text-slate-600">{value}/5</span>
    </div>
  );
}
function VipSkeleton() {
  return (
    <div className="grid gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="h-28 animate-pulse rounded-3xl bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100"
        />
      ))}
    </div>
  );
}
function EmptyState() {
  return (
    <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      <div className="mx-auto mb-3 grid h-16 w-16 place-items-center rounded-2xl bg-sky-50 text-sky-600 ring-1 ring-sky-100">
        <CreditCard className="h-8 w-8" />
      </div>
      <div className="text-lg font-semibold text-slate-800">Chưa có đơn hàng</div>
      <p className="mt-1 text-sm text-slate-500">
        Khi bạn đặt dịch vụ, đơn hàng sẽ hiển thị tại đây để theo dõi và đánh giá.
      </p>
    </div>
  );
}
