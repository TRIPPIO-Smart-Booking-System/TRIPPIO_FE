// /src/components/home/HeroComponent/Search/HotelSearch.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTodayTomorrow } from '../../searchHook/useTodayTomorrow';
import Counter from '../Counter';
import clsx from 'clsx';

// ---------------- Icons ----------------
const PinIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
  >
    <path d="M12 22s7-7.364 7-12a7 7 0 10-14 0c0 4.636 7 12 7 12z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);
const CalendarIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
  >
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M16 3v4M8 3v4M3 11h18" />
  </svg>
);
const UsersIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
  >
    <path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <path d="M21 21l-3.6-3.6" />
  </svg>
);

// ---------------- Data ----------------
type Option = { value: string; label: string };
const CITY_OPTIONS: Option[] = [
  { value: 'Da Nang', label: 'Đà Nẵng' },
  { value: 'Ha Noi', label: 'Hà Nội' },
  { value: 'Ho Chi Minh City', label: 'TP. Hồ Chí Minh' },
  { value: 'Nha Trang', label: 'Nha Trang' },
  { value: 'Da Lat', label: 'Đà Lạt' },
  { value: 'Hoi An', label: 'Hội An' },
  { value: 'Phu Quoc', label: 'Phú Quốc' },
];

type GuestsValue = { adults: number; children: number; rooms: number };

// ---------------- Utils ----------------
// ✅ Generic chuẩn: RefObject<T> đã mặc định .current là T | null, KHÔNG dùng T | null trong generic.
function useOutsideClose<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  onClose: () => void
) {
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      const el = ref.current;
      if (el && !el.contains(e.target as Node | null)) onClose();
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onEsc);
    };
  }, [onClose, ref]);
}

// ---------------- Guests dropdown ----------------
function GuestsRoomsDropdown({
  value,
  onChange,
}: {
  value: GuestsValue;
  onChange: (v: GuestsValue) => void;
}) {
  const [open, setOpen] = useState(false);
  // ❗ Quan trọng: KHÔNG dùng HTMLDivElement | null trong generic
  const ref = useRef<HTMLDivElement>(null);
  useOutsideClose(ref, () => setOpen(false));

  const summary = `${value.adults} người lớn · ${value.children} trẻ em · ${value.rooms} phòng`;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={clsx(
          'flex w-full items-center gap-2 rounded-3xl border border-slate-200 bg-white px-3 py-2 text-left text-slate-900',
          'hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-teal-200'
        )}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <UsersIcon />
        <span className="block truncate text-sm">{summary}</span>
        <span className="ml-auto text-slate-500">▾</span>
      </button>

      {open && (
        <div className="absolute right-0 z-40 mt-2 w-[min(92vw,22rem)] rounded-xl border bg-white p-3 text-slate-900 shadow-xl">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-slate-700">Người lớn</span>
              <Counter
                value={value.adults}
                min={1}
                onChange={(n) => onChange({ ...value, adults: n })}
              />
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-slate-700">Trẻ em</span>
              <Counter
                value={value.children}
                min={0}
                onChange={(n) => onChange({ ...value, children: n })}
              />
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-slate-700">Phòng</span>
              <Counter
                value={value.rooms}
                min={1}
                onChange={(n) => onChange({ ...value, rooms: n })}
              />
            </div>
            <button
              onClick={() => setOpen(false)}
              className="mt-1 h-10 w-full rounded-lg bg-teal-600 text-sm font-semibold text-white hover:bg-teal-700"
            >
              Xong
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------- Main ----------------
export default function HotelSearch() {
  const router = useRouter();
  const { today, tomorrow } = useTodayTomorrow();

  const [city, setCity] = useState('');
  const [checkIn, setCheckIn] = useState(today);
  const [checkOut, setCheckOut] = useState(tomorrow);
  const [guests, setGuests] = useState<GuestsValue>({ adults: 2, children: 0, rooms: 1 });

  const submitHotel = () => {
    const q = new URLSearchParams({
      city: city.trim(),
      checkIn,
      checkOut,
      adults: String(guests.adults),
      children: String(guests.children),
      rooms: String(guests.rooms),
    });
    router.push(`/hotel?${q.toString()}`);
  };

  const canSearch = Boolean(city) && checkIn < checkOut;

  return (
    <div className="w-full text-slate-900">
      {/* Container with soft tint & glass */}
      <div
        className={clsx(
          'rounded-3xl border border-teal-200/40 bg-white/80 p-3 shadow-sm backdrop-blur',
          // ✅ Theo gợi ý Tailwind (tránh cảnh báo)
          'supports-backdrop-filter:bg-white/70'
        )}
      >
        <div className="grid items-end gap-3 md:grid-cols-12">
          {/* City */}
          <div className="min-w-0 md:col-span-4">
            <label className="mb-1 block text-xs text-slate-700">Thành phố / Khách sạn</label>
            <div className="flex h-12 items-center rounded-3xl border bg-white px-3 text-slate-900 shadow-sm">
              <PinIcon />
              <select
                className="ml-2 h-10 min-w-0 flex-1 bg-transparent outline-none"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              >
                <option value="">Chọn điểm đến…</option>
                {CITY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Dates */}
          <div className="min-w-0 md:col-span-5">
            <label className="mb-1 block text-xs text-slate-700">Ngày nhận phòng · trả phòng</label>
            <div className="flex items-center rounded-3xl border bg-white px-3 py-2 text-slate-900 shadow-sm">
              <CalendarIcon />
              <input
                type="date"
                className="ml-2 h-10 min-w-0 flex-1 bg-transparent outline-none"
                value={checkIn}
                min={today}
                onChange={(e) => {
                  const v = e.target.value;
                  setCheckIn(v);
                  if (v >= checkOut) {
                    const d = new Date(v);
                    d.setDate(d.getDate() + 1);
                    setCheckOut(d.toISOString().split('T')[0]);
                  }
                }}
              />
              <div className="mx-3 h-6 w-px bg-slate-200" />
              <CalendarIcon />
              <input
                type="date"
                className="ml-2 h-10 min-w-0 flex-1 bg-transparent outline-none"
                value={checkOut}
                min={checkIn}
                onChange={(e) => setCheckOut(e.target.value)}
              />
            </div>
          </div>

          {/* Guests */}
          <div className="min-w-0 md:col-span-2">
            <label className="mb-1 block text-xs text-slate-700">Khách & Phòng</label>
            <GuestsRoomsDropdown value={guests} onChange={setGuests} />
          </div>

          {/* Search */}
          <div className="min-w-0 md:col-span-1">
            <label className="mb-1 block text-xs opacity-0">Tìm</label>
            <button
              onClick={submitHotel}
              disabled={!canSearch}
              className={clsx(
                'inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-orange-500 px-4 font-semibold text-white shadow',
                'hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50'
              )}
              title="Tìm khách sạn"
            >
              <SearchIcon />
              <span className="hidden sm:inline">Tìm kiếm</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
