'use client';

import { ApiShow, formatMoney } from '@/data/show.api';
import { useMemo, useState } from 'react';

export default function ShowBooking({
  show,
  currency = 'VND',
}: {
  show: ApiShow;
  currency?: 'VND' | 'USD';
}) {
  const [qty, setQty] = useState<number>(1);

  const max = Math.max(0, show.availableTickets);
  const total = useMemo(() => show.price * qty, [show.price, qty]);

  const dec = () => setQty((q) => Math.max(1, q - 1));
  const inc = () => setQty((q) => Math.min(max || 99, q + 1));

  return (
    <div className="rounded-2xl border bg-white shadow-sm p-4">
      <div className="text-sm text-zinc-600">Giá vé</div>
      <div className="text-2xl font-bold text-orange-600">{formatMoney(show.price, currency)}</div>

      <div className="mt-3 flex items-center justify-between rounded-xl bg-zinc-50 p-3">
        <span className="text-sm">Số lượng vé</span>
        <div className="flex items-center gap-2">
          <button
            onClick={dec}
            className="h-8 w-8 rounded border hover:bg-zinc-100"
            aria-label="Giảm"
          >
            −
          </button>
          <span className="w-8 text-center font-medium">{qty}</span>
          <button
            onClick={inc}
            className="h-8 w-8 rounded border hover:bg-zinc-100"
            aria-label="Tăng"
          >
            +
          </button>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-sm">
        <span>Tổng tiền</span>
        <span className="text-lg font-bold">{formatMoney(total, currency)}</span>
      </div>

      <button
        className="mt-4 h-11 w-full rounded-xl bg-blue-600 font-semibold text-white hover:bg-blue-700"
        onClick={() => {
          // TODO: gọi API đặt vé khi backend có endpoint Booking
          alert(
            `Đặt thành công ${qty} vé cho "${show.name}"\nTổng: ${formatMoney(total, currency)}`
          );
        }}
      >
        Đặt vé ngay
      </button>

      <p className="mt-2 text-center text-xs text-zinc-500">
        * Vé điện tử sẽ được gửi qua email/số điện thoại.
      </p>
    </div>
  );
}
