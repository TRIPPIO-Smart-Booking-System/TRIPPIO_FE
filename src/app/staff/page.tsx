// src/app/staff/page.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

import { getAuth } from '@/lib/auth';
import { apiListShows, ApiShow } from '@/data/show.api';

/* ---------- Types & const ---------- */
const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:7142';

type ApiTransport = {
  id: string;
  transportType: string; // Airline | Train | Bus | ...
  name: string;
  dateCreated: string;
  modifiedDate: string | null;
};

type ApiTransportTrip = {
  id: string;
  transportId: string;
  departure: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  availableSeats: number;
  dateCreated: string;
  modifiedDate: string | null;
};

/* ===== NEW: Hotel/Room types ===== */
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
type ApiHotel = {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  description: string;
  stars: number;
  dateCreated: string;
  modifiedDate: string | null;
};

function authHeaders(): HeadersInit {
  const { accessToken } = getAuth();
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
}
function toLocal(d: string) {
  const n = new Date(d);
  return Number.isNaN(n.getTime()) ? d : n.toLocaleString();
}

/* ---------- Page ---------- */
export default function StaffDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // data
  const [shows, setShows] = useState<ApiShow[]>([]);
  const [transports, setTransports] = useState<ApiTransport[]>([]);
  const [trips, setTrips] = useState<ApiTransportTrip[]>([]);

  /* ===== NEW: Hotel/Room state ===== */
  const [hotels, setHotels] = useState<ApiHotel[]>([]);
  const [rooms, setRooms] = useState<ApiRoom[]>([]);

  async function load() {
    setErr(null);
    setLoading(true);
    try {
      // 1) shows (dùng helper có sẵn)
      const showList = await apiListShows();

      // 2) transport + trips
      const [rt, rtr] = await Promise.all([
        fetch(`${API_BASE}/api/Transport`, {
          cache: 'no-store',
          credentials: 'include',
          headers: authHeaders(),
        }),
        fetch(`${API_BASE}/api/TransportTrip`, {
          cache: 'no-store',
          credentials: 'include',
          headers: authHeaders(),
        }),
      ]);
      if (!rt.ok) throw new Error(`Transport HTTP ${rt.status}`);
      if (!rtr.ok) throw new Error(`TransportTrip HTTP ${rtr.status}`);

      const tJson = (await rt.json()) as unknown;
      const trJson = (await rtr.json()) as unknown;

      // 3) NEW: hotels + rooms
      const [rHotels, rRooms] = await Promise.all([
        fetch(`${API_BASE}/api/Hotel`, {
          cache: 'no-store',
          credentials: 'include',
          headers: authHeaders(),
        }),
        fetch(`${API_BASE}/api/Room`, {
          cache: 'no-store',
          credentials: 'include',
          headers: authHeaders(),
        }),
      ]);
      if (!rHotels.ok) throw new Error(`Hotel HTTP ${rHotels.status}`);
      if (!rRooms.ok) throw new Error(`Room HTTP ${rRooms.status}`);

      const hotelsJson = (await rHotels.json()) as unknown;
      const roomsJson = (await rRooms.json()) as unknown;

      setShows(Array.isArray(showList) ? showList : []);
      setTransports(Array.isArray(tJson) ? (tJson as ApiTransport[]) : []);
      setTrips(Array.isArray(trJson) ? (trJson as ApiTransportTrip[]) : []);

      // NEW
      setHotels(Array.isArray(hotelsJson) ? (hotelsJson as ApiHotel[]) : []);
      setRooms(Array.isArray(roomsJson) ? (roomsJson as ApiRoom[]) : []);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Load failed');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const metrics = useMemo(() => {
    const totalShows = shows.length;
    const totalTransports = transports.length;
    const totalTrips = trips.length;

    // NEW
    const totalHotels = hotels.length;
    const totalRooms = rooms.length;

    const totalTickets =
      shows.reduce((s, r) => s + (Number(r.availableTickets) || 0), 0) +
      trips.reduce((s, t) => s + (Number(t.availableSeats) || 0), 0) +
      // (tuỳ chọn) cộng số phòng khả dụng
      rooms.reduce((s, r) => s + (Number(r.availableRooms) || 0), 0);

    const estRevenue =
      shows.reduce((s, r) => s + (Number(r.price) || 0), 0) +
      trips.reduce((s, t) => s + (Number(t.price) || 0), 0) +
      rooms.reduce((s, r) => s + (Number(r.pricePerNight) || 0), 0);

    return {
      totalShows,
      totalTransports,
      totalTrips,
      totalHotels,
      totalRooms,
      totalTickets,
      estRevenue,
    };
  }, [shows, transports, trips, hotels, rooms]);

  const recentShows = useMemo(
    () => [...shows].sort((a, b) => +new Date(b.startDate) - +new Date(a.startDate)).slice(0, 5),
    [shows]
  );
  const recentTrips = useMemo(
    () =>
      [...trips]
        .sort((a, b) => +new Date(b.departureTime) - +new Date(a.departureTime))
        .slice(0, 5),
    [trips]
  );

  /* ===== NEW: recent hotels/rooms ===== */
  const recentHotels = useMemo(
    () =>
      [...hotels].sort((a, b) => +new Date(b.dateCreated) - +new Date(a.dateCreated)).slice(0, 5),
    [hotels]
  );
  const recentRooms = useMemo(
    () =>
      [...rooms].sort((a, b) => +new Date(b.dateCreated) - +new Date(a.dateCreated)).slice(0, 5),
    [rooms]
  );

  return (
    <div className="relative min-h-screen w-full overflow-x-clip">
      {/* Background */}
      <div
        aria-hidden
        className="fixed inset-0 -z-10 bg-[radial-gradient(1200px_600px_at_80%_-10%,rgba(56,189,248,0.25),transparent_60%),radial-gradient(900px_500px_at_0%_0%,rgba(45,212,191,0.25),transparent_60%),linear-gradient(180deg,#ecfeff_0%,#f0fdfa_100%)]"
      />

      <div className="mx-auto w-full max-w-7xl px-4 pb-16 pt-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="rounded-3xl border border-white/60 bg-white/80 px-5 py-4 shadow backdrop-blur">
            <h1 className="text-2xl font-extrabold tracking-tight text-sky-800">
              🛠️ Staff Dashboard
            </h1>
            <p className="mt-0.5 text-sm text-sky-900/80">Tổng quan nhanh & lối tắt thao tác.</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/staff/show"
              className="rounded-2xl bg-gradient-to-r from-sky-600 to-cyan-600 px-4 py-2.5 font-semibold text-white shadow-lg shadow-sky-500/20 ring-1 ring-white/20 hover:brightness-105"
            >
              Quản lý Shows
            </Link>
            <Link
              href="/staff/transport"
              className="rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 px-4 py-2.5 font-semibold text-white shadow-lg shadow-emerald-500/20 ring-1 ring-white/20 hover:brightness-105"
            >
              Quản lý Transport
            </Link>

            {/* NEW: quản lý Hotel / Room */}
            <Link
              href="/staff/hotel"
              className="rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 font-semibold text-white shadow-lg shadow-indigo-500/20 ring-1 ring-white/20 hover:brightness-105"
            >
              Quản lý Hotel
            </Link>
            <Link
              href="/staff/room"
              className="rounded-2xl bg-gradient-to-r from-fuchsia-600 to-rose-600 px-4 py-2.5 font-semibold text-white shadow-lg shadow-rose-500/20 ring-1 ring-white/20 hover:brightness-105"
            >
              Quản lý Room
            </Link>
          </div>
        </div>

        {/* Metrics */}
        <section className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-6">
          <MetricCard title="Shows" value={metrics.totalShows} hint="Tổng số show" />
          <MetricCard title="Transports" value={metrics.totalTransports} hint="Hãng/loại" />
          <MetricCard title="Trips" value={metrics.totalTrips} hint="Chuyến đã cấu hình" />
          {/* NEW */}
          <MetricCard title="Hotels" value={metrics.totalHotels} hint="Tổng số khách sạn" />
          <MetricCard title="Rooms" value={metrics.totalRooms} hint="Tổng số phòng" />
          <MetricCard
            title="Ước tính chỗ/vé khả dụng"
            value={metrics.totalTickets.toLocaleString('vi-VN')}
            hint="Show + Trip + Rooms"
          />
        </section>

        {/* 2 columns: recent lists (Shows / Trips) */}
        <section className="grid gap-6 lg:grid-cols-2">
          <Card
            title="🗓️ Show sắp diễn ra"
            action={
              <Link className="link" href="/staff/show">
                Xem tất cả
              </Link>
            }
          >
            {loading ? (
              <ListSkeleton />
            ) : recentShows.length === 0 ? (
              <Empty text="Chưa có show." />
            ) : (
              <ul className="divide-y">
                {recentShows.map((s) => (
                  <li key={s.id} className="flex items-center justify-between py-3">
                    <div className="min-w-0">
                      <div className="truncate font-semibold text-slate-900">{s.name}</div>
                      <div className="text-xs text-slate-600">
                        {s.location} • {s.city} • {toLocal(s.startDate)}
                      </div>
                    </div>
                    <Link
                      href={`/staff/show`}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Quản lý
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card
            title="🚍 Trip gần đây"
            action={
              <Link className="link" href="/staff/transport">
                Xem tất cả
              </Link>
            }
          >
            {loading ? (
              <ListSkeleton />
            ) : recentTrips.length === 0 ? (
              <Empty text="Chưa có trip." />
            ) : (
              <ul className="divide-y">
                {recentTrips.map((t) => (
                  <li key={t.id} className="flex items-center justify-between py-3">
                    <div className="min-w-0">
                      <div className="truncate font-semibold text-slate-900">
                        {t.departure} → {t.destination}
                      </div>
                      <div className="text-xs text-slate-600">
                        Khởi hành: {toLocal(t.departureTime)} • Chỗ: {t.availableSeats}
                      </div>
                    </div>
                    <Link
                      href={`/staff/transport`}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Quản lý
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </section>

        {/* ===== NEW: 2 columns: recent hotels / recent rooms ===== */}
        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <Card
            title="🏨 Hotel mới tạo"
            action={
              <div className="flex items-center gap-2">
                <Link className="link" href="/staff/hotel/new">
                  Tạo Hotel
                </Link>
                <Link className="link" href="/staff/hotel">
                  Xem tất cả
                </Link>
              </div>
            }
          >
            {loading ? (
              <ListSkeleton />
            ) : recentHotels.length === 0 ? (
              <Empty text="Chưa có khách sạn." />
            ) : (
              <ul className="divide-y">
                {recentHotels.map((h) => (
                  <li key={h.id} className="flex items-center justify-between py-3">
                    <div className="min-w-0">
                      <div className="truncate font-semibold text-slate-900">
                        {h.name} — {h.city}, {h.country}
                      </div>
                      <div className="text-xs text-slate-600">
                        {h.address} • {toLocal(h.dateCreated)}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href={`/staff/room/new?hotelId=${h.id}`}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                        title="Tạo phòng cho khách sạn này"
                      >
                        + Room
                      </Link>
                      <Link
                        href={`/hotel/${h.id}`}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        Xem
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card
            title="🛏️ Room mới tạo"
            action={
              <div className="flex items-center gap-2">
                <Link className="link" href="/staff/room/new">
                  Tạo Room
                </Link>
                <Link className="link" href="/staff/room">
                  Xem tất cả
                </Link>
              </div>
            }
          >
            {loading ? (
              <ListSkeleton />
            ) : recentRooms.length === 0 ? (
              <Empty text="Chưa có phòng." />
            ) : (
              <ul className="divide-y">
                {recentRooms.map((r) => (
                  <li key={r.id} className="flex items-center justify-between py-3">
                    <div className="min-w-0">
                      <div className="truncate font-semibold text-slate-900">{r.roomType}</div>
                      <div className="text-xs text-slate-600">
                        Giá/đêm: {r.pricePerNight.toLocaleString('vi-VN')} • Sức chứa: {r.capacity}{' '}
                        • Còn: {r.availableRooms}
                      </div>
                    </div>
                    <Link
                      href={`/hotel/${r.hotelId}?room=${r.id}`}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Xem
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </section>

        {/* Quick actions */}
        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <QuickAction title="Tạo Show" desc="Thêm show mới và mở bán vé." href="/staff/show/new" />
          <QuickAction
            title="Tạo Transport / Trip"
            desc="Thêm hãng vận chuyển và các chuyến đi."
            href="/staff/transport/new"
          />
          {/* NEW */}
          <QuickAction title="Tạo Hotel" desc="Tạo khách sạn mới." href="/staff/hotel/new" />
          <QuickAction title="Tạo Room" desc="Tạo phòng cho khách sạn." href="/staff/room/new" />
        </section>

        {/* Error */}
        {err && (
          <div className="mt-6 rounded-xl border border-red-300/40 bg-red-50 px-3 py-2 text-sm text-red-700">
            {err}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- UI bits ---------- */
function MetricCard({
  title,
  value,
  hint,
}: {
  title: string;
  value: number | string;
  hint?: string;
}) {
  return (
    <div className="rounded-3xl border border-white/60 bg-white/80 p-4 shadow backdrop-blur">
      <div className="text-xs text-slate-600">{title}</div>
      <div className="mt-1 text-2xl font-extrabold text-slate-900">{value}</div>
      {hint && <div className="mt-0.5 text-xs text-slate-500">{hint}</div>}
    </div>
  );
}

function Card({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-white/60 bg-white/80 shadow backdrop-blur">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <h3 className="text-sm font-bold text-slate-900">{title}</h3>
        {action}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function QuickAction({ title, desc, href }: { title: string; desc: string; href: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-3xl border border-white/60 bg-gradient-to-r from-sky-100/70 to-teal-100/70 px-5 py-4 shadow hover:brightness-105"
    >
      <div>
        <div className="text-sm font-bold text-slate-900">{title}</div>
        <div className="text-xs text-slate-700">{desc}</div>
      </div>
      <span className="text-sky-700">→</span>
    </Link>
  );
}

function Empty({ text }: { text: string }) {
  return <div className="text-sm text-slate-600">{text}</div>;
}

function ListSkeleton() {
  return (
    <ul className="divide-y">
      {Array.from({ length: 5 }).map((_, i) => (
        <li key={i} className="py-3">
          <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200/70" />
          <div className="mt-2 h-3 w-1/3 animate-pulse rounded bg-slate-200/70" />
        </li>
      ))}
    </ul>
  );
}
