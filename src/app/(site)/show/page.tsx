'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import ShowCard from '@/components/show/ShowCard';
import { getShowImageByIndex } from '@/lib/imageLoader';
import { getCachedShows, preloadAllData, type ApiShow } from '@/lib/dataCache';

type Filters = {
  city: string;
  date: string; // YYYY-MM-DD
  currency: 'VND' | 'USD';
};

export default function ShowListPage() {
  const [shows, setShows] = useState<ApiShow[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [err, setErr] = useState<string | null>(null);
  const [headerImage, setHeaderImage] = useState<string>('');

  const [filters, setFilters] = useState<Filters>({
    city: '',
    date: '',
    currency: 'VND',
  });

  // chỉ mở 1 card
  const [openId, setOpenId] = useState<string | null>(null);

  // Load show header image
  useEffect(() => {
    const headerImg = getShowImageByIndex(0); // First show image
    setHeaderImage(headerImg);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr(null);

        // Try to get cached data first
        let cachedShows = getCachedShows();

        // If not cached, preload and fetch
        if (!cachedShows) {
          await preloadAllData();
          cachedShows = getCachedShows();
        }

        setShows(cachedShows || []);
      } catch (e: unknown) {
        setErr(e instanceof Error ? e.message : 'Fetch failed');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // lấy yyyy-mm-dd an toàn từ chuỗi ISO
  const dateStr = (d?: string | Date | null): string => {
    if (!d) return '';
    if (typeof d === 'string') {
      const t = d.split('T')[0] || d; // supports "YYYY-MM-DDTHH:mm:ssZ" or already "YYYY-MM-DD"
      // crude validate "YYYY-MM-DD"
      if (/^\d{4}-\d{2}-\d{2}$/.test(t)) return t;
      // fallback: parse
      const p = new Date(d);
      if (!Number.isNaN(p.getTime())) {
        const y = p.getFullYear();
        const m = String(p.getMonth() + 1).padStart(2, '0');
        const day = String(p.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
      }
      return '';
    }
    const dd = new Date(d);
    if (Number.isNaN(dd.getTime())) return '';
    const y = dd.getFullYear();
    const m = String(dd.getMonth() + 1).padStart(2, '0');
    const day = String(dd.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  // milliseconds for sorting (invalid -> +Infinity to push to end)
  const dateMs = (d?: string | Date | null): number => {
    if (!d) return Number.POSITIVE_INFINITY;
    const ms = new Date(d).getTime();
    return Number.isNaN(ms) ? Number.POSITIVE_INFINITY : ms;
  };

  // danh sách city
  const cities = useMemo(() => {
    const s = new Set<string>();
    shows.forEach((x) => x?.city && s.add(String(x.city)));
    return Array.from(s).sort((a, b) => a.localeCompare(b));
  }, [shows]);

  // lọc + sắp xếp
  const filtered = useMemo(() => {
    const { city, date } = filters;
    const list = shows.filter((s) => {
      const sCity = String(s?.city ?? '').toLowerCase();
      const okCity = !city || sCity === city.toLowerCase();

      const sStart = dateStr(s.startDate);
      const sEnd = dateStr(s.endDate);
      const okDate = !date || (!!sStart && !!sEnd && sStart <= date && sEnd >= date);

      return okCity && okDate;
    });

    return [...list].sort((a, b) => dateMs(a.startDate) - dateMs(b.startDate));
  }, [shows, filters]);

  // nếu item đang mở không còn sau khi lọc -> đóng
  useEffect(() => {
    if (openId && !filtered.some((x) => String(x.id) === openId)) {
      setOpenId(null);
    }
  }, [filtered, openId]);

  return (
    <div className="relative">
      {/* Hero Banner with Show Image */}
      {headerImage && (
        <div className="relative h-48 w-full overflow-hidden md:h-64 lg:h-80">
          <Image
            src={headerImage}
            alt="Show header"
            fill
            className="object-cover"
            unoptimized
            priority
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
            <h1 className="text-3xl font-bold md:text-4xl lg:text-5xl">🎭 Buổi biểu diễn</h1>
            <p className="mt-2 text-sm md:text-base">Những buổi biểu diễn hấp dẫn tại Việt Nam</p>
          </div>
        </div>
      )}

      {/* ====== BACKGROUND ====== */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-20 bg-cover bg-center"
        style={{ backgroundImage: "url('/img/parks/waterpark-hero.jpg')" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at 30% 10%, rgba(56,189,248,0.35), transparent 60%), radial-gradient(ellipse at 70% 20%, rgba(45,212,191,0.35), transparent 60%), url('/img/parks/pattern-bubbles.png')",
          backgroundSize: 'auto, auto, 280px 280px',
          backgroundRepeat: 'no-repeat, no-repeat, repeat',
          filter: 'saturate(1.05)',
        }}
      />
      <div aria-hidden className="absolute inset-0 -z-5 bg-white/40 backdrop-blur-[2px]" />

      {/* ====== CONTENT ====== */}
      <div className="mx-auto max-w-7xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
        <header className="mb-6">
          <div className="rounded-3xl border border-white/40 bg-white/60 p-6 shadow-xl backdrop-blur">
            <h1 className="text-3xl font-extrabold tracking-tight text-sky-800">
              🎡 Vé sự kiện & show giải trí
            </h1>
            <p className="mt-1 text-sky-900/80">
              Chọn show yêu thích và đặt vé ngay — sắc màu công viên nước: mát lạnh, sôi động, vui
              cực!
            </p>
          </div>
        </header>

        {/* FILTERS */}
        <div className="mb-4 rounded-3xl bg-white/60 p-[2px] shadow-xl backdrop-blur">
          <div className="rounded-[22px] bg-gradient-to-r from-sky-300/50 via-cyan-300/50 to-teal-300/50 p-3">
            <div className="grid gap-3 rounded-[18px] border border-white/50 bg-white/70 p-3 md:grid-cols-4">
              <div>
                <div className="mb-1 text-xs text-sky-900/70">Tỉnh/Thành</div>
                <select
                  value={filters.city}
                  onChange={(e) => setFilters((f) => ({ ...f, city: e.target.value }))}
                  className="h-11 w-full rounded-xl border border-sky-200/70 bg-white/80 px-3 outline-none focus:ring-2 focus:ring-sky-200"
                >
                  <option value="">Tất cả</option>
                  {cities.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="mb-1 text-xs text-sky-900/70">Ngày tham gia</div>
                <input
                  type="date"
                  value={filters.date}
                  onChange={(e) => setFilters((f) => ({ ...f, date: e.target.value }))}
                  className="h-11 w-full rounded-xl border border-sky-200/70 bg-white/80 px-3 outline-none focus:ring-2 focus:ring-sky-200"
                />
              </div>

              <div>
                <div className="mb-1 text-xs text-sky-900/70">Tiền tệ</div>
                <select
                  value={filters.currency}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, currency: e.target.value as 'VND' | 'USD' }))
                  }
                  className="h-11 w-full rounded-xl border border-sky-200/70 bg-white/80 px-3 outline-none focus:ring-2 focus:ring-sky-200"
                >
                  <option value="VND">VND</option>
                  <option value="USD">USD</option>
                </select>
              </div>

              <div className="flex items-end">
                <div className="w-full rounded-xl bg-gradient-to-r from-sky-400 via-cyan-400 to-teal-400 p-[2px]">
                  <div className="flex h-11 items-center justify-center rounded-[10px] bg-white/90 text-sm font-semibold text-sky-700">
                    {filtered.length} sự kiện phù hợp
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* STATES */}
        {loading && <div className="text-sm text-sky-900/80">Đang tải các show…</div>}
        {err && <div className="text-sm font-medium text-red-700">Lỗi tải dữ liệu: {err}</div>}

        {/* WAVES DIVIDER */}
        <div aria-hidden className="my-6">
          <svg
            className="h-8 w-full text-cyan-300/60"
            viewBox="0 0 1440 100"
            preserveAspectRatio="none"
          >
            <path
              fill="currentColor"
              d="M0,64L48,69.3C96,75,192,85,288,85.3C384,85,480,75,576,80C672,85,768,107,864,112C960,117,1056,107,1152,96C1248,85,1344,75,1392,69.3L1440,64L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
            />
          </svg>
        </div>

        {/* GRID */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((show, index) => {
            const id = String(show.id);
            return (
              <ShowCard
                key={id}
                show={show}
                currency={filters.currency}
                isOpen={openId === id}
                onToggle={() => setOpenId((prev) => (prev === id ? null : id))}
                imageIndex={index}
              />
            );
          })}
        </div>

        {!loading && !err && !filtered.length && (
          <div className="mt-6 rounded-2xl border border-white/60 bg-white/80 p-6 text-center text-sky-900/80 backdrop-blur">
            Không có show nào khớp bộ lọc. Thử đổi ngày hoặc địa điểm nhé!
          </div>
        )}
      </div>
    </div>
  );
}
