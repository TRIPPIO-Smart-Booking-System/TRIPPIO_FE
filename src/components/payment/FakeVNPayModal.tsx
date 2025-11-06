/* eslint react/prop-types: 0 */
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { X, CheckCircle2, Timer, Wallet } from 'lucide-react';

type Props = {
  open: boolean;
  amountVnd: number; // số tiền VND
  orderId: string; // mã đơn để bạn đối soát
  onClose: () => void;
  onPaid: (info: { orderId: string; amountVnd: number }) => void; // giả lập “đã thanh toán”
  ttlSeconds?: number; // đếm ngược QR (mặc định 300s)
};

/** Modal QR “fake VNPay” */
export default function FakeVNPayModal({
  open,
  amountVnd,
  orderId,
  onClose,
  onPaid,
  ttlSeconds = 300,
}: Props) {
  const [qrUrl, setQrUrl] = useState<string>('');
  const [left, setLeft] = useState<number>(ttlSeconds);
  const timer = useRef<number | null>(null);

  // Payload tuỳ bạn quy ước.
  // Ở đây mình encode như 1 deep-link vnpay:// … để hiển thị đẹp.
  const payload = useMemo(() => {
    const p = new URLSearchParams({
      orderId,
      amount: String(amountVnd),
      note: 'FAKE_VNPAY_QR_TEST',
    });
    return `vnpay://pay?${p.toString()}`;
  }, [orderId, amountVnd]);

  useEffect(() => {
    let t: number | null = null;

    if (open) {
      // gen QR
      QRCode.toDataURL(payload, { width: 320, margin: 1 })
        .then(setQrUrl)
        .catch(() => setQrUrl(''));

      // countdown
      setLeft(ttlSeconds);
      t = window.setInterval(() => {
        setLeft((s) => (s > 0 ? s - 1 : 0));
      }, 1000);
    }

    return () => {
      if (t) window.clearInterval(t);
    };
  }, [open, payload, ttlSeconds]);

  if (!open) return null;

  const min = Math.floor(left / 60);
  const sec = String(left % 60).padStart(2, '0');
  const expired = left <= 0;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-[520px] overflow-hidden rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div className="flex items-center gap-2 text-sky-700">
            <Wallet className="h-5 w-5" />
            <span className="font-semibold">Thanh toán VNPay (FAKE)</span>
          </div>
          <button
            className="rounded-lg p-1 text-zinc-500 hover:bg-zinc-100"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4">
          <div className="text-sm text-zinc-600">
            Quét mã bằng app ngân hàng/VNPay để mô phỏng thanh toán. Đây là chế độ <b>giả lập</b> –
            không kết nối cổng thật.
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto]">
            {/* QR */}
            <div className="rounded-xl border bg-zinc-50 p-4">
              <div className="text-sm">Số tiền</div>
              <div className="text-2xl font-bold text-orange-600">
                {amountVnd.toLocaleString('vi-VN')} đ
              </div>

              <div className="mt-3 flex items-center justify-center">
                {qrUrl ? (
                  <img
                    src={qrUrl}
                    alt="VNPay QR"
                    className={`h-[280px] w-[280px] rounded-lg border bg-white p-2 ${
                      expired ? 'opacity-50' : ''
                    }`}
                  />
                ) : (
                  <div className="h-[280px] w-[280px] rounded-lg border bg-white" />
                )}
              </div>

              <div className="mt-3 text-center text-xs text-zinc-600 break-all">
                Payload: <code className="rounded bg-zinc-100 px-1 py-0.5">{payload}</code>
              </div>
            </div>

            {/* Sidebar */}
            <div className="rounded-xl border p-4 text-sm">
              <div className="flex items-center justify-between">
                <span>Mã đơn</span>
                <span className="font-medium">{orderId}</span>
              </div>
              <div className="mt-1 flex items-center justify-between">
                <span className="inline-flex items-center gap-1">
                  <Timer className="h-4 w-4" /> Hết hạn
                </span>
                <span className={`font-medium ${expired ? 'text-red-600' : ''}`}>
                  {min}:{sec}
                </span>
              </div>

              <div className="mt-4 space-y-2">
                <button
                  disabled={expired}
                  onClick={() => onPaid({ orderId, amountVnd })}
                  className={`flex w-full items-center justify-center gap-2 rounded-xl py-2 font-semibold text-white ${
                    expired
                      ? 'cursor-not-allowed bg-zinc-300'
                      : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  <CheckCircle2 className="h-5 w-5" />
                  Tôi đã thanh toán
                </button>

                <button
                  onClick={onClose}
                  className="w-full rounded-xl border py-2 font-medium text-zinc-700 hover:bg-zinc-50"
                >
                  Huỷ
                </button>

                <div className="mt-2 rounded-lg bg-zinc-50 p-2 text-[12px] text-zinc-600">
                  * Chế độ demo: bấm “Tôi đã thanh toán” để giả lập thành công (không trừ tiền).
                </div>
              </div>
            </div>
          </div>

          {/* Thẻ test gợi ý (tham khảo VNPay) */}
          <div className="mt-4 rounded-xl border p-3 text-xs">
            <div className="font-semibold">Thẻ test tham khảo (VNPay sandbox):</div>
            <ul className="mt-1 list-disc space-y-1 pl-4 text-zinc-700">
              <li>Ngân hàng: NCB</li>
              <li>Số thẻ: 9704198526191432198</li>
              <li>Tên: NGUYEN VAN A</li>
              <li>Phát hành: 07/15 • OTP: 123456</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
