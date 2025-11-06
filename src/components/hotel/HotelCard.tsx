'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { ApiHotel } from '@/data/hotel.types';
import { BedDouble, Users2, DoorOpen, Star } from 'lucide-react';

/** Prefer HTTPS in prod to avoid mixed content */
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ??
  (process.env.NODE_ENV === 'production'
    ? 'https://trippio.azurewebsites.net'
    : 'http://localhost:7142');

type ApiRoom = {
  id: string;
  hotelId: string;
  roomType: string;
  pricePerNight: number;
  capacity: number;
  availableRooms: number;
  dateCreated: string;
  modifiedDate: string | null;
};

type Props = {
  hotel: ApiHotel;
  checkIn: string; // 'YYYY-MM-DD'
  checkOut: string; // 'YYYY-MM-DD'
  adults: number;
  childrenCount: number;
  roomsNeeded: number;
};

const VND = (n: number) =>
  Math.round(n).toLocaleString('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  });

/** DST-safe nights calculator using UTC dates */
function calcNights(ci: string, co: string) {
  const [y1, m1, d1] = ci.split('-').map(Number);
  const [y2, m2, d2] = co.split('-').map(Number);
  const a = Date.UTC(y1, (m1 ?? 1) - 1, d1 ?? 1);
  const b = Date.UTC(y2, (m2 ?? 1) - 1, d2 ?? 1);
  return Math.max(Math.round((b - a) / 86_400_000), 1);
}

export default function HotelCard({
  hotel,
  checkIn,
  checkOut,
  adults,
  childrenCount,
  roomsNeeded,
}: Props) {
  const totalGuests = adults + childrenCount;

  const [rooms, setRooms] = useState<ApiRoom[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [roomErr, setRoomErr] = useState<string | null>(null);

  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        setLoadingRooms(true);
        setRoomErr(null);

        // Prefer server-side filtering (if BE supports ?hotelId=)
        const preferUrl = `${API_BASE}/api/Room?hotelId=${encodeURIComponent(hotel.id)}`;
        let res = await fetch(preferUrl, { cache: 'no-store', signal: ac.signal });

        if (!res.ok) {
          // Fallback: fetch all then filter
          res = await fetch(`${API_BASE}/api/Room`, { cache: 'no-store', signal: ac.signal });
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data: unknown = await res.json();
        const all = (Array.isArray(data) ? data : []) as ApiRoom[];

        const list = all
          .filter((r) => r.hotelId === hotel.id)
          .sort((a, b) => (a.pricePerNight ?? 0) - (b.pricePerNight ?? 0));

        if (!ac.signal.aborted) setRooms(list);
      } catch (e: unknown) {
        if (!ac.signal.aborted) {
          setRoomErr(e instanceof Error ? e.message : 'Fetch rooms failed');
        }
      } finally {
        if (!ac.signal.aborted) setLoadingRooms(false);
      }
    })();

    return () => ac.abort();
  }, [hotel.id]);

  /** Min nightly price that can actually satisfy total guests & rooms needed */
  const nightly = useMemo(() => {
    let min = Number.POSITIVE_INFINITY;
    for (const r of rooms) {
      const okCapTotal = (r.capacity ?? 0) * roomsNeeded >= totalGuests;
      const okStock = (r.availableRooms ?? 0) >= roomsNeeded;
      if (okCapTotal && okStock && typeof r.pricePerNight === 'number') {
        min = Math.min(min, r.pricePerNight);
      }
    }
    return Number.isFinite(min) ? min : null;
  }, [rooms, totalGuests, roomsNeeded]);

  const totalRoomsLeft = useMemo(
    () => rooms.reduce((s, r) => s + (r.availableRooms || 0), 0),
    [rooms]
  );

  // show at most 3 cheapest (already sorted)
  const teaserRooms = useMemo(() => rooms.slice(0, 3), [rooms]);

  return (
    <article className="flex w-full overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm transition hover:shadow-md">
      {/* LEFT: image */}
      <div className="relative w-[30%] min-h-[220px]">
        <Image
          src="/img/placeholder.jpg"
          alt={hotel.name}
          fill
          sizes="(max-width: 768px) 100vw, 30vw"
          className="object-cover"
          priority={false}
        />
      </div>

      {/* MIDDLE: info + teaser room list */}
      <div className="flex flex-1 flex-col p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link href={`/hotel/${hotel.id}`} className="block">
              <h2 className="truncate text-xl font-semibold text-zinc-900 hover:underline">
                {hotel.name}
              </h2>
            </Link>
            <div className="mt-1 truncate text-sm text-zinc-700">
              📍 {hotel.address || hotel.city}
              {hotel.country ? `, ${hotel.country}` : ''}
            </div>
            {!!hotel.description && (
              <p className="mt-1 line-clamp-2 text-sm text-zinc-600">{hotel.description}</p>
            )}

            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-amber-700">
                <Star aria-hidden className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                {hotel.stars} sao
              </span>
              <span className="rounded-full bg-zinc-100 px-2 py-1 text-zinc-700">
                {rooms.length} hạng phòng
              </span>
              <span className="rounded-full bg-zinc-100 px-2 py-1 text-zinc-700">
                {totalRoomsLeft} phòng còn
              </span>
            </div>
          </div>

          {/* Price from */}
          <div className="shrink-0 text-right">
            <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
              Đặt ngay
            </span>
            <div className="mt-1 text-xs text-zinc-500">Giá từ</div>
            <div className="text-2xl font-extrabold text-orange-600">
              {nightly == null ? '—' : VND(nightly)}
            </div>
            <div className="text-xs text-zinc-500">
              /đêm • {calcNights(checkIn, checkOut)} đêm · {roomsNeeded} phòng
            </div>
          </div>
        </div>

        {/* Teaser rooms (max 3) */}
        <div className="mt-4 rounded-2xl border bg-white">
          <ul className="divide-y">
            {loadingRooms && <li className="px-4 py-3 text-sm text-zinc-500">Đang tải phòng…</li>}
            {roomErr && !loadingRooms && (
              <li className="px-4 py-3 text-sm text-red-600">Lỗi tải phòng: {roomErr}</li>
            )}
            {!loadingRooms && !roomErr && teaserRooms.length === 0 && (
              <li className="px-4 py-3 text-sm text-zinc-500">Chưa có phòng khả dụng.</li>
            )}

            {teaserRooms.map((r) => {
              const okCapTotal = (r.capacity ?? 0) * roomsNeeded >= totalGuests;
              const okStock = (r.availableRooms ?? 0) >= roomsNeeded;
              const disabled = !(okCapTotal && okStock);

              return (
                <li key={r.id} className="grid grid-cols-12 items-center gap-2 px-4 py-3">
                  <div className="col-span-12 sm:col-span-5">
                    <div className="flex items-center gap-2">
                      <BedDouble aria-hidden className="h-4 w-4 text-zinc-500" />
                      <span className="font-medium text-zinc-900">{r.roomType}</span>
                    </div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-3 text-xs text-zinc-600">
                      <span className="inline-flex items-center gap-1">
                        <Users2 aria-hidden className="h-3.5 w-3.5" />
                        {r.capacity} khách/phòng
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <DoorOpen aria-hidden className="h-3.5 w-3.5" />
                        {r.availableRooms} phòng còn
                      </span>
                    </div>
                  </div>

                  <div className="col-span-6 sm:col-span-3 text-sm font-semibold sm:text-base">
                    {VND(r.pricePerNight)}/đêm
                  </div>

                  <div className="col-span-6 sm:col-span-4 text-right">
                    {disabled ? (
                      <button
                        type="button"
                        disabled
                        className="inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-sm font-semibold cursor-not-allowed bg-zinc-200 text-zinc-500"
                        title="Không đáp ứng điều kiện khách/phòng"
                        aria-disabled="true"
                      >
                        Xem chi tiết
                      </button>
                    ) : (
                      <Link
                        href={`/hotel/${hotel.id}?room=${r.id}`}
                        className="inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700"
                        title="Xem chi tiết phòng"
                      >
                        Xem chi tiết
                      </Link>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>

          {/* View all rooms */}
          {rooms.length > 3 && (
            <div className="border-t px-4 py-2 text-right">
              <Link
                href={`/hotel/${hotel.id}`}
                className="text-sm font-medium text-blue-700 hover:underline"
              >
                Xem tất cả {rooms.length} phòng →
              </Link>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
