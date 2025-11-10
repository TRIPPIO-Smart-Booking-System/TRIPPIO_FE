'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTodayTomorrow } from '../../searchHook/useTodayTomorrow';
import Counter from '../Counter';

type Cabin = 'eco' | 'premeco' | 'bus' | 'first';

type Airport = { code: string; label: string };
const AIRPORTS: Airport[] = [
  { code: 'SGN', label: 'TP HCM (SGN)' },
  { code: 'HAN', label: 'Hà Nội (HAN)' },
  { code: 'DAD', label: 'Đà Nẵng (DAD)' },
  { code: 'CXR', label: 'Nha Trang (CXR)' },
  { code: 'PQC', label: 'Phú Quốc (PQC)' },
  { code: 'HUI', label: 'Huế (HUI)' },
  { code: 'DLI', label: 'Đà Lạt (DLI)' },
  { code: 'HPH', label: 'Hải Phòng (HPH)' },
  { code: 'VII', label: 'Vinh (VII)' },
  { code: 'VCA', label: 'Cần Thơ (VCA)' },
];

// Icons (giữ nguyên)
const PlaneIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    className="shrink-0"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
  >
    <path d="M10.5 7.5l7-5v4l-4 3 4 3v4l-7-5-5 5v-3l3-3-3-3v-3l5 5z" />
  </svg>
);
const SwapIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    className="shrink-0"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
  >
    <path
      d="M7 7h10M7 7l3-3M7 7l3 3M17 17H7m10 0l-3-3m3 3l-3 3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
const CalendarIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    className="shrink-0"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
  >
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M16 3v4M8 3v4M3 11h18" />
  </svg>
);

// ---- Pax dropdown (popover) ----
type Pax = { adults: number; children: number; infants: number };

/** ✅ Hỗ trợ cả createRef lẫn useRef và xử lý null đúng cách */
type AnyRef<T extends HTMLElement> = React.RefObject<T> | React.MutableRefObject<T | null>;

function useOutsideClose<T extends HTMLElement>(ref: AnyRef<T>, onClose: () => void) {
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && e.target instanceof Node && !ref.current.contains(e.target)) {
        onClose();
      }
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
  }, [ref, onClose]);
}

function PaxDropdown({ value, onChange }: { value: Pax; onChange: (v: Pax) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null); // ✅ đúng chuẩn
  useOutsideClose(ref, () => setOpen(false));

  const label = `${value.adults} Người lớn, ${value.children} Trẻ em, ${value.infants} Em bé`;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 hover:bg-white/90"
      >
        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-slate-300">
          👤
        </span>
        <span className="whitespace-nowrap">{label}</span>
        <span className="ml-1 text-slate-500">▾</span>
      </button>

      {open && (
        <div className="absolute right-0 z-40 mt-2 w-[min(92vw,22rem)] rounded-xl border bg-white p-3 shadow-xl text-slate-900">
          <div className="space-y-2.5">
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
              <span className="text-sm text-slate-700">Em bé</span>
              <Counter
                value={value.infants}
                min={0}
                onChange={(n) => onChange({ ...value, infants: n })}
              />
            </div>
            <button
              onClick={() => setOpen(false)}
              className="mt-1 h-9 w-full rounded-md bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
            >
              Xong
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ---- Cabin dropdown (popover, auto-close) ----
function CabinDropdown({ value, onChange }: { value: Cabin; onChange: (v: Cabin) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null); // ✅ đúng chuẩn
  useOutsideClose(ref, () => setOpen(false));

  const label =
    value === 'eco'
      ? 'Phổ thông'
      : value === 'premeco'
        ? 'Phổ thông đặc biệt'
        : value === 'bus'
          ? 'Thương gia'
          : 'Hạng nhất';

  const options: { value: Cabin; label: string }[] = [
    { value: 'eco', label: 'Phổ thông' },
    { value: 'premeco', label: 'Phổ thông đặc biệt' },
    { value: 'bus', label: 'Thương gia' },
    { value: 'first', label: 'Hạng nhất' },
  ];

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 hover:bg-white/90"
      >
        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-slate-300">
          🪑
        </span>
        <span>{label}</span>
        <span className="ml-1 text-slate-500">▾</span>
      </button>

      {open && (
        <div className="absolute right-0 z-40 mt-2 w-48 overflow-hidden rounded-xl border bg-white text-slate-900 shadow-xl">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`block w-full px-3 py-2 text-left text-sm hover:bg-slate-50 ${value === opt.value ? 'bg-slate-50 font-medium' : ''}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function FlightSearch() {
  const router = useRouter();
  const { today, tomorrow } = useTodayTomorrow();

  const [roundTrip, setRoundTrip] = useState(false);
  const [from, setFrom] = useState('SGN');
  const [to, setTo] = useState('HAN');
  const [dep, setDep] = useState(today);
  const [ret, setRet] = useState(tomorrow);
  const [pax, setPax] = useState<Pax>({ adults: 1, children: 0, infants: 0 });
  const [cabin, setCabin] = useState<Cabin>('eco');

  const submitFlight = () => {
    const q = new URLSearchParams({
      from,
      to,
      dep,
      ...(roundTrip ? { ret } : {}),
      pax: String(pax.adults + pax.children + pax.infants),
      adults: String(pax.adults),
      children: String(pax.children),
      infants: String(pax.infants),
      cabin,
      trip: roundTrip ? 'round' : 'oneway',
    });
    router.push(`/flights?${q.toString()}`);
  };

  return (
    <div className="w-full">
      {/* Hàng trên: trip + pax + cabin (nút trắng, chữ đen) */}
      <div className="mb-2 grid grid-cols-1 gap-2 md:grid-cols-12">
        <div className="md:col-span-7 flex items-center gap-2">
          <div className="inline-flex rounded-full bg-white/15 p-0.5">
            <button
              type="button"
              onClick={() => setRoundTrip(false)}
              className={`px-4 py-2 rounded-full text-sm ${!roundTrip ? 'bg-blue-600 text-white' : 'text-white/90 hover:bg-white/10'}`}
            >
              Một chiều / Khứ hồi
            </button>
            <button
              type="button"
              disabled
              className="px-4 py-2 rounded-full text-sm text-white/70 cursor-not-allowed"
              title="Sắp ra mắt"
            >
              Nhiều thành phố
            </button>
          </div>
        </div>

        <div className="md:col-span-5 flex items-center justify-end gap-2">
          <PaxDropdown value={pax} onChange={setPax} />
          <CabinDropdown value={cabin} onChange={setCabin} />
        </div>
      </div>

      {/* Hàng dưới: từ/đến + ngày + search */}
      <div className="grid items-end gap-3 md:grid-cols-12">
        {/* Từ/Đến */}
        <div className="md:col-span-7">
          <div className="mb-1 flex justify-between px-2 text-xs text-slate-700">
            <span>Từ</span>
            <span>Đến</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex min-w-0 flex-1 items-center rounded-3xl border bg-white px-3 py-2 shadow-sm text-slate-900">
              <PlaneIcon />
              <select
                className="mx-2 h-10 flex-1 min-w-0 bg-transparent outline-none"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
              >
                {AIRPORTS.map((a) => (
                  <option key={a.code} value={a.code}>
                    {a.label}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => {
                  const f = from;
                  setFrom(to);
                  setTo(f);
                }}
                className="mx-1 inline-flex h-10 w-10 items-center justify-center rounded-full border bg-white text-slate-900 shadow"
                title="Đổi chiều"
              >
                <SwapIcon />
              </button>

              <PlaneIcon />
              <select
                className="ml-2 h-10 flex-1 min-w-0 bg-transparent outline-none"
                value={to}
                onChange={(e) => setTo(e.target.value)}
              >
                {AIRPORTS.map((a) => (
                  <option key={a.code} value={a.code}>
                    {a.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Ngày */}
        <div className="md:col-span-4">
          <div className="mb-1 flex items-center justify-between px-1 text-xs text-slate-700">
            <span>Ngày khởi hành</span>
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={roundTrip}
                onChange={(e) => setRoundTrip(e.target.checked)}
              />
              <span>Khứ hồi</span>
            </label>
          </div>

          <div className="flex items-center rounded-3xl border bg-white px-3 py-2 shadow-sm text-slate-900">
            <CalendarIcon />
            <input
              type="date"
              className="ml-2 h-10 flex-1 min-w-0 bg-transparent outline-none"
              value={dep}
              min={today}
              onChange={(e) => {
                const v = e.target.value;
                setDep(v);
                if (v >= ret) {
                  const d = new Date(v);
                  d.setDate(d.getDate() + 1);
                  setRet(d.toISOString().slice(0, 10));
                }
              }}
            />

            <div className="mx-3 h-6 w-px bg-slate-200" />

            <CalendarIcon />
            <input
              type="date"
              className="ml-2 h-10 flex-1 min-w-0 bg-transparent outline-none disabled:text-slate-400"
              value={ret}
              min={dep}
              disabled={!roundTrip}
              onChange={(e) => setRet(e.target.value)}
            />
          </div>
        </div>

        {/* Search */}
        <div className="md:col-span-1">
          <button
            onClick={submitFlight}
            className="ml-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-orange-500 text-white shadow hover:bg-orange-600 md:h-[54px] md:w-[54px]"
            title="Tìm kiếm"
          >
            🔍
          </button>
        </div>
      </div>
    </div>
  );
}
