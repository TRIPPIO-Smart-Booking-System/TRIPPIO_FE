'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { tours as allTours, Tour } from '@/data/tours';
import TourCard from '@/components/Card/tours/TourCard';

/* ===== Helpers & Types ===== */
type SortKey = 'popular' | 'rating' | 'price-asc' | 'price-desc';
type TimeRange = 'any' | '1d' | '2d' | '3d' | '4d+';
type MinRating = 'any' | 5 | 4.5 | 4.0 | 3.5;
type Destination = 'any' | string;

const getDays = (duration: string) => {
  const n = parseInt(duration.split(' ')[0] ?? '0', 10);
  return Number.isFinite(n) ? n : 0;
};

export default function ToursPage() {
  /* ===== Filter state ===== */
  const [q, setQ] = useState('');
  const [timeRange, setTimeRange] = useState<TimeRange>('any');
  const [minRating, setMinRating] = useState<MinRating>('any');
  const [dest, setDest] = useState<Destination>('any');
  const [sortBy, setSortBy] = useState<SortKey>('popular');

  /* ===== Dropdown refs & auto-close ===== */
  const refTime = useRef<HTMLDetailsElement>(null);
  const refRating = useRef<HTMLDetailsElement>(null);
  const refDest = useRef<HTMLDetailsElement>(null);
  const refSort = useRef<HTMLDetailsElement>(null);

  const closeAll = () => {
    refTime.current?.removeAttribute('open');
    refRating.current?.removeAttribute('open');
    refDest.current?.removeAttribute('open');
    refSort.current?.removeAttribute('open');
  };

  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      const inside =
        refTime.current?.contains(t) ||
        refRating.current?.contains(t) ||
        refDest.current?.contains(t) ||
        refSort.current?.contains(t);
      if (!inside) closeAll();
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeAll();
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  /* ===== Options ===== */
  const timeOptions: { k: TimeRange; label: string; test: (d: number) => boolean }[] = [
    { k: 'any', label: 'Bất kỳ', test: () => true },
    { k: '1d', label: '1 ngày', test: (d) => d <= 1 },
    { k: '2d', label: '≤ 2 ngày', test: (d) => d <= 2 },
    { k: '3d', label: '3 ngày', test: (d) => d === 3 },
    { k: '4d+', label: '≥ 4 ngày', test: (d) => d >= 4 },
  ];
  const ratingOptions: { k: MinRating; label: string }[] = [
    { k: 'any', label: 'Bất kỳ' },
    { k: 5, label: 'Từ 5★' },
    { k: 4.5, label: 'Từ 4.5★' },
    { k: 4.0, label: 'Từ 4.0★' },
    { k: 3.5, label: 'Từ 3.5★' },
  ];
  const sortOptions: { k: SortKey; label: string }[] = [
    { k: 'popular', label: 'Phổ biến (nhiều review)' },
    { k: 'rating', label: 'Đánh giá cao' },
    { k: 'price-asc', label: 'Giá: Thấp → Cao' },
    { k: 'price-desc', label: 'Giá: Cao → Thấp' },
  ];
  const destinations = useMemo<Destination[]>(() => {
    const set = new Set<string>();
    allTours.forEach((t) => set.add(t.destination.split(',')[0].trim()));
    return ['any', ...Array.from(set)];
  }, []);

  /* ===== Filter + sort ===== */
  const tours = useMemo(() => {
    const qNorm = q.trim().toLowerCase();

    const arr = allTours.filter((t) => {
      const days = getDays(t.duration);
      const timeOk = timeOptions.find((x) => x.k === timeRange)!.test(days);
      const ratingOk = minRating === 'any' ? true : t.rating >= minRating;
      const destOk =
        dest === 'any'
          ? true
          : t.destination.toLowerCase().includes((dest as string).toLowerCase());
      const qOk =
        !qNorm ||
        t.title.toLowerCase().includes(qNorm) ||
        t.destination.toLowerCase().includes(qNorm) ||
        t.description.toLowerCase().includes(qNorm);
      return timeOk && ratingOk && destOk && qOk;
    });

    arr.sort((a, b) => {
      if (sortBy === 'popular') return b.reviews - a.reviews;
      if (sortBy === 'rating') return b.rating - a.rating || b.reviews - a.reviews;
      if (sortBy === 'price-asc') return a.price - b.price;
      return b.price - a.price; // price-desc
    });

    return arr;
  }, [q, timeRange, minRating, dest, sortBy]);

  const resetFilters = () => {
    setQ('');
    setTimeRange('any');
    setMinRating('any');
    setDest('any');
    setSortBy('popular');
    closeAll();
  };

  /* ===== Dynamic labels on chips ===== */
  const timeLabel = timeOptions.find((o) => o.k === timeRange)?.label ?? 'Thời lượng';
  const ratingLabel = ratingOptions.find((o) => o.k === minRating)?.label ?? 'Đánh giá';
  const destLabel = dest === 'any' ? 'Điểm đến' : (dest as string);
  const sortLabel = sortOptions.find((o) => o.k === sortBy)?.label ?? 'Sắp xếp';
  const chip = (active: boolean) =>
    `flex cursor-pointer select-none items-center gap-2 rounded-full px-4 py-2 text-sm shadow-sm transition
     ${active ? 'bg-black text-white hover:bg-black/90' : 'bg-zinc-100 hover:bg-zinc-200'}`;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:py-14">
      {/* Header */}
      <div className="flex flex-col items-center text-center">
        <h1 className="text-3xl font-bold sm:text-4xl">Danh sách tours</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Khám phá các tour du lịch hấp dẫn của chúng tôi
        </p>
      </div>

      {/* Filter bar (sticky + blur) */}
      <div className="sticky top-16 z-20 mt-8 rounded-2xl border bg-white/80 p-3 shadow-sm backdrop-blur sm:top-20">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          {/* Search */}
          <div className="flex flex-1 items-center gap-2 rounded-xl border px-3 py-2">
            <svg width="18" height="18" viewBox="0 0 24 24" className="opacity-60">
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" fill="none" />
              <path d="m21 21-3.5-3.5" stroke="currentColor" strokeWidth="2" />
            </svg>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm theo tên, điểm đến, mô tả…"
              className="h-8 w-full bg-transparent text-sm outline-none"
            />
          </div>

          {/* Chips */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Time */}
            <details ref={refTime} className="group relative">
              <summary className={chip(timeRange !== 'any')}>
                {timeLabel}
                <svg width="12" height="12" viewBox="0 0 24 24" className="opacity-70">
                  <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" fill="none" />
                </svg>
              </summary>
              <div className="absolute right-0 z-30 mt-2 w-44 overflow-hidden rounded-xl border bg-white p-1 shadow-lg">
                {timeOptions.map((o) => (
                  <button
                    key={o.k}
                    onClick={() => {
                      setTimeRange(o.k);
                      refTime.current?.removeAttribute('open');
                    }}
                    className={`w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-zinc-100 ${
                      timeRange === o.k ? 'bg-zinc-100 font-medium' : ''
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </details>

            {/* Rating */}
            <details ref={refRating} className="group relative">
              <summary className={chip(minRating !== 'any')}>
                {ratingLabel}
                <svg width="12" height="12" viewBox="0 0 24 24" className="opacity-70">
                  <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" fill="none" />
                </svg>
              </summary>
              <div className="absolute right-0 z-30 mt-2 w-40 overflow-hidden rounded-xl border bg-white p-1 shadow-lg">
                {ratingOptions.map((o) => (
                  <button
                    key={o.k.toString()}
                    onClick={() => {
                      setMinRating(o.k);
                      refRating.current?.removeAttribute('open');
                    }}
                    className={`w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-zinc-100 ${
                      minRating === o.k ? 'bg-zinc-100 font-medium' : ''
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </details>

            {/* Destination */}
            <details ref={refDest} className="group relative">
              <summary className={chip(dest !== 'any')}>
                {destLabel}
                <svg width="12" height="12" viewBox="0 0 24 24" className="opacity-70">
                  <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" fill="none" />
                </svg>
              </summary>
              <div className="absolute right-0 z-30 mt-2 max-h-72 w-56 overflow-auto rounded-xl border bg-white p-1 shadow-lg">
                {destinations.map((d) => (
                  <button
                    key={d.toString()}
                    onClick={() => {
                      setDest(d);
                      refDest.current?.removeAttribute('open');
                    }}
                    className={`w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-zinc-100 ${
                      dest === d ? 'bg-zinc-100 font-medium' : ''
                    }`}
                  >
                    {d === 'any' ? 'Bất kỳ' : d}
                  </button>
                ))}
              </div>
            </details>

            {/* Sort */}
            <details ref={refSort} className="group relative">
              <summary className={chip(sortBy !== 'popular')}>
                {sortLabel}
                <svg width="12" height="12" viewBox="0 0 24 24" className="opacity-70">
                  <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" fill="none" />
                </svg>
              </summary>
              <div className="absolute right-0 z-30 mt-2 w-52 overflow-hidden rounded-xl border bg-white p-1 shadow-lg">
                {sortOptions.map((o) => (
                  <button
                    key={o.k}
                    onClick={() => {
                      setSortBy(o.k);
                      refSort.current?.removeAttribute('open');
                    }}
                    className={`w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-zinc-100 ${
                      sortBy === o.k ? 'bg-zinc-100 font-medium' : ''
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </details>

            {/* Reset */}
            <button
              onClick={resetFilters}
              className="rounded-full border px-4 py-2 text-sm hover:bg-zinc-50"
              title="Xóa tất cả bộ lọc"
            >
              Xóa lọc
            </button>
          </div>
        </div>
      </div>

      {/* Counter */}
      <div className="mt-4 text-sm text-muted-foreground">
        Tìm thấy <span className="font-medium text-foreground">{tours.length}</span> tour phù hợp
      </div>

      {/* Grid */}
      <div
        className="
          mt-6 grid gap-6 md:gap-8
          grid-cols-[repeat(auto-fill,minmax(320px,1fr))]
        "
      >
        {tours.map((tour: Tour) => (
          <div key={tour.id} className="h-full">
            <TourCard tour={tour} />
          </div>
        ))}
      </div>
    </div>
  );
}
