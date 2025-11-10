/* eslint react/prop-types: 0 */
'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { X, Loader2, Timer, ShieldCheck, CreditCard, CheckCircle2, RefreshCw } from 'lucide-react';
import { getAccessToken } from '@/lib/auth';

type Props = {
  open: boolean;
  onClose: () => void;

  totalVND: number;

  userId?: string | null;
  buyerName?: string;
  buyerEmail?: string;
  buyerPhone?: string;

  /** POST /api/Checkout/start */
  createUrlEndpoint: string;

  /** Endpoint kiểm tra trạng thái: GET ?orderCode=&paymentLinkId= */
  statusEndpoint?: string;

  onPaid?: (info: { orderId: number | string; orderCode: number; paymentLinkId?: string }) => void;
  onFailed?: (info: {
    status: string;
    orderCode?: number | null;
    paymentLinkId?: string | null;
  }) => void;

  /** Không gửi lên /start (theo spec) – chỉ dùng nội bộ app */
  orderId?: string | number;
  pollIntervalMs?: number;
};

type StartCheckoutResp = {
  code?: number;
  message?: string;
  data?: {
    checkoutUrl?: string;
    orderCode?: number;
    qrCode?: string;
    paymentLinkId?: string;
    status?: string;
  };
};

type StatusResp = {
  code?: number;
  message?: string;
  data?: {
    status: string;
    orderId?: number | string;
    orderCode?: number;
    paymentLinkId?: string;
  };
};

const PAID_SET = new Set([
  'PAID',
  'SUCCESS',
  'SUCCEEDED',
  'COMPLETED',
  'APPROVED',
  '00',
  'CAPTURED',
]);
const FAIL_SET = new Set([
  'CANCELLED',
  'CANCELED',
  'FAILED',
  'VOIDED',
  'EXPIRED',
  '01',
  'PAYMENT_CANCELLED',
]);

const fmtVND = (n: number) =>
  (n || 0).toLocaleString('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  });

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function toMessage(err: unknown, fallback = 'Unknown error'): string {
  if (err instanceof Error && err.message) return err.message;
  try {
    const s = String(err);
    return s && s !== '[object Object]' ? s : fallback;
  } catch {
    return fallback;
  }
}

export default function PaymentModal({
  open,
  onClose,
  totalVND,
  userId,
  buyerName,
  buyerEmail,
  buyerPhone,
  createUrlEndpoint,
  statusEndpoint,
  onPaid,
  onFailed,
  orderId,
  pollIntervalMs = 3000,
}: Props) {
  const amountVND = useMemo(() => Math.max(0, Math.round(totalVND || 0)), [totalVND]);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [orderCode, setOrderCode] = useState<number | null>(null);
  const [paymentUrl, setPaymentUrl] = useState('');
  const [paymentLinkId, setPaymentLinkId] = useState<string | null>(null);
  const [qrRaw, setQrRaw] = useState('');
  const [qrImg, setQrImg] = useState<string>('');
  const [status, setStatus] = useState<string | null>(null);

  // countdown 5 phút
  const [left, setLeft] = useState(300);
  const expired = left <= 0;
  const mm = Math.floor(left / 60).toString();
  const ss = (left % 60).toString().padStart(2, '0');
  const progress = ((300 - Math.max(0, left)) / 300) * 100;

  const secondTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const firedRef = useRef(false);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => void (document.body.style.overflow = prev);
  }, [open]);

  const tryMakeQrDataUrl = useCallback(async (payload: string): Promise<string> => {
    const text = String(payload ?? '').trim();
    if (!text) throw new Error('QR payload is empty');
    if (text.startsWith('data:image/')) return text;
    return QRCode.toDataURL(text, { width: 320, margin: 1, errorCorrectionLevel: 'M' });
  }, []);

  const clearAllTimers = useCallback(() => {
    if (secondTimerRef.current) {
      clearInterval(secondTimerRef.current);
      secondTimerRef.current = null;
    }
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  // ---- Kiểm tra trạng thái (thử path rồi fallback query) ----
  const pollStatusOnce = useCallback(
    async (oCode: number, isManualCheck = false) => {
      if (!statusEndpoint) return;
      try {
        if (isManualCheck) {
          setChecking(true);
          setErr(null);
          setSuccessMsg(null);
        }
        const token =
          getAccessToken() ||
          (typeof window !== 'undefined' ? (localStorage.getItem('accessToken') ?? '') : '');

        // path style: /status/{orderCode}?paymentLinkId=...
        const pathUrl =
          `${statusEndpoint}`.replace(/\/$/, '') +
          `/${encodeURIComponent(String(oCode))}` +
          (paymentLinkId ? `?paymentLinkId=${encodeURIComponent(paymentLinkId)}` : '');

        let r = await fetch(pathUrl, {
          headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          credentials: 'include',
          cache: 'no-store',
        });

        if (r.status === 404) {
          // query style: /status?orderCode=...&paymentLinkId=...
          const qs = new URLSearchParams({ orderCode: String(oCode) });
          if (paymentLinkId) qs.set('paymentLinkId', paymentLinkId);
          r = await fetch(`${statusEndpoint}?${qs.toString()}`, {
            headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
            credentials: 'include',
            cache: 'no-store',
          });
        }

        if (!r.ok) {
          let detail = '';
          try {
            detail = await r.text();
          } catch {}
          if (isManualCheck)
            throw new Error(
              `Không thể kiểm tra trạng thái: HTTP ${r.status}${detail ? ` — ${detail}` : ''}`
            );
          return;
        }

        const js = (await r.json()) as StatusResp;
        const st = (js?.data?.status || js?.message || '').toUpperCase();
        if (!st) {
          if (isManualCheck) throw new Error('Không nhận được trạng thái thanh toán');
          return;
        }

        setStatus(st);

        if (PAID_SET.has(st)) {
          if (!firedRef.current) {
            firedRef.current = true;
            clearAllTimers();
            setSuccessMsg('✅ Thanh toán thành công! Đang xử lý...');
            onPaid?.({
              orderId: js?.data?.orderId ?? orderId ?? oCode,
              orderCode: js?.data?.orderCode ?? oCode,
              paymentLinkId: js?.data?.paymentLinkId ?? paymentLinkId ?? undefined,
            });
          }
          return;
        }

        if (FAIL_SET.has(st)) {
          clearAllTimers();
          setErr('Thanh toán không thành công hoặc đã huỷ/hết hạn.');
          onFailed?.({ status: st, orderCode: oCode, paymentLinkId: paymentLinkId ?? null });
        } else if (isManualCheck) {
          setSuccessMsg('⏳ Thanh toán đang chờ xử lý. Vui lòng kiểm tra lại sau.');
        }
      } catch (error) {
        if (isManualCheck) setErr(toMessage(error, 'Không thể kiểm tra trạng thái thanh toán'));
      } finally {
        if (isManualCheck) setChecking(false);
      }
    },
    [statusEndpoint, paymentLinkId, clearAllTimers, onPaid, orderId, onFailed]
  );

  const startPolling = useCallback(
    (oCode: number) => {
      if (!statusEndpoint) return;
      void pollStatusOnce(oCode);
      pollTimerRef.current = setInterval(() => void pollStatusOnce(oCode), pollIntervalMs);
    },
    [statusEndpoint, pollStatusOnce, pollIntervalMs]
  );

  // focus về tab -> poll lại
  useEffect(() => {
    if (!open || !orderCode || !statusEndpoint) return;
    const onVis = () => {
      if (document.visibilityState === 'visible') void pollStatusOnce(orderCode);
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [open, orderCode, statusEndpoint, pollStatusOnce]);

  // mở modal -> gọi /start với body đúng spec
  useEffect(() => {
    if (!open) return;

    // reset
    setErr(null);
    setLoading(false);
    setChecking(false);
    setSuccessMsg(null);
    setOrderCode(null);
    setPaymentUrl('');
    setPaymentLinkId(null);
    setQrRaw('');
    setQrImg('');
    setStatus(null);
    setLeft(300);
    firedRef.current = false;
    clearAllTimers();

    (async () => {
      try {
        // Validate tối thiểu theo spec
        if (!userId || !UUID_RE.test(String(userId))) {
          throw new Error('Thiếu hoặc sai định dạng userId (yêu cầu GUID).');
        }
        if (!buyerName || !buyerEmail || !buyerPhone) {
          throw new Error('Thiếu buyerName/buyerEmail/buyerPhone.');
        }

        setLoading(true);
        const token =
          getAccessToken() ||
          (typeof window !== 'undefined' ? (localStorage.getItem('accessToken') ?? '') : '');

        // ---- body theo đúng hình: chỉ 5 field ----
        const body = {
          userId: String(userId),
          buyerName: String(buyerName),
          buyerEmail: String(buyerEmail),
          buyerPhone: String(buyerPhone),
          platform: 'payos',
        };

        const r = await fetch(createUrlEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          credentials: 'include',
          cache: 'no-store',
          body: JSON.stringify(body),
        });

        if (!r.ok) {
          let detail = '';
          try {
            detail = await r.text();
          } catch {}
          throw new Error(`Checkout start failed: HTTP ${r.status}${detail ? ` — ${detail}` : ''}`);
        }

        const data = (await r.json()) as StartCheckoutResp;
        if (data?.code && data.code !== 200) {
          throw new Error(data?.message || 'Checkout start failed');
        }

        const checkoutUrl = data?.data?.checkoutUrl || '';
        const rawVietQR = data?.data?.qrCode || '';
        const oc = data?.data?.orderCode ?? null;
        const plId = data?.data?.paymentLinkId ?? null;

        setPaymentUrl(checkoutUrl);
        setPaymentLinkId(plId);
        setOrderCode(oc);
        setStatus((data?.data?.status || 'PENDING').toUpperCase());
        setQrRaw(rawVietQR);

        // tạo QR
        let created = false;
        try {
          if (rawVietQR) {
            setQrImg(await tryMakeQrDataUrl(rawVietQR));
            created = true;
          }
        } catch {}
        if (!created && checkoutUrl) {
          try {
            setQrImg(await tryMakeQrDataUrl(checkoutUrl));
            created = true;
          } catch {}
        }
        if (!created) setErr('Không tạo được QR. Vui lòng bấm “Mở trang thanh toán PayOS”.');

        // timer & poll
        secondTimerRef.current = setInterval(() => setLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
        if (oc && statusEndpoint) startPolling(oc);
      } catch (e) {
        setErr(toMessage(e, 'Không khởi tạo được thanh toán'));
      } finally {
        setLoading(false);
      }
    })();

    return () => clearAllTimers();
  }, [
    open,
    createUrlEndpoint,
    statusEndpoint,
    userId,
    buyerName,
    buyerEmail,
    buyerPhone,
    clearAllTimers,
    tryMakeQrDataUrl,
    startPolling,
  ]);

  // hết hạn -> dừng poll
  useEffect(() => {
    if (!open) return;
    if (expired) {
      clearAllTimers();
      setStatus((s) => (s && !PAID_SET.has(s) ? 'EXPIRED' : s));
    }
  }, [expired, open, clearAllTimers]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/45 backdrop-blur-sm p-3">
      <div
        className="relative w-[min(960px,100vw-24px)] max-h-[92vh] overflow-hidden rounded-3xl border border-white/30 bg-white/95 shadow-2xl flex flex-col"
        style={{ scrollbarGutter: 'stable' }}
      >
        {/* HEADER */}
        <div className="relative border-b bg-gradient-to-r from-sky-50 to-teal-50">
          <div className="flex items-center justify-between px-5 py-3">
            <div className="flex items-center gap-2 text-slate-800">
              <CreditCard className="h-5 w-5 text-sky-600" />
              <span className="text-[15px] font-semibold">Thanh toán PayOS</span>
            </div>
            <button
              type="button"
              onClick={() => {
                clearAllTimers();
                onClose();
              }}
              className="rounded-full p-1.5 text-slate-500 transition hover:bg-slate-100"
              aria-label="Đóng"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="relative h-1 w-full bg-slate-100">
            <div
              className={`absolute left-0 top-0 h-1 rounded-r-full ${expired ? 'bg-red-500' : 'bg-emerald-500'}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* CONTENT */}
        <div className="flex-1 min-h-0 overflow-y-auto p-5">
          <div>
            <div className="text-[13px] text-slate-600">Số tiền hiển thị (ước tính):</div>
            <div className="mt-1 text-3xl font-extrabold text-emerald-600">{fmtVND(amountVND)}</div>
            {status && (
              <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-[12px] text-slate-700 ring-1 ring-slate-200">
                Trạng thái: <span className="font-semibold">{status}</span>
              </div>
            )}
          </div>

          <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[360px,1fr]">
            {/* QR */}
            <div className="rounded-2xl border bg-white/80 p-4 shadow-sm">
              <div className="flex items-center justify-center">
                {qrImg ? (
                  <img
                    src={qrImg}
                    alt="PayOS QR"
                    className={`h-[240px] w-[240px] rounded-xl border bg-white p-3 shadow-inner md:h-[280px] md:w-[280px] lg:h-[300px] lg:w-[300px] ${expired ? 'opacity-60' : ''}`}
                  />
                ) : (
                  <div className="flex h-[260px] w-[260px] items-center justify-center rounded-xl border bg-white lg:h-[300px] lg:w-[300px]">
                    {loading ? (
                      <span className="inline-flex items-center gap-2 text-slate-600">
                        <Loader2 className="h-4 w-4 animate-spin" /> Đang tạo QR…
                      </span>
                    ) : (
                      <span className="text-slate-400">Không tạo được QR</span>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-3 max-h-16 overflow-auto rounded-lg border bg-slate-50 px-3 py-2 text-[11px] leading-4 text-slate-600">
                <div className="font-medium text-slate-700">VietQR / URL Payload</div>
                <code className="block whitespace-pre-wrap break-all">
                  {qrRaw || paymentUrl || '(trống)'}
                </code>
              </div>
            </div>

            {/* RIGHT */}
            <div className="rounded-2xl border bg-white/80 p-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-[12px] text-slate-500">Mã đơn (orderCode)</div>
                  <div className="font-semibold text-slate-900">{orderCode ?? '—'}</div>
                </div>
                <div
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] ${
                    expired
                      ? 'bg-red-50 text-red-700 ring-1 ring-red-200'
                      : 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                  }`}
                >
                  <Timer className="h-3.5 w-3.5" />
                  {mm}:{ss}
                </div>
              </div>

              <div className="mt-3 space-y-2">
                {err && (
                  <div className="rounded-lg bg-red-50 px-3 py-2 text-[13px] text-red-700 ring-1 ring-red-200">
                    {err}
                  </div>
                )}
                {successMsg && (
                  <div className="rounded-lg bg-emerald-50 px-3 py-2 text-[13px] text-emerald-700 ring-1 ring-emerald-200 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                    <span>{successMsg}</span>
                  </div>
                )}
              </div>

              <div className="mt-3 space-y-2">
                <a
                  href={paymentUrl || '#'}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => {
                    if (!paymentUrl || expired) e.preventDefault();
                  }}
                  className={`block h-11 w-full rounded-xl text-center text-[15px] font-semibold leading-[44px] text-white transition ${
                    expired
                      ? 'cursor-not-allowed bg-slate-300'
                      : paymentUrl
                        ? 'bg-sky-600 hover:bg-sky-700'
                        : 'bg-sky-400'
                  }`}
                >
                  {paymentUrl ? 'Mở trang thanh toán PayOS' : 'Chưa có link PayOS'}
                </a>

                {!!(orderCode && statusEndpoint) && (
                  <button
                    type="button"
                    onClick={() => void pollStatusOnce(orderCode, true)}
                    disabled={checking || expired}
                    className={`h-10 w-full rounded-xl border text-[14px] font-medium transition flex items-center justify-center gap-2 ${
                      checking || expired
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {checking ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Đang kiểm tra...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4" />
                        Tôi đã thanh toán — kiểm tra trạng thái
                      </>
                    )}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    clearAllTimers();
                    onClose();
                  }}
                  className="h-10 w-full rounded-xl border bg-white text-[14px] font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Đóng
                </button>
              </div>

              <div className="mt-4 rounded-xl bg-slate-50 p-3 text-[12px] text-slate-600 ring-1 ring-slate-200">
                <div className="mb-1 inline-flex items-center gap-1 font-medium text-slate-700">
                  <ShieldCheck className="h-4 w-4" />
                  Lưu ý
                </div>
                <ul className="list-disc space-y-1 pl-5">
                  <li>Quét VietQR hoặc mở link PayOS để thanh toán.</li>
                  <li>Đơn hàng sẽ hết hạn sau 5 phút nếu chưa thanh toán.</li>
                </ul>
              </div>
            </div>
          </div>
          {/* end grid */}
        </div>
      </div>
    </div>
  );
}
