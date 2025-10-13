'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { tours } from '@/data/tours';
import TopFamousTourCard from '../Card/topFamousCard/TopFamousTourCard';

// Swiper
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

type SortKey = 'rating' | 'price' | 'reviews';
type TimeRange = 'any' | '2d' | '3d' | '4d+';
type PriceOrder = 'any' | 'asc' | 'desc';

export default function FeaturedTopTours() {
  const [timeRange, setTimeRange] = useState<TimeRange>('any');
  const [sortBy, setSortBy] = useState<SortKey>('rating');
  const [priceOrder, setPriceOrder] = useState<PriceOrder>('any');

  // refs cho 3 dropdown
  const timeRef = useRef<HTMLDetailsElement>(null);
  const sortRef = useRef<HTMLDetailsElement>(null);
  const priceRef = useRef<HTMLDetailsElement>(null);

  // đóng tất cả dropdown
  const closeAll = () => {
    timeRef.current?.removeAttribute('open');
    sortRef.current?.removeAttribute('open');
    priceRef.current?.removeAttribute('open');
  };

  // click ra ngoài -> đóng
  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      const insideTime = timeRef.current?.contains(target);
      const insideSort = sortRef.current?.contains(target);
      const insidePrice = priceRef.current?.contains(target);
      if (!insideTime && !insideSort && !insidePrice) closeAll();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeAll();
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  // gắn status như mock
  const withStatus = useMemo(() => {
    const base = tours.slice(0, 12);
    return base.map((t, i) => {
      if (i % 3 === 0) return { tour: t, status: { type: 'top-rated' } as const };
      if (i % 3 === 1) return { tour: t, status: { type: 'best-sale' } as const };
      return { tour: t, status: { type: 'discount', percent: 25 } as const };
    });
  }, []);

  // lọc + sắp xếp
  const filtered = useMemo(() => {
    let arr = [...withStatus];

    if (timeRange !== 'any') {
      arr = arr.filter(({ tour }) => {
        const days = parseInt(tour.duration.split(' ')[0] ?? '0', 10);
        if (timeRange === '2d') return days <= 2;
        if (timeRange === '3d') return days === 3;
        return days >= 4;
      });
    }

    arr.sort((a, b) => {
      if (sortBy === 'rating') {
        return b.tour.rating - a.tour.rating || b.tour.reviews - a.tour.reviews;
      }
      if (sortBy === 'reviews') return b.tour.reviews - a.tour.reviews;
      return b.tour.price - a.tour.price;
    });

    if (priceOrder !== 'any') {
      arr.sort((a, b) =>
        priceOrder === 'asc' ? a.tour.price - b.tour.price : b.tour.price - a.tour.price
      );
    }
    return arr;
  }, [withStatus, timeRange, sortBy, priceOrder]);

  const timeRangeOptions: { k: TimeRange; label: string }[] = [
    { k: 'any', label: 'Bất kỳ' },
    { k: '2d', label: '≤ 2 ngày' },
    { k: '3d', label: '3 ngày' },
    { k: '4d+', label: '≥ 4 ngày' },
  ];
  const sortOptions: { k: SortKey; label: string }[] = [
    { k: 'rating', label: 'Cao → Thấp (rating)' },
    { k: 'reviews', label: 'Nhiều đánh giá' },
    { k: 'price', label: 'Giá cao' },
  ];
  const priceOptions: { k: PriceOrder; label: string }[] = [
    { k: 'any', label: 'Bất kỳ' },
    { k: 'asc', label: 'Thấp → Cao' },
    { k: 'desc', label: 'Cao → Thấp' },
  ];

  return (
    <section className="py-12 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Title + filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-3xl font-bold sm:text-4xl">
              Các tour du lịch nổi bật của chúng tôi
            </h2>
            <p className="mt-2 text-muted-foreground">
              Điểm đến yêu thích dựa trên đánh giá của khách hàng
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* time */}
            <details ref={timeRef} className="group relative">
              <summary className="flex cursor-pointer select-none items-center gap-2 rounded-full bg-zinc-100 px-4 py-2 text-sm shadow-sm transition hover:bg-zinc-200">
                Khoảng thời gian
                <svg width="14" height="14" viewBox="0 0 24 24" className="opacity-60">
                  <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" fill="none" />
                </svg>
              </summary>
              <div className="absolute right-0 z-20 mt-2 w-44 overflow-hidden rounded-xl border bg-white p-1 shadow-lg">
                {timeRangeOptions.map((o) => (
                  <button
                    key={o.k}
                    onClick={() => {
                      setTimeRange(o.k);
                      timeRef.current?.removeAttribute('open');
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

            {/* sort */}
            <details ref={sortRef} className="group relative">
              <summary className="flex cursor-pointer select-none items-center gap-2 rounded-full bg-zinc-100 px-4 py-2 text-sm shadow-sm transition hover:bg-zinc-200">
                Đánh giá / Xếp hạng
                <svg width="14" height="14" viewBox="0 0 24 24" className="opacity-60">
                  <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" fill="none" />
                </svg>
              </summary>
              <div className="absolute right-0 z-20 mt-2 w-48 overflow-hidden rounded-xl border bg-white p-1 shadow-lg">
                {sortOptions.map((o) => (
                  <button
                    key={o.k}
                    onClick={() => {
                      setSortBy(o.k);
                      sortRef.current?.removeAttribute('open');
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

            {/* price */}
            <details ref={priceRef} className="group relative">
              <summary className="flex cursor-pointer select-none items-center gap-2 rounded-full bg-zinc-100 px-4 py-2 text-sm shadow-sm transition hover:bg-zinc-200">
                Giá
                <svg width="14" height="14" viewBox="0 0 24 24" className="opacity-60">
                  <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" fill="none" />
                </svg>
              </summary>
              <div className="absolute right-0 z-20 mt-2 w-40 overflow-hidden rounded-xl border bg-white p-1 shadow-lg">
                {priceOptions.map((o) => (
                  <button
                    key={o.k}
                    onClick={() => {
                      setPriceOrder(o.k);
                      priceRef.current?.removeAttribute('open');
                    }}
                    className={`w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-zinc-100 ${
                      priceOrder === o.k ? 'bg-zinc-100 font-medium' : ''
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </details>
          </div>
        </div>

        {/* Swiper slider */}
        <div className="mt-8 ftt-swiper">
          <Swiper
            modules={[Navigation]}
            navigation
            spaceBetween={24}
            slidesPerView={1.05}
            breakpoints={{
              640: { slidesPerView: 2.05, spaceBetween: 24 },
              1024: { slidesPerView: 3.05, spaceBetween: 28 },
            }}
          >
            {filtered.map(({ tour, status }) => (
              <SwiperSlide key={tour.id} className="pb-6">
                <TopFamousTourCard tour={tour} status={status} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
}
