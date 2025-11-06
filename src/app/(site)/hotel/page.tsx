// ./src/app/(site)/hotel/page.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import HotelSearchBar, { HotelSearchQuery } from '@/components/hotel/HotelSearchBar';
import HotelCard from '@/components/hotel/HotelCard';
import type { ApiHotel, ApiRoom } from '@/data/hotel.types';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'https://trippio.azurewebsites.net';

type SortKey = 'popularity' | 'priceAsc' | 'priceDesc' | 'ratingDesc';
type ViewMode = 'grid' | 'list';

/* ================= Helpers ================= */

function pickNum(o: unknown, key: string): number | undefined {
  if (o && typeof o === 'object') {
    const v = (o as Record<string, unknown>)[key];
    if (typeof v === 'number' && Number.isFinite(v)) return v;
  }
  return undefined;
}

function computeMinPriceFromRooms(rooms?: ApiRoom[]): number | undefined {
  if (!rooms?.length) return undefined;
  let min = Number.POSITIVE_INFINITY;
  for (const r of rooms) {
    if (typeof r.pricePerNight === 'number' && r.pricePerNight >= 0) {
      min = Math.min(min, r.pricePerNight);
    }
  }
  return Number.isFinite(min) ? min : undefined;
}

/** Cho phép thiếu rooms/modifiedDate để normalize; tránh dùng any */
type LooseHotel = Omit<ApiHotel, 'rooms' | 'modifiedDate'> & {
  rooms?: ApiRoom[] | null;
  modifiedDate?: string | null;
};

/** HotelView là "superset" của ApiHotel và chắc chắn rooms, modifiedDate là kiểu chặt */
type HotelView = Omit<ApiHotel, 'modifiedDate' | 'rooms'> & {
  modifiedDate: string; // ép string để khớp chặt chẽ với HotelCard
  rooms: ApiRoom[]; // luôn là mảng (không undefined)
  minPrice?: number;
  rating?: number;
};

function normalizeHotel(h: LooseHotel): HotelView {
  // rooms luôn là mảng
  const rooms: ApiRoom[] = Array.isArray(h.rooms) ? h.rooms : [];

  const rating =
    pickNum(h, 'rating') ?? pickNum(h, 'stars') ?? pickNum(h, 'score') ?? pickNum(h, 'reviewScore');

  const minFromRooms = computeMinPriceFromRooms(rooms);
  const minPrice =
    minFromRooms ??
    pickNum(h as unknown, 'minPrice') ??
    pickNum(h as unknown, 'price') ??
    pickNum(h as unknown, 'lowestPrice') ??
    pickNum(h as unknown, 'fromPrice');

  return {
    ...h,
    rooms,
    modifiedDate: h.modifiedDate ?? '', // ép về string
    minPrice,
    rating,
  };
}

/* ================= Page ================= */

export default function HotelsPage() {
  const [query, setQuery] = useState<HotelSearchQuery>({
    city: '',
    checkIn: new Date().toISOString().slice(0, 10),
    checkOut: (() => {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      return d.toISOString().slice(0, 10);
    })(),
    adults: 2,
    children: 0,
    rooms: 1,
  });

  const [hotels, setHotels] = useState<HotelView[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [err, setErr] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortKey>('popularity');
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  useEffect(() => {
    const ac = new AbortController();

    (async () => {
      try {
        setLoading(true);
        setErr(null);

        const [resHotels, resRooms] = await Promise.all([
          fetch(`${API_BASE}/api/Hotel`, {
            cache: 'no-store',
            signal: ac.signal,
            headers: { Accept: 'application/json' },
          }),
          fetch(`${API_BASE}/api/Room`, {
            cache: 'no-store',
            signal: ac.signal,
            headers: { Accept: 'application/json' },
          }),
        ]);

        if (!resHotels.ok) throw new Error(`Hotel HTTP ${resHotels.status}`);
        if (!resRooms.ok) throw new Error(`Room HTTP ${resRooms.status}`);

        const rawHotels: unknown = await resHotels.json();
        const rawRooms: unknown = await resRooms.json();

        const hotelsArr: ApiHotel[] = Array.isArray(rawHotels) ? (rawHotels as ApiHotel[]) : [];
        const roomsArr: ApiRoom[] = Array.isArray(rawRooms) ? (rawRooms as ApiRoom[]) : [];

        // group rooms by hotelId
        const mapRooms = new Map<string, ApiRoom[]>();
        for (const r of roomsArr) {
          if (!r?.hotelId) continue;
          const bucket = mapRooms.get(r.hotelId) ?? [];
          bucket.push(r);
          mapRooms.set(r.hotelId, bucket);
        }
        // sort each bucket by price
        for (const arr of mapRooms.values()) {
          arr.sort((a, b) => (a.pricePerNight ?? 0) - (b.pricePerNight ?? 0));
        }

        // attach rooms (luôn là mảng)
        const attached: LooseHotel[] = hotelsArr.map((h) => ({
          ...h,
          rooms: mapRooms.get(h.id) ?? [],
        }));

        if (!ac.signal.aborted) {
          setHotels(attached.map(normalizeHotel));
        }
      } catch (e: unknown) {
        if (!ac.signal.aborted) {
          setErr(e instanceof Error ? e.message : 'Fetch failed');
        }
      } finally {
        if (!ac.signal.aborted) {
          setLoading(false);
        }
      }
    })();

    return () => ac.abort();
  }, []);

  const cityCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    hotels.forEach((h) => {
      const city = (h.city ?? 'Khác').trim();
      counts[city] = (counts[city] || 0) + 1;
    });
    return counts;
  }, [hotels]);

  const filteredBase = useMemo(() => {
    const norm = (s: string) => (s ?? '').trim().toLowerCase();
    return hotels.filter((h) => !query.city || norm(h.city) === norm(query.city));
  }, [hotels, query.city]);

  const filtered = useMemo(() => {
    const copy = [...filteredBase];
    switch (sortBy) {
      case 'priceAsc':
        copy.sort(
          (a, b) =>
            (a.minPrice ?? Number.POSITIVE_INFINITY) - (b.minPrice ?? Number.POSITIVE_INFINITY)
        );
        break;
      case 'priceDesc':
        copy.sort(
          (a, b) =>
            (b.minPrice ?? Number.NEGATIVE_INFINITY) - (a.minPrice ?? Number.NEGATIVE_INFINITY)
        );
        break;
      case 'ratingDesc':
        copy.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
        break;
      case 'popularity':
      default:
        // fallback: ưu tiên rating cao → giá thấp
        copy.sort(
          (a, b) => (b.rating ?? 0) - (a.rating ?? 0) || (a.minPrice ?? 1e15) - (b.minPrice ?? 1e15)
        );
        break;
    }
    return copy;
  }, [filteredBase, sortBy]);

  const onSearch = (q: HotelSearchQuery) => setQuery(q);
  const total = filtered.length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-white">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-xl font-bold text-sky-800">🏨 Tìm & đặt phòng khách sạn</h1>
            <div className="text-sm text-zinc-600">
              <span className="font-semibold text-sky-700">{total}</span> nơi lưu trú
            </div>
          </div>

          <div className="mt-3 rounded-2xl border bg-white p-3 shadow-sm">
            <HotelSearchBar initial={query} onSearch={onSearch} cityCounts={cityCounts} />
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            {/* Chips theo thành phố */}
            <div className="flex flex-wrap gap-2">
              {Object.entries(cityCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 12)
                .map(([city, count]) => {
                  const active = query.city === city;
                  return (
                    <button
                      key={city}
                      type="button"
                      onClick={() => onSearch({ ...query, city })}
                      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm transition ${
                        active
                          ? 'border-sky-600 bg-sky-600 text-white shadow-sm'
                          : 'border-sky-200 bg-white text-sky-700 hover:bg-sky-50'
                      }`}
                      aria-pressed={active}
                    >
                      {city}
                      <span
                        className={`rounded-full px-1.5 text-xs ${
                          active ? 'bg-white/20 text-white' : 'bg-sky-100 text-sky-700'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              {query.city && (
                <button
                  type="button"
                  onClick={() => onSearch({ ...query, city: '' })}
                  className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-sm text-zinc-600 hover:bg-zinc-50"
                  title="Bỏ lọc thành phố"
                >
                  Xoá lọc
                </button>
              )}
            </div>

            {/* Sort + view */}
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm text-zinc-700">
                Sắp xếp:
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortKey)}
                  className="rounded-lg border px-2 py-1 outline-none"
                >
                  <option value="popularity">Phổ biến</option>
                  <option value="priceAsc">Giá tăng dần</option>
                  <option value="priceDesc">Giá giảm dần</option>
                  <option value="ratingDesc">Đánh giá cao</option>
                </select>
              </label>

              <div className="flex items-center rounded-xl border bg-white">
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1 text-sm ${
                    viewMode === 'list' ? 'rounded-l-xl bg-sky-600 text-white' : 'text-zinc-700'
                  }`}
                  aria-pressed={viewMode === 'list'}
                  title="Dạng danh sách"
                >
                  List
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1 text-sm ${
                    viewMode === 'grid' ? 'rounded-r-xl bg-sky-600 text-white' : 'text-zinc-700'
                  }`}
                  aria-pressed={viewMode === 'grid'}
                  title="Dạng lưới"
                >
                  Grid
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main
        className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8"
        aria-busy={loading}
        aria-live="polite"
      >
        {loading && (
          <div
            className={`${
              viewMode === 'grid' ? 'grid gap-4 md:grid-cols-2 lg:grid-cols-3' : 'space-y-4'
            }`}
          >
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        )}

        {err && (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Lỗi tải dữ liệu: {err}
          </div>
        )}

        {!loading && !err && (
          <>
            {viewMode === 'grid' ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filtered.map((hotel) => (
                  <HotelCard
                    key={hotel.id}
                    hotel={hotel}
                    checkIn={query.checkIn}
                    checkOut={query.checkOut}
                    adults={query.adults}
                    childrenCount={query.children}
                    roomsNeeded={query.rooms}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filtered.map((hotel) => (
                  <div key={hotel.id} className="rounded-2xl border bg-white p-2 shadow-sm">
                    <HotelCard
                      hotel={hotel}
                      checkIn={query.checkIn}
                      checkOut={query.checkOut}
                      adults={query.adults}
                      childrenCount={query.children}
                      roomsNeeded={query.rooms}
                    />
                  </div>
                ))}
              </div>
            )}

            {!filtered.length && (
              <div className="mt-10 rounded-3xl border bg-white/90 p-10 text-center">
                <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-sky-100 p-3">🌤️</div>
                <h3 className="text-lg font-semibold text-sky-800">
                  Không tìm thấy khách sạn phù hợp
                </h3>
                <p className="mt-1 text-sm text-zinc-600">
                  Hãy thử đổi ngày, giảm số phòng hoặc bỏ lọc thành phố để xem nhiều kết quả hơn.
                </p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
      <div className="h-40 w-full animate-pulse bg-gradient-to-r from-zinc-200 via-zinc-100 to-zinc-200" />
      <div className="space-y-2 p-4">
        <div className="h-4 w-2/3 animate-pulse rounded bg-zinc-200" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-zinc-200" />
        <div className="mt-3 h-8 w-24 animate-pulse rounded-lg bg-zinc-200" />
      </div>
    </div>
  );
}
