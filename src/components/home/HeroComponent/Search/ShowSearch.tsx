// /src/components/home/HeroComponent/Search/ShowSearch.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import Counter from '../Counter';

// ---------- Icons ----------
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
const TicketsIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
  >
    <path d="M2 9a2 2 0 0 1 2-2h6l2-2h8a2 2 0 0 1 2 2v3a2 2 0 1 0 0 4v3a2 2 0 0 1-2 2H12l-2 2H4a2 2 0 0 1-2-2v-3a2 2 0 1 0 0-4V9z" />
  </svg>
);
const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <path d="M21 21l-3.6-3.6" />
  </svg>
);

// ---------- Utils ----------
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

type Guests = { adults: number; children: number };

// ✅ Hook không dùng RefObject: nhận trực tiếp element (HTMLElement | null)
function useOutsideCloseEl<T extends HTMLElement>(el: T | null, onClose: () => void) {
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
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
  }, [el, onClose]);
}

function todayStr() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// ---------- Tickets dropdown ----------
function TicketsDropdown({ value, onChange }: { value: Guests; onChange: (v: Guests) => void }) {
  const [open, setOpen] = useState(false);
  const [el, setEl] = useState<HTMLDivElement | null>(null); // callback ref
  useOutsideCloseEl(el, () => setOpen(false));

  const summary = `${value.adults} người lớn · ${value.children} trẻ em`;

  return (
    <div className="relative" ref={setEl}>
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
        <TicketsIcon />
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

// ---------- Main ----------
export default function ShowSearch() {
  const router = useRouter();

  const [city, setCity] = useState('');
  const [date, setDate] = useState(todayStr());
  const [guests, setGuests] = useState<Guests>({ adults: 2, children: 0 });
  const [currency, setCurrency] = useState<'VND' | 'USD'>('VND');

  const canSearch = Boolean(city) && Boolean(date);

  const submit = () => {
    const q = new URLSearchParams({
      city: city.trim(),
      date,
      adults: String(guests.adults),
      children: String(guests.children),
      currency,
    });
    router.push(`/show?${q.toString()}`);
  };

  return (
    <div className="w-full text-slate-900">
      <div
        className={clsx(
          'rounded-3xl border border-teal-200/40 bg-white/80 p-3 shadow-sm backdrop-blur',
          // sửa cảnh báo Tailwind
          'supports-backdrop-filter:bg-white/70'
        )}
      >
        <div className="grid items-end gap-3 md:grid-cols-12">
          {/* City */}
          <div className="min-w-0 md:col-span-4">
            <label className="mb-1 block text-xs text-slate-700">Thành phố</label>
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

          {/* Date */}
          <div className="min-w-0 md:col-span-4">
            <label className="mb-1 block text-xs text-slate-700">Ngày xem show</label>
            <div className="flex items-center rounded-3xl border bg-white px-3 py-2 text-slate-900 shadow-sm">
              <CalendarIcon />
              <input
                type="date"
                className="ml-2 h-10 min-w-0 flex-1 bg-transparent outline-none"
                value={date}
                min={todayStr()}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          {/* Tickets */}
          <div className="min-w-0 md:col-span-2">
            <label className="mb-1 block text-xs text-slate-700">Số vé</label>
            <TicketsDropdown value={guests} onChange={setGuests} />
          </div>

          {/* Currency */}
          <div className="min-w-0 md:col-span-1">
            <label className="mb-1 block text-xs text-slate-700">Tiền tệ</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as 'VND' | 'USD')}
              className="h-12 w-full rounded-3xl border border-slate-200 bg-white px-3 outline-none"
            >
              <option value="VND">VND</option>
              <option value="USD">USD</option>
            </select>
          </div>

          {/* Search */}
          <div className="min-w-0 md:col-span-1">
            <label className="mb-1 block text-xs opacity-0">Tìm</label>
            <button
              onClick={submit}
              disabled={!canSearch}
              className={clsx(
                'inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-orange-500 px-4 font-semibold text-white shadow',
                'hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50'
              )}
              title="Tìm show"
            >
              <SearchIcon />
              <span className="hidden sm:inline">Tìm show</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
