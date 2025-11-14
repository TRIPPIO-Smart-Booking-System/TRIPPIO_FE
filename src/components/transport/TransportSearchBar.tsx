'use client';

import { useMemo, useState } from 'react';

export type TransportSearch = {
  from: string;
  to: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm (tùy chọn)
  passengers: number;
};

export default function TransportSearchBar({
  initial,
  onSearch,
  cities = [],
  className = '',
}: {
  initial?: Partial<TransportSearch>;
  onSearch: (q: TransportSearch) => void;
  cities?: string[];
  className?: string;
}) {
  const [from, setFrom] = useState(initial?.from ?? '');
  const [to, setTo] = useState(initial?.to ?? '');
  const [date, setDate] = useState(initial?.date ?? new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState(initial?.time ?? '');
  const [passengers, setPassengers] = useState(initial?.passengers ?? 1);

  const submit = () => onSearch({ from: from.trim(), to: to.trim(), date, time, passengers });

  const opts = useMemo(() => cities.sort((a, b) => a.localeCompare(b)), [cities]);

  return (
    <div
      className={`grid gap-2 sm:gap-3 rounded-2xl bg-white/80 p-2 sm:p-3 shadow-lg backdrop-blur sm:grid-cols-2 md:grid-cols-5 ${className}`}
    >
      <Field label="Điểm đi">
        <CitySelect value={from} onChange={setFrom} options={opts} placeholder="Nhập / chọn" />
      </Field>

      <Field label="Điểm đến">
        <CitySelect value={to} onChange={setTo} options={opts} placeholder="Nhập / chọn" />
      </Field>

      <Field label="Ngày đi">
        <input
          type="date"
          value={date}
          min={new Date().toISOString().slice(0, 10)}
          onChange={(e) => setDate(e.target.value)}
          className="h-10 sm:h-12 w-full rounded-xl border px-2 sm:px-3 text-xs sm:text-base outline-none focus:ring-2 focus:ring-sky-200"
        />
      </Field>

      <Field label="Giờ (tuỳ chọn)">
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="h-10 sm:h-12 w-full rounded-xl border px-2 sm:px-3 text-xs sm:text-base outline-none focus:ring-2 focus:ring-sky-200"
        />
      </Field>

      <Field label="Hành khách">
        <div className="flex h-10 sm:h-12 items-center justify-between rounded-xl border px-1.5 sm:px-2">
          <button
            type="button"
            className="h-7 sm:h-8 w-7 sm:w-8 rounded border hover:bg-zinc-50 text-sm"
            onClick={() => setPassengers((p) => Math.max(1, p - 1))}
          >
            −
          </button>
          <span className="w-8 text-center text-xs sm:text-base">{passengers}</span>
          <button
            type="button"
            className="h-7 sm:h-8 w-7 sm:w-8 rounded border hover:bg-zinc-50 text-sm"
            onClick={() => setPassengers((p) => p + 1)}
          >
            +
          </button>
        </div>
      </Field>

      <div className="sm:col-span-2 md:col-span-5 flex justify-end">
        <button
          type="button"
          onClick={submit}
          className="h-10 sm:h-11 rounded-xl bg-blue-600 px-4 sm:px-6 text-xs sm:text-base font-semibold text-white hover:bg-blue-700"
        >
          Tìm chuyến
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1 text-xs text-zinc-600">{label}</div>
      {children}
    </div>
  );
}

function CitySelect({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
}) {
  return (
    <div className="flex gap-2">
      <input
        list="city-list"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-10 sm:h-12 w-full rounded-xl border px-2 sm:px-3 text-xs sm:text-base outline-none focus:ring-2 focus:ring-sky-200"
      />
      {/* 1 datalist chung cho cả component */}
      <datalist id="city-list">
        {options.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>
    </div>
  );
}
