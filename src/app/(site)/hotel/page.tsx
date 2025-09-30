'use client';

import { useMemo, useState } from 'react';
import HotelCard from '@/components/hotel/HotelCard';
import { hotels } from '@/data/hotel.mock';
import HotelSearchBar, { type HotelSearchQuery } from '@/components/hotel/HotelSearchBar';

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

  const cityCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const h of hotels) map[h.city] = (map[h.city] ?? 0) + 1;
    return map;
  }, []);

  const filtered = useMemo(() => {
    const kw = query.city.trim().toLowerCase();
    if (!kw) return hotels;
    return hotels.filter(
      (h) => h.city.toLowerCase().includes(kw) || h.name.toLowerCase().includes(kw)
    );
  }, [query.city]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* tăng width để card thoáng hơn */}
      <h1 className="mb-6 text-2xl font-bold">Tất cả khách sạn</h1>

      <HotelSearchBar
        initial={query}
        onSearch={setQuery}
        cityCounts={cityCounts}
        className="mb-6"
      />

      {/* List dọc thay vì grid 3 cột */}
      <div className="space-y-4">
        {filtered.map((hotel) => (
          <HotelCard key={hotel.id} hotel={hotel} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="mt-8 text-sm text-zinc-600">Không tìm thấy khách sạn phù hợp.</p>
      )}
    </div>
  );
}
