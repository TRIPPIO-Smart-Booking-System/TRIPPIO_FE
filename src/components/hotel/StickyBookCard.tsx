'use client';

import { useMemo } from 'react';

type Props = {
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  rooms: number;
  priceTotal?: number; // nếu đã chọn phòng
  onChange: (next: Partial<Omit<Props, 'onChange' | 'priceTotal'>>) => void;
  onCTA: () => void;
};

export default function StickyBookCard({
  checkIn,
  checkOut,
  adults,
  children,
  rooms,
  priceTotal,
  onChange,
  onCTA,
}: Props) {
  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    const a = new Date(checkIn).getTime();
    const b = new Date(checkOut).getTime();
    return Math.max(0, Math.round((b - a) / 86400000));
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
          />
        </Field>
        <Field label="Trả phòng">
          <input
            type="date"
            value={checkOut}
            onChange={(e) => onChange({ checkOut: e.target.value })}
            className="input"
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
            <Counter label="Trẻ em" value={children} onChange={(v) => onChange({ children: v })} />
            <Counter label="Phòng" value={rooms} min={1} onChange={(v) => onChange({ rooms: v })} />
          </div>
        </Field>
      </div>

      <div className="mt-3 rounded-xl bg-zinc-50 p-4 text-sm">
        <div className="flex items-center justify-between">
          <span>Số đêm</span>
          <span className="font-semibold">{nights}</span>
        </div>
        {priceTotal !== undefined && (
          <div className="mt-2 flex items-center justify-between">
            <span>Tổng tạm tính</span>
            <span className="text-lg font-bold">{priceTotal.toLocaleString('vi-VN')} ₫</span>
          </div>
        )}
      </div>

      <button
        onClick={onCTA}
        className="mt-4 h-11 w-full rounded-xl bg-blue-600 font-semibold text-white hover:bg-blue-700"
      >
        {priceTotal ? 'Đặt ngay' : 'Xem phòng còn trống'}
      </button>
    </aside>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
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
  return (
    <div className="flex items-center gap-1 rounded-lg border px-2 py-1">
      <span className="text-xs text-zinc-600">{label}</span>
      <button className="btn" onClick={() => onChange(Math.max(min, value - 1))}>
        −
      </button>
      <span className="w-6 text-center text-sm">{value}</span>
      <button className="btn" onClick={() => onChange(value + 1)}>
        +
      </button>
    </div>
  );
}

/** Tailwind helpers:
 * .input = h-10 w-full rounded-lg border px-3 outline-none focus:ring-2 focus:ring-blue-200
 * .btn   = h-6 w-6 rounded border text-sm leading-none hover:bg-zinc-50
 */
