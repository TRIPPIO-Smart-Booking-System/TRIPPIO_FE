'use client';

import { useMemo, type ReactNode } from 'react';

type Props = {
  checkIn: string;
  checkOut: string;
  adults: number;
  childGuests: number; // ← renamed from `children`
  rooms: number;
  /** Tổng tiền (nếu đã chọn phòng) */
  priceTotal?: number;
  onChange: (next: Partial<Omit<Props, 'onChange' | 'priceTotal'>>) => void;
  onCTA: () => void;
};

export default function StickyBookCard({
  checkIn,
  checkOut,
  adults,
  childGuests,
  rooms,
  priceTotal,
  onChange,
  onCTA,
}: Props) {
  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    const a = new Date(checkIn).getTime();
    const b = new Date(checkOut).getTime();
    return Math.max(0, Math.round((b - a) / 86_400_000));
  }, [checkIn, checkOut]);

  return (
    <aside className="sticky top-24 rounded-2xl border bg-white p-5 shadow-sm">
      <h3 className="text-lg font-semibold">Đặt phòng</h3>

      <div className="mt-3 space-y-2">
        <Field label="Nhận phòng">
          <input
            type="date"
            value={checkIn}
            onChange={(e) => onChange({ checkIn: e.target.value })}
            className="input"
            aria-label="Ngày nhận phòng"
          />
        </Field>

        <Field label="Trả phòng">
          <input
            type="date"
            value={checkOut}
            onChange={(e) => onChange({ checkOut: e.target.value })}
            className="input"
            aria-label="Ngày trả phòng"
          />
        </Field>

        <Field label="Khách / Phòng">
          <div className="flex items-center gap-2">
            <Counter
              label="Người lớn"
              value={adults}
              min={1}
              onChange={(v) => onChange({ adults: v })}
            />
            <Counter
              label="Trẻ em"
              value={childGuests}
              min={0}
              onChange={(v) => onChange({ childGuests: v })}
            />
            <Counter label="Phòng" value={rooms} min={1} onChange={(v) => onChange({ rooms: v })} />
          </div>
        </Field>
      </div>

      <div className="mt-3 rounded-xl bg-zinc-50 p-4 text-sm">
        <div className="flex items-center justify-between">
          <span>Số đêm</span>
          <span className="font-semibold">{nights}</span>
        </div>

        {priceTotal != null && (
          <div className="mt-2 flex items-center justify-between">
            <span>Tổng tạm tính</span>
            <span className="text-lg font-bold">{priceTotal.toLocaleString('vi-VN')} ₫</span>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={onCTA}
        className="mt-4 h-11 w-full rounded-xl bg-blue-600 font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
        aria-label={priceTotal != null ? 'Đặt ngay' : 'Xem phòng còn trống'}
      >
        {priceTotal != null ? 'Đặt ngay' : 'Xem phòng còn trống'}
      </button>
    </aside>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <div className="mb-1 text-xs font-medium text-zinc-600">{label}</div>
      {children}
    </div>
  );
}

function Counter({
  label,
  value,
  onChange,
  min = 0,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
}) {
  const dec = () => onChange(Math.max(min, value - 1));
  const inc = () => onChange(value + 1);

  return (
    <div className="flex items-center gap-1 rounded-lg border px-2 py-1">
      <span className="text-xs text-zinc-600">{label}</span>
      <button type="button" className="btn" onClick={dec} aria-label={`Giảm ${label}`}>
        −
      </button>
      <span className="w-6 text-center text-sm" aria-live="polite">
        {value}
      </span>
      <button type="button" className="btn" onClick={inc} aria-label={`Tăng ${label}`}>
        +
      </button>
    </div>
  );
}

/** Tailwind helpers (gợi ý):
 * .input = h-10 w-full rounded-lg border px-3 outline-none focus:ring-2 focus:ring-blue-200
 * .btn   = h-6 w-6 rounded border text-sm leading-none hover:bg-zinc-50
 */
