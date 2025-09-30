'use client';

import { useState, useRef, useEffect } from 'react';
import clsx from 'clsx';

type TabKey = 'hotel' | 'flight' | 'transfer' | 'car' | 'activity';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'hotel', label: 'Khách sạn' },
  { key: 'flight', label: 'Vé máy bay' },
  { key: 'transfer', label: 'Đưa đón sân bay' },
  { key: 'car', label: 'Cho thuê xe' },
  { key: 'activity', label: 'Hoạt động' },
];

export default function ExploreSearchCard() {
  const [tab, setTab] = useState<TabKey>('hotel');

  const [location, setLocation] = useState('Hà Nội');
  const [checkIn, setCheckIn] = useState<string>('');
  const [checkOut, setCheckOut] = useState<string>('');
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(2);

  // dropdown “Guest”
  const [openGuest, setOpenGuest] = useState(false);
  const guestRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      if (!guestRef.current?.contains(e.target as Node)) setOpenGuest(false);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, []);

  const submit = () => {
    const params = new URLSearchParams({
      type: tab,
      location,
      checkIn,
      checkOut,
      adults: adults.toString(),
      children: children.toString(),
    });
    // demo: điều hướng đến trang search
    window.location.href = `/search?${params}`;
  };

  const pill = (active: boolean) =>
    clsx(
      'rounded-2xl px-6 py-3 text-sm font-medium shadow',
      active
        ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
        : 'bg-white text-foreground ring-1 ring-black/5'
    );

  return (
    <section className="relative">
      <h2 className="mb-3 text-center text-2xl font-extrabold sm:text-3xl">
        Khám phá những địa điểm tuyệt đẹp trên thế giới cùng Trippio
      </h2>

      <div className="mx-auto max-w-5xl rounded-3xl border bg-white p-4 shadow-md sm:p-6">
        {/* tabs */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {TABS.map((t) => (
            <button key={t.key} className={pill(tab === t.key)} onClick={() => setTab(t.key)}>
              {t.label}
            </button>
          ))}
        </div>

        {/* form row */}
        <div className="mt-4 rounded-2xl border bg-white p-3 sm:p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-5">
            {/* Location */}
            <div className="col-span-2 sm:col-span-2">
              <label className="block text-xs font-semibold text-zinc-500">Location</label>
              <div className="mt-1 flex h-11 items-center gap-2 rounded-xl border px-3">
                <PinIcon />
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-transparent text-sm outline-none"
                >
                  {['Hà Nội', 'Hạ Long', 'Đà Nẵng', 'Hội An', 'Đà Lạt', 'Phú Quốc'].map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <ChevronDown className="opacity-60" />
              </div>
            </div>

            {/* Check-in */}
            <div>
              <label className="block text-xs font-semibold text-zinc-500">Check In</label>
              <div className="mt-1 flex h-11 items-center gap-2 rounded-xl border px-3">
                <CalendarIcon />
                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full bg-transparent text-sm outline-none"
                />
                <ChevronDown className="opacity-60" />
              </div>
            </div>

            {/* Check-out */}
            <div>
              <label className="block text-xs font-semibold text-zinc-500">Check Out</label>
              <div className="mt-1 flex h-11 items-center gap-2 rounded-xl border px-3">
                <CalendarIcon />
                <input
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full bg-transparent text-sm outline-none"
                />
                <ChevronDown className="opacity-60" />
              </div>
            </div>

            {/* Guests + Search */}
            <div className="relative" ref={guestRef}>
              <label className="block text-xs font-semibold text-zinc-500">Guest</label>
              <div className="mt-1 flex h-11 items-center gap-2 rounded-xl border px-2 pl-3">
                <UsersIcon />
                <button
                  type="button"
                  onClick={() => setOpenGuest((s) => !s)}
                  className="flex-1 truncate text-left text-sm"
                >
                  {adults} Người lớn, {children} Trẻ em
                </button>

                {/* search button */}
                <button
                  onClick={submit}
                  className="ml-2 inline-flex items-center gap-2 rounded-2xl bg-black px-4 py-2 text-sm font-medium text-white hover:bg-black/90"
                >
                  <SearchIcon />
                  <span> Tìm kiếm</span>
                </button>
              </div>

              {/* dropdown guest */}
              {openGuest && (
                <div className="absolute right-0 z-20 mt-2 w-72 rounded-xl border bg-white p-3 shadow-lg">
                  {[
                    { k: 'Người lớn', v: adults, set: setAdults },
                    { k: 'Trẻ em', v: children, set: setChildren },
                  ].map((row) => (
                    <div key={row.k} className="flex items-center justify-between py-2">
                      <span className="text-sm">{row.k}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => row.set(Math.max(0, row.v - 1))}
                          className="flex h-8 w-8 items-center justify-center rounded-md border hover:bg-zinc-50"
                        >
                          –
                        </button>
                        <span className="w-6 text-center text-sm">{row.v}</span>
                        <button
                          onClick={() => row.set(row.v + 1)}
                          className="flex h-8 w-8 items-center justify-center rounded-md border hover:bg-zinc-50"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                  <div className="mt-2 text-right">
                    <button
                      onClick={() => setOpenGuest(false)}
                      className="rounded-md border px-3 py-1.5 text-sm hover:bg-zinc-50"
                    >
                      Xong
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ====== Icons (inline, nhẹ) ====== */
function PinIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" fill="none">
      <path d="M12 21s-6-4.8-6-10a6 6 0 1 1 12 0c0 5.2-6 10-6 10Z" strokeWidth="2" />
      <circle cx="12" cy="9" r="2.5" strokeWidth="2" />
    </svg>
  );
}
function CalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" fill="none">
      <path
        d="M8 2v3M16 2v3M4 9h16M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"
        strokeWidth="2"
      />
    </svg>
  );
}
function UsersIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" fill="none">
      <path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" strokeWidth="2" />
      <circle cx="9" cy="7" r="4" strokeWidth="2" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" strokeWidth="2" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" strokeWidth="2" />
    </svg>
  );
}
function ChevronDown(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" {...props}>
      <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" fill="none" />
    </svg>
  );
}
function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
