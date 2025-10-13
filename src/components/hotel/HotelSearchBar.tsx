'use client';

import { useMemo, useState } from 'react';

export const VIETNAM_PROVINCES = [
  'Hà Nội',
  'Hồ Chí Minh',
  'Đà Nẵng',
  'Hải Phòng',
  'Cần Thơ',
  'An Giang',
  'Bà Rịa - Vũng Tàu',
  'Bạc Liêu',
  'Bắc Giang',
  'Bắc Kạn',
  'Bắc Ninh',
  'Bến Tre',
  'Bình Dương',
  'Bình Định',
  'Bình Phước',
  'Bình Thuận',
  'Cà Mau',
  'Cao Bằng',
  'Đắk Lắk',
  'Đắk Nông',
  'Điện Biên',
  'Đồng Nai',
  'Đồng Tháp',
  'Gia Lai',
  'Hà Giang',
  'Hà Nam',
  'Hà Tĩnh',
  'Hải Dương',
  'Hậu Giang',
  'Hòa Bình',
  'Hưng Yên',
  'Khánh Hòa',
  'Kiên Giang',
  'Kon Tum',
  'Lai Châu',
  'Lâm Đồng',
  'Lạng Sơn',
  'Lào Cai',
  'Long An',
  'Nam Định',
  'Nghệ An',
  'Ninh Bình',
  'Ninh Thuận',
  'Phú Thọ',
  'Phú Yên',
  'Quảng Bình',
  'Quảng Nam',
  'Quảng Ngãi',
  'Quảng Ninh',
  'Quảng Trị',
  'Sóc Trăng',
  'Sơn La',
  'Tây Ninh',
  'Thái Bình',
  'Thái Nguyên',
  'Thanh Hóa',
  'Thừa Thiên Huế',
  'Tiền Giang',
  'Trà Vinh',
  'Tuyên Quang',
  'Vĩnh Long',
  'Vĩnh Phúc',
  'Yên Bái',
] as const;

export type HotelSearchQuery = {
  city: string; // rỗng = tất cả
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  rooms: number;
};

type Props = {
  initial?: Partial<HotelSearchQuery>;
  onSearch: (q: HotelSearchQuery) => void;
  className?: string;
  /** Bản đồ số lượng KS theo city, ví dụ { "Đà Nẵng": 5, "Hà Nội": 12 } */
  cityCounts?: Record<string, number>;
  /** Disable các tỉnh có count = 0 (mặc định true) */
  disableZero?: boolean;
};

export default function HotelSearchBar({
  initial,
  onSearch,
  className = '',
  cityCounts = {},
  disableZero = true,
}: Props) {
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const tomorrow = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  }, []);

  const [city, setCity] = useState(initial?.city ?? '');
  const [checkIn, setCheckIn] = useState(initial?.checkIn ?? today);
  const [checkOut, setCheckOut] = useState(initial?.checkOut ?? tomorrow);
  const [adults, setAdults] = useState(initial?.adults ?? 2);
  const [children, setChildren] = useState(initial?.children ?? 0);
  const [rooms, setRooms] = useState(initial?.rooms ?? 1);
  const [openGuests, setOpenGuests] = useState(false);

  const submit = () => onSearch({ city: city.trim(), checkIn, checkOut, adults, children, rooms });

  // Merge 63 tỉnh với count (mặc định 0), sort theo count desc rồi tên
  const citiesWithCount = useMemo(() => {
    const entries = VIETNAM_PROVINCES.map((p) => [p, cityCounts[p] ?? 0] as const);
    return entries.sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  }, [cityCounts]);

  return (
    <div
      className={`flex flex-col gap-2 rounded-2xl bg-white p-3 shadow-lg md:flex-row ${className}`}
    >
      {/* Province/City dropdown (kèm count) */}
      <Field label="Tỉnh/Thành phố">
        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="h-12 w-full rounded-xl border px-3 text-sm outline-none focus:ring-2 focus:ring-blue-200"
        >
          <option value="">Tất cả địa điểm</option>
          {citiesWithCount.map(([name, count]) => (
            <option key={name} value={name} disabled={disableZero && count === 0}>
              {name}
              {count ? ` (${count})` : ''}
            </option>
          ))}
        </select>
      </Field>

      {/* Dates */}
      <Field label="Ngày nhận / trả phòng">
        <div className="flex h-12 items-center gap-2">
          <input
            type="date"
            value={checkIn}
            min={today}
            onChange={(e) => {
              setCheckIn(e.target.value);
              if (e.target.value >= checkOut) {
                const d = new Date(e.target.value);
                d.setDate(d.getDate() + 1);
                setCheckOut(d.toISOString().slice(0, 10));
              }
            }}
            className="h-12 flex-1 rounded-xl border px-3 outline-none focus:ring-2 focus:ring-blue-200"
          />
          <span className="px-1 text-zinc-500">—</span>
          <input
            type="date"
            value={checkOut}
            min={checkIn}
            onChange={(e) => setCheckOut(e.target.value)}
            className="h-12 flex-1 rounded-xl border px-3 outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>
      </Field>

      {/* Guests & rooms */}
      <div className="relative flex-1">
        <Field label="Khách & phòng">
          <button
            type="button"
            onClick={() => setOpenGuests((s) => !s)}
            className="flex h-12 w-full items-center justify-between rounded-xl border px-3 text-left outline-none focus:ring-2 focus:ring-blue-200"
          >
            <span className="truncate text-sm">
              {adults} người lớn{children ? `, ${children} trẻ em` : ''}, {rooms} phòng
            </span>
            <svg
              className={`h-5 w-5 transition ${openGuests ? 'rotate-180' : ''}`}
              viewBox="0 0 24 24"
            >
              <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" fill="none" />
            </svg>
          </button>
        </Field>

        {openGuests && (
          <div className="absolute z-20 mt-1 w-full rounded-xl border bg-white p-3 shadow-lg">
            <Counter label="Người lớn" value={adults} min={1} onChange={setAdults} />
            <Counter label="Trẻ em" value={children} min={0} onChange={setChildren} />
            <Counter label="Phòng" value={rooms} min={1} onChange={setRooms} />
            <div className="mt-2 flex justify-end">
              <button
                onClick={() => setOpenGuests(false)}
                className="rounded-lg px-3 py-2 text-sm text-blue-600 hover:bg-blue-50"
              >
                Xong
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Submit */}
      <div className="flex items-end">
        <button
          onClick={submit}
          className="h-12 w-full whitespace-nowrap rounded-xl bg-blue-600 px-5 font-semibold text-white hover:bg-blue-700 md:w-auto"
        >
          Tìm kiếm
        </button>
      </div>
    </div>
  );
}

/* Helpers */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex-1">
      <div className="mb-1 text-xs text-zinc-600">{label}</div>
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
    <div className="mb-2 flex items-center justify-between rounded-lg border px-2 py-1">
      <span className="text-sm">{label}</span>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onChange(Math.max(min, value - 1))}
          className="h-8 w-8 rounded border hover:bg-zinc-50"
        >
          −
        </button>
        <span className="w-6 text-center text-sm">{value}</span>
        <button
          onClick={() => onChange(value + 1)}
          className="h-8 w-8 rounded border hover:bg-zinc-50"
        >
          +
        </button>
      </div>
    </div>
  );
}
