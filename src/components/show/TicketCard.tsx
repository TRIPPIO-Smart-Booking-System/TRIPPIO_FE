// components/TicketCard.tsx
import React from 'react';

type Props = {
  title: string;
  start: string; // "19:30 CN, 15/12/2024 — 21:00 CN, 15/12/2024"
  location: string; // "Saigon Opera House, 7 Lam Son Square, Ho Chi Minh City"
  price: number; // 25
  currency?: string; // "đ"
  remaining: number; // 80
  isOpen: boolean; // còn mở đặt vé?
};

export default function TicketCard({
  title,
  start,
  location,
  price,
  currency = 'đ',
  remaining,
  isOpen,
}: Props) {
  const [openQty, setOpenQty] = React.useState(false);
  const [qty, setQty] = React.useState(1);

  const canDecrement = qty > 1;

  return (
    <div className="group relative flex flex-col rounded-3xl overflow-hidden border border-slate-200 bg-white shadow-sm hover:shadow-xl transition-all duration-300">
      {/* Header gradient + badges */}
      <div className="relative h-28 bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400">
        <div className="absolute left-4 top-4 text-xs font-semibold text-slate-800 bg-white/90 rounded-full px-2 py-1 shadow">
          {price} {currency}/vé
        </div>
        <div className="absolute right-4 top-4 text-xs font-semibold text-slate-700 bg-white/90 rounded-full px-2 py-1 shadow">
          🎟️ {remaining} vé còn
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col gap-3 p-5">
        <h3 className="text-xl font-semibold text-slate-900">{title}</h3>

        <div className="space-y-2 text-sm text-slate-600">
          <div className="flex items-start gap-2">
            <span className="mt-0.5">🕒</span>
            <span className="leading-snug">{start}</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="mt-0.5">📍</span>
            <span className="leading-snug">{location}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-2 flex flex-col gap-3">
          {isOpen ? (
            <>
              <button
                onClick={() => setOpenQty((v) => !v)}
                className="self-start rounded-full bg-orange-500 text-white font-semibold px-4 py-2 hover:bg-orange-600 active:scale-[0.99] transition"
              >
                Đặt vé
              </button>

              {/* Collapsible quantity */}
              {openQty && (
                <div className="rounded-2xl border border-slate-200 p-4">
                  <div className="text-sm text-slate-500 mb-1">Giá vé</div>
                  <div className="text-2xl font-bold text-slate-900">
                    {price} {currency}
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <span className="text-sm text-slate-600">Số lượng vé</span>
                    <div className="inline-flex items-center rounded-full border border-slate-200 overflow-hidden">
                      <button
                        onClick={() => canDecrement && setQty(qty - 1)}
                        disabled={!canDecrement}
                        className="px-3 py-2 disabled:opacity-40"
                        aria-label="Giảm"
                      >
                        –
                      </button>
                      <span className="px-3 py-2 min-w-8 text-center font-medium">{qty}</span>
                      <button
                        onClick={() => setQty(qty + 1)}
                        className="px-3 py-2"
                        aria-label="Tăng"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm text-slate-600">Tổng tiền</span>
                    <span className="text-lg font-semibold text-slate-900">
                      {price * qty} {currency}
                    </span>
                  </div>

                  <button
                    className="mt-4 w-full rounded-xl bg-blue-600 text-white font-semibold py-3 hover:bg-blue-700 transition"
                    onClick={() => {
                      // TODO: handle booking
                      alert(`Đặt ${qty} vé • ${title}`);
                    }}
                  >
                    Đặt vé ngay
                  </button>

                  <p className="mt-2 text-xs text-slate-400">
                    * Vé điện tử sẽ được gửi qua email/số điện thoại.
                  </p>
                </div>
              )}
            </>
          ) : (
            <button
              className="self-start rounded-full bg-slate-200 text-slate-600 font-semibold px-4 py-2 cursor-not-allowed"
              disabled
            >
              Đóng đặt vé
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
