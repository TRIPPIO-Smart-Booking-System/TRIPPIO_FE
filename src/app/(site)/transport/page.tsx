'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import TransportSearchBar, { TransportSearch } from '@/components/transport/TransportSearchBar';
import TransportCard from '@/components/transport/TransportCard';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:7142';

export type ApiTransportTrip = {
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
  transport: string | null;
};

export type ApiTransport = {
  id: string;
  transportType: string;
  name: string;
  dateCreated: string;
  modifiedDate: string | null;
  transportTrips?: ApiTransportTrip[];
};

export default function TransportPage() {
  const router = useRouter();

  const [query, setQuery] = useState<TransportSearch>({
    from: '',
    to: '',
    date: '',
    time: '',
    passengers: 1,
  });

  const [transports, setTransports] = useState<ApiTransport[]>([]);
  const [trips, setTrips] = useState<ApiTransportTrip[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr(null);

        const [resT, resTrips] = await Promise.all([
          fetch(`${API_BASE}/api/Transport`, { cache: 'no-store' }),
          fetch(`${API_BASE}/api/TransportTrip`, { cache: 'no-store' }),
        ]);
        if (!resT.ok) throw new Error(`Transport HTTP ${resT.status}`);
        if (!resTrips.ok) throw new Error(`TransportTrip HTTP ${resTrips.status}`);

        const tJson: unknown = await resT.json();
        const tripsJson: unknown = await resTrips.json();

        setTransports(Array.isArray(tJson) ? (tJson as ApiTransport[]) : []);
        setTrips(Array.isArray(tripsJson) ? (tripsJson as ApiTransportTrip[]) : []);
      } catch (e: unknown) {
        setErr(e instanceof Error ? e.message : 'Fetch failed');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const transportsWithTrips: ApiTransport[] = useMemo(() => {
    const byTransport = new Map<string, ApiTransportTrip[]>();
    for (const tr of trips) {
      const arr = byTransport.get(tr.transportId) ?? [];
      arr.push(tr);
      byTransport.set(tr.transportId, arr);
    }
    for (const arr of byTransport.values()) {
      arr.sort((a, b) => +new Date(a.departureTime) - +new Date(b.departureTime));
    }
    return transports.map((t) => ({ ...t, transportTrips: byTransport.get(t.id) ?? [] }));
  }, [transports, trips]);

  const citySet = useMemo(() => {
    const s = new Set<string>();
    trips.forEach((tr) => {
      if (tr.departure) s.add(tr.departure);
      if (tr.destination) s.add(tr.destination);
    });
    return Array.from(s).sort((a, b) => a.localeCompare(b));
  }, [trips]);

  const filtered = useMemo(() => {
    const { from, to, date, passengers } = query;

    const res = transportsWithTrips.map((t) => {
      const nextTrips = (t.transportTrips ?? []).filter((tr) => {
        const okFrom = !from || tr.departure.toLowerCase() === from.toLowerCase();
        const okTo = !to || tr.destination.toLowerCase() === to.toLowerCase();
        const okDate = !date || tr.departureTime.slice(0, 10) >= date;
        const okSeat = (tr.availableSeats ?? 0) >= passengers;
        return okFrom && okTo && okDate && okSeat;
      });
      return { ...t, transportTrips: nextTrips };
    });

    const rank: Record<string, number> = { Airline: 1, Train: 2, Bus: 3 };
    res.sort(
      (a, b) =>
        (rank[a.transportType] ?? 9) - (rank[b.transportType] ?? 9) || a.name.localeCompare(b.name)
    );

    return res;
  }, [transportsWithTrips, query]);

  const totalTrips = useMemo(
    () => filtered.reduce((sum, t) => sum + (t.transportTrips?.length ?? 0), 0),
    [filtered]
  );

  const grouped = useMemo(() => {
    const m = new Map<string, ApiTransport[]>();
    filtered.forEach((t) => {
      const key = t.transportType || 'Other';
      const arr = m.get(key) ?? [];
      arr.push(t);
      m.set(key, arr);
    });
    return Array.from(m.entries());
  }, [filtered]);

  return (
    // 🔒 chặn tràn ngang + full width
    <div className="relative min-h-screen w-full overflow-x-clip">
      {/* 🎨 nền: fixed + gradient nhẹ, KHÔNG phủ trắng cuối trang */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 bg-gradient-to-b from-sky-100/60 via-teal-100/40 to-transparent"
      />
      {/* container full-bleed (không giới hạn max-width) */}
      <div className="w-full px-3 pb-16 pt-6 sm:px-6 lg:px-10">
        {/* Header card full width */}
        <header className="mb-4">
          <div className="w-full rounded-3xl border border-white/60 bg-white/90 p-4 shadow-xl backdrop-blur md:p-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="min-w-0">
                <h1 className="truncate text-2xl font-extrabold tracking-tight text-sky-800 md:text-3xl">
                  🚐 Đặt phương tiện A → B
                </h1>
                <p className="mt-1 text-sky-900/80">
                  Chọn điểm đi, điểm đến và ngày khởi hành — dữ liệu chuyến lấy từ{' '}
                  <code>TransportTrip</code>.
                </p>
              </div>
              <div className="shrink-0 rounded-full bg-sky-600/10 px-4 py-2 text-sm font-semibold text-sky-800">
                {totalTrips} chuyến phù hợp
              </div>
            </div>
          </div>
        </header>

        {/* Search bar full width */}
        <div className="mb-6 w-full rounded-3xl border border-white/60 bg-white/90 p-3 backdrop-blur md:p-4">
          <TransportSearchBar
            initial={query}
            cities={citySet}
            onSearch={setQuery}
            className="w-full"
          />
        </div>

        {loading && (
          <div className="mb-3 rounded-xl border border-sky-200/60 bg-sky-50/70 p-3 text-sm text-sky-900/80">
            Đang tải dữ liệu…
          </div>
        )}
        {err && (
          <div className="mb-3 rounded-xl border border-red-200/60 bg-red-50/70 p-3 text-sm font-medium text-red-700">
            Lỗi: {err}
          </div>
        )}

        {/* Các nhóm — mỗi card căng 100% chiều ngang */}
        <div className="space-y-8">
          {grouped.map(([type, items]) => {
            const icon = /air/i.test(type)
              ? '✈️'
              : /train/i.test(type)
                ? '🚆'
                : /bus/i.test(type)
                  ? '🚌'
                  : '🚗';
            const count = items.reduce((s, t) => s + (t.transportTrips?.length ?? 0), 0);

            return (
              <section key={type} className="min-w-0">
                <div className="mb-3 flex items-center gap-2 px-1">
                  <span className="text-xl">{icon}</span>
                  <h2 className="text-xl font-semibold">{type}</h2>
                  <span className="rounded-full bg-sky-600/10 px-2.5 py-0.5 text-xs font-semibold text-sky-800">
                    {count} chuyến
                  </span>
                </div>

                {/* 1 cột – card chiếm full chiều ngang */}
                <div className="min-w-0">
                  {items.map((t) => (
                    <div key={t.id} className="min-w-0">
                      <TransportCard
                        transport={t}
                        passengers={query.passengers}
                        onBook={(trip) => router.push(`/transport/trip/${trip.id}`)}
                        // gợi ý: trong TransportCard wrapper thêm className dưới để chắc chắn full width
                        // className="w-full min-w-0 overflow-hidden rounded-2xl border bg-white/95 shadow-sm"
                      />
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        {!loading && !err && totalTrips === 0 && (
          <div className="mt-6 rounded-2xl border border-white/60 bg-white/90 p-6 text-center text-sky-900/80 backdrop-blur">
            Không có chuyến nào khớp bộ lọc. Hãy thử đổi ngày/điểm đi/điểm đến hoặc để trống ngày để
            xem toàn bộ chuyến.
          </div>
        )}
      </div>
    </div>
  );
}
