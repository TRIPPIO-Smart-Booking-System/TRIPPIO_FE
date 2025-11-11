'use client';

import Image from 'next/image';
import { useMemo, useState, useEffect } from 'react';
import type { ApiTransport, ApiTransportTrip } from '@/app/(site)/transport/page';
import { loadFlights, getRandomItem, type FlightData } from '@/lib/csvLoader';

type Currency = 'VND' | 'USD';

const money = (n: number, c: Currency = 'VND') =>
  n.toLocaleString(c === 'VND' ? 'vi-VN' : 'en-US', {
    style: 'currency',
    currency: c,
    maximumFractionDigits: c === 'VND' ? 0 : 2,
  });

const fmt = (iso?: string) => {
  const d = iso ? new Date(iso) : null;
  return d && !isNaN(+d)
    ? d.toLocaleString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
      })
    : '—';
};

/* --------- Art config (ảnh + gradient) --------- */
const vehicleArt: Record<
  string,
  { banner: string; icon: string; emoji: string; gradient: string; accent: string }
> = {
  Airline: {
    banner: '/img/transport/airline-hero.jpg',
    icon: '/img/transport/airplane.png',
    emoji: '✈️',
    gradient: 'from-sky-500 via-cyan-400 to-emerald-400',
    accent: 'text-sky-700',
  },
  Train: {
    banner: '/img/transport/train-hero.jpg',
    icon: '/img/transport/train.png',
    emoji: '🚆',
    gradient: 'from-emerald-500 via-teal-400 to-cyan-400',
    accent: 'text-emerald-700',
  },
  Bus: {
    banner: '/img/transport/bus-hero.jpg',
    icon: '/img/transport/bus.png',
    emoji: '🚌',
    gradient: 'from-amber-400 via-orange-400 to-lime-400',
    accent: 'text-amber-700',
  },
  Other: {
    banner: '/img/transport/other-hero.jpg',
    icon: '/img/transport/vehicle.png',
    emoji: '🚗',
    gradient: 'from-indigo-500 via-violet-400 to-fuchsia-400',
    accent: 'text-indigo-700',
  },
};

function getArt(type?: string) {
  if (!type) return vehicleArt.Other;
  if (/air/i.test(type)) return vehicleArt.Airline;
  if (/train/i.test(type)) return vehicleArt.Train;
  if (/bus/i.test(type)) return vehicleArt.Bus;
  return vehicleArt.Other;
}

/* ======================== MAIN CARD ======================== */
export default function TransportCard({
  transport,
  passengers = 1,
  currency = 'VND',
  defaultOpen = true,
  onBook,
}: {
  transport: ApiTransport;
  passengers?: number;
  currency?: Currency;
  defaultOpen?: boolean;
  onBook?: (trip: ApiTransportTrip, passengers: number) => void;
}) {
  const trips = transport.transportTrips ?? [];
  const hasTrips = trips.length > 0;
  const [open, setOpen] = useState<boolean>(defaultOpen && hasTrips);
  const art = getArt(transport.transportType);
  const [randomFlightImage, setRandomFlightImage] = useState<FlightData | null>(null);

  useEffect(() => {
    // Load random flight image once when component mounts
    (async () => {
      const flights = await loadFlights();
      const randomFlight = getRandomItem(flights);
      setRandomFlightImage(randomFlight || null);
    })();
  }, []);

  return (
    <article
      className={`
        group relative overflow-hidden rounded-3xl border border-white/40
        bg-white/80 shadow-[0_20px_60px_-20px_rgba(2,132,199,.25)]
        ring-1 ring-black/5 backdrop-blur
        transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-[0_30px_80px_-28px_rgba(2,132,199,.35)]
      `}
    >
      {/* VIP ribbon */}
      <div className="pointer-events-none absolute -right-12 top-5 z-20 rotate-45 select-none">
        <span className="inline-block rounded-md bg-gradient-to-br from-fuchsia-500 to-pink-500 px-10 py-1 text-xs font-extrabold text-white shadow-lg">
          VIP+
        </span>
      </div>

      {/* Banner */}
      <div className="relative h-32 w-full sm:h-36">
        <div className={`absolute inset-0 bg-gradient-to-r ${art.gradient}`} />
        <Image
          src={randomFlightImage?.image_url || art.banner}
          alt={`${transport.transportType} banner`}
          fill
          className="object-cover mix-blend-multiply opacity-90"
          onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = 'none')}
          priority
          unoptimized
        />
        {/* Shine overlay */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(600px_120px_at_20%_-10%,rgba(255,255,255,.35),transparent)]" />

        {/* left chips */}
        <div className="absolute left-4 top-4 flex items-center gap-2">
          <span className="relative inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-white/90 ring-1 ring-black/5">
            <Image
              src={art.icon}
              alt="vehicle icon"
              fill
              className="object-contain p-1.5"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = 'none';
                const parent = e.currentTarget.parentElement as HTMLSpanElement;
                parent.textContent = getArt(transport.transportType).emoji;
              }}
            />
          </span>
          <span className="rounded-xl bg-white/90 px-3 py-1 text-xs font-semibold text-slate-800 shadow">
            {transport.transportType}
          </span>
        </div>

        {/* right chips */}
        <div className="absolute right-4 top-4 flex flex-wrap items-center justify-end gap-2">
          <span
            className={`rounded-xl bg-white/90 px-3 py-1 text-xs font-semibold ${art.accent} shadow`}
          >
            {transport.name}
          </span>
          <span className="rounded-xl bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-sky-700 shadow">
            {hasTrips ? `${trips.length} chuyến` : 'Chưa có chuyến'}
          </span>
        </div>

        {/* bottom title */}
        <div className="absolute inset-x-4 bottom-3 flex items-center justify-between">
          <h3 className="truncate text-lg font-extrabold tracking-tight text-white drop-shadow-sm">
            {transport.transportType} • {transport.name}
          </h3>
          {hasTrips && (
            <button
              type="button"
              onClick={() => setOpen((s) => !s)}
              className="rounded-xl border border-white/50 bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-800 transition hover:bg-white"
              aria-expanded={open}
            >
              {open ? 'Thu gọn' : 'Xem chuyến'}
            </button>
          )}
        </div>
      </div>

      {/* body */}
      <div className="p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-slate-600">
            {hasTrips
              ? 'Chọn chuyến phù hợp bên dưới'
              : 'Chưa có lịch chuyến cho lựa chọn hiện tại.'}
          </p>
          <div className="inline-flex items-center gap-2 text-xs text-slate-500">
            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            <span>Giá hiển thị theo {currency}</span>
          </div>
        </div>

        {/* trips list */}
        {hasTrips && (
          <div
            className={`
              grid transition-[grid-template-rows,opacity] duration-300
              ${open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}
            `}
          >
            <div className="min-h-0 overflow-hidden">
              {/* header sticky */}
              <div className="sticky top-0 z-10 mb-2 rounded-xl border border-slate-200/70 bg-white/70 px-3 py-2 text-xs font-semibold text-slate-700 backdrop-blur">
                <div className="grid grid-cols-2 items-center gap-2 sm:grid-cols-4">
                  <div>Tuyến</div>
                  <div>Thời gian</div>
                  <div className="hidden sm:block">Số ghế</div>
                  <div className="text-right">Giá / vé</div>
                </div>
              </div>

              <div className="space-y-2">
                {trips.map((tr) => (
                  <TripRow
                    key={tr.id}
                    trip={tr}
                    passengers={passengers}
                    currency={currency}
                    onBook={onBook}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* glow bottom */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-[radial-gradient(70%_60%_at_50%_120%,rgba(2,132,199,.18),transparent)]"
      />
    </article>
  );
}

/* ======================== TRIP ROW ======================== */
function TripRow({
  trip,
  passengers,
  currency,
  onBook,
}: {
  trip: ApiTransportTrip;
  passengers: number;
  currency: Currency;
  onBook?: (trip: ApiTransportTrip, passengers: number) => void;
}) {
  const total = useMemo(() => trip.price * passengers, [trip.price, passengers]);
  const canBook = (trip.availableSeats ?? 0) >= passengers;

  const handleBook = () => {
    if (!canBook) return;
    if (onBook) onBook(trip, passengers);
    else {
      alert(
        `Đặt ${passengers} vé\n${trip.departure} → ${trip.destination}\n` +
          `Giờ: ${fmt(trip.departureTime)}\nTổng: ${money(total, currency)}`
      );
    }
  };

  return (
    <div
      className={`
        group grid items-center gap-3 rounded-2xl border border-slate-200/70
        bg-white/80 p-3 ring-1 ring-black/0 backdrop-blur
        transition hover:-translate-y-0.5 hover:border-sky-300/70 hover:shadow-[0_18px_50px_-24px_rgba(2,132,199,.35)]
        sm:grid-cols-[1.2fr_.9fr_.6fr_.6fr]
      `}
    >
      {/* route */}
      <div className="min-w-0">
        <div className="truncate text-[15px] font-semibold text-slate-900">
          {trip.departure} <span className="mx-1.5 text-slate-400">→</span> {trip.destination}
        </div>
        <div className="mt-0.5 text-xs text-slate-500">
          Mã chuyến: <span className="font-mono">{trip.id.slice(0, 6).toUpperCase()}</span>
        </div>
      </div>

      {/* time */}
      <div className="text-sm text-slate-700">
        <div>
          {fmt(trip.departureTime)} <span className="text-slate-400">→</span>{' '}
          {fmt(trip.arrivalTime)}
        </div>
        <div className="mt-0.5 text-xs text-slate-500">Khởi hành tối thiểu: {trip.departure}</div>
      </div>

      {/* seats */}
      <div className="hidden sm:block">
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${
            canBook
              ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/70'
              : 'bg-slate-100 text-slate-600 ring-1 ring-slate-200/70'
          }`}
        >
          {canBook ? 'Còn' : 'Hết'} {trip.availableSeats ?? 0} ghế
        </span>
      </div>

      {/* price + cta */}
      <div className="text-right">
        <div className="text-[11px] font-medium text-slate-500">Giá / vé</div>
        <div className="text-lg font-extrabold tracking-tight text-orange-600">
          {money(trip.price, currency)}
        </div>
        <button
          type="button"
          disabled={!canBook}
          onClick={handleBook}
          className={`mt-2 h-10 w-full rounded-xl text-sm font-semibold shadow transition
            ${
              !canBook
                ? 'cursor-not-allowed bg-slate-200 text-slate-500'
                : 'bg-gradient-to-br from-sky-600 to-cyan-600 text-white hover:brightness-105 active:brightness-95'
            }`}
          aria-disabled={!canBook}
          aria-label={`Đặt vé ${trip.departure} đến ${trip.destination}`}
        >
          {canBook ? 'Đặt vé' : 'Hết chỗ'}
        </button>
      </div>
    </div>
  );
}
