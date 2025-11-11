/* eslint react/prop-types: 0 */
'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { showSuccess, showError } from '@/lib/toast';
import {
  Plane,
  Luggage,
  ShieldCheck,
  Info,
  Clock,
  ArrowRightLeft,
  Ticket,
  Users,
  Baby,
  BriefcaseBusiness,
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:7142';

/* ===== Types ===== */
type Currency = 'VND' | 'USD';

type ApiTransportTrip = {
  id: string;
  transportId: string;
  departure: string;
  destination: string;
  departureTime: string; // ISO
  arrivalTime: string; // ISO
  price: number; // base fare / pax (USD) giả định
  availableSeats: number;
  dateCreated: string;
  modifiedDate: string | null;
  transport: string | null;
};

type ApiTransport = {
  id: string;
  transportType: string; // Airline | Bus | Train | ...
  name: string;
  dateCreated: string;
  modifiedDate: string | null;
};

type ApiFlight = {
  id: string;
  airline: string;
  from: string;
  to: string;
  departTime: string; // ISO
  arriveTime: string; // ISO
  basePrice: number;
};

/* ===== Local cart fallback (chỉ dùng khi API basket fail) ===== */
type CartItemLocal = {
  kind: 'transport';
  vendorId: string;
  vendorName: string;
  transportType: string;
  tripId: string;
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
  qty: number;
  price: number; // USD / pax
  currency: Currency;
  cabin: CabinClass;
  bags: number;
  adults: number;
  children: number;
  taxesUSD: number;
  baggageUSD: number;
  totalUSD: number;
};

type CabinClass = 'ECONOMY' | 'BUSINESS';

const CART_KEY = 'tripio_cart';
const BASKET_META_KEY = 'basket_item_meta';

/* ===== FX & Utils hiển thị ===== */
// Dùng 25_000 VND cho 1 USD để hiển thị
const FX_VND = 25_000;

const displayPrice = (usd: number, c: Currency) => (c === 'VND' ? usd * FX_VND : usd);
const money = (n: number, c: Currency = 'VND') =>
  n.toLocaleString(c === 'VND' ? 'vi-VN' : 'en-US', {
    style: 'currency',
    currency: c,
    maximumFractionDigits: c === 'VND' ? 0 : 2,
  });

const dt = (iso?: string) => {
  const d = iso ? new Date(iso) : null;
  return d && !isNaN(+d)
    ? d.toLocaleString('vi-VN', {
        weekday: 'short',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—';
};
const duration = (start?: string, end?: string) => {
  if (!start || !end) return '—';
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  if (isNaN(s) || isNaN(e) || e <= s) return '—';
  const mins = Math.round((e - s) / (1000 * 60));
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h${m ? ` ${m}m` : ''}`;
};

/* ===== Local cart & auth helpers ===== */
function addToCartLocal(item: CartItemLocal) {
  try {
    const raw = localStorage.getItem(CART_KEY);
    const arr: CartItemLocal[] = raw ? JSON.parse(raw) : [];
    arr.push(item);
    localStorage.setItem(CART_KEY, JSON.stringify(arr));
    window.dispatchEvent(new Event('cart:changed'));
    window.dispatchEvent(new Event('basket:changed'));
  } catch {}
}

function getToken(): string | null {
  try {
    return localStorage.getItem('authToken') ?? localStorage.getItem('accessToken') ?? null;
  } catch {
    return null;
  }
}
function getUserId(): string | null {
  try {
    const cached = localStorage.getItem('userId');
    if (cached) return cached;
    const token = getToken();
    if (!token) return null;
    const [, payload] = token.split('.');
    const json = JSON.parse(atob(payload));
    const id = json?.id || json?.userId || json?.sub;
    if (id) localStorage.setItem('userId', id);
    return id ?? null;
  } catch {
    return null;
  }
}

async function addToBasketAPI(productId: string, quantity: number, priceUSDPerPax: number) {
  const userId = getUserId();
  const token = getToken();
  if (!userId || !token) throw new Error('Missing user/token');

  const res = await fetch(`${API_BASE}/api/Basket/${userId}/items`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      accept: '*/*',
    },
    // contract chuẩn: { productId, quantity, price }
    body: JSON.stringify({ productId, quantity, price: priceUSDPerPax }),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Basket POST ${res.status}`);
  window.dispatchEvent(new Event('cart:changed'));
  window.dispatchEvent(new Event('basket:changed'));
}

/* ===== Resolver: tìm flight thật (productId = flight.id) từ trip ===== */
async function resolveFlightProduct(
  trip: ApiTransportTrip
): Promise<{ productId: string; flight?: ApiFlight }> {
  // A) /api/Flight?tripId=...
  try {
    const r = await fetch(`${API_BASE}/api/Flight?tripId=${encodeURIComponent(trip.id)}`, {
      cache: 'no-store',
    });
    if (r.ok) {
      const list = (await r.json()) as ApiFlight[] | ApiFlight;
      const arr = Array.isArray(list) ? list : [list];
      if (arr.length > 0 && arr[0]?.id) return { productId: arr[0].id, flight: arr[0] };
    }
  } catch {}

  // B) /api/Flight/by-transport-trip/{tripId}
  try {
    const r = await fetch(`${API_BASE}/api/Flight/by-transport-trip/${trip.id}`, {
      cache: 'no-store',
    });
    if (r.ok) {
      const f = (await r.json()) as ApiFlight;
      if (f?.id) return { productId: f.id, flight: f };
    }
  } catch {}

  // C) Match theo from/to/departTime
  try {
    const r = await fetch(`${API_BASE}/api/Flight`, { cache: 'no-store' });
    if (r.ok) {
      const all = (await r.json()) as ApiFlight[];
      const cand = all.find(
        (x) =>
          x.from?.toLowerCase() === trip.departure?.toLowerCase() &&
          x.to?.toLowerCase() === trip.destination?.toLowerCase() &&
          new Date(x.departTime).getTime() === new Date(trip.departureTime).getTime()
      );
      if (cand?.id) return { productId: cand.id, flight: cand };
    }
  } catch {}

  // Fallback: vẫn trả trip.id (không khớp với Cart flight—chỉ dùng tạm để debug)
  return { productId: trip.id };
}

/* ===== Page ===== */
export default function TransportTripDetailPage() {
  const { id } = useParams<{ id: string }>();

  const [trip, setTrip] = useState<ApiTransportTrip | null>(null);
  const [vendor, setVendor] = useState<ApiTransport | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [is404, setIs404] = useState(false);

  // Booking options (giống flight)
  const [currency, setCurrency] = useState<Currency>('VND');
  const [cabin, setCabin] = useState<CabinClass>('ECONOMY');
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [bags, setBags] = useState(0); // checked baggage / booking

  const pax = adults + children;

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        setIs404(false);

        // 1) Trip theo ID
        const rTrip = await fetch(`${API_BASE}/api/TransportTrip/${id}`, { cache: 'no-store' });
        if (rTrip.status === 404) {
          setIs404(true);
          return;
        }
        if (!rTrip.ok) throw new Error(`Trip HTTP ${rTrip.status}`);
        const tripJson = (await rTrip.json()) as ApiTransportTrip;
        setTrip(tripJson);

        // 2) Vendor theo transportId
        if (tripJson.transportId) {
          const rVendor = await fetch(`${API_BASE}/api/Transport/${tripJson.transportId}`, {
            cache: 'no-store',
          });
          if (rVendor.ok) {
            const vJson = (await rVendor.json()) as ApiTransport;
            setVendor(vJson);
          }
        }
      } catch (e: unknown) {
        setErr(e instanceof Error ? e.message : 'Fetch failed');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // Pricing (demo realistic)
  const baseFarePerAdultUSD = useMemo(() => {
    if (!trip) return 0;
    const cabinFactor = cabin === 'BUSINESS' ? 1.8 : 1.0;
    return Math.round(trip.price * cabinFactor);
  }, [trip, cabin]);

  const baseFarePerChildUSD = useMemo(
    () => Math.round(baseFarePerAdultUSD * 0.75),
    [baseFarePerAdultUSD]
  );

  const taxesFeesUSD = useMemo(() => {
    // 12% base + $8/pax phí sân bay
    const base = adults * baseFarePerAdultUSD + children * baseFarePerChildUSD;
    const percent = Math.round(base * 0.12);
    const airport = (adults + children) * 8;
    return percent + airport;
  }, [adults, children, baseFarePerAdultUSD, baseFarePerChildUSD]);

  const baggageUSD = useMemo(() => {
    // $15/bag Economy, $10/bag Business
    const per = cabin === 'BUSINESS' ? 10 : 15;
    return bags * per;
  }, [bags, cabin]);

  const baseTotalUSD = useMemo(
    () => adults * baseFarePerAdultUSD + children * baseFarePerChildUSD,
    [adults, children, baseFarePerAdultUSD, baseFarePerChildUSD]
  );

  const grandUSD = useMemo(
    () => baseTotalUSD + taxesFeesUSD + baggageUSD,
    [baseTotalUSD, taxesFeesUSD, baggageUSD]
  );

  const canBook = useMemo(() => !!trip && pax > 0 && trip.availableSeats >= pax, [trip, pax]);

  if (loading) return <div className="mx-auto max-w-7xl p-6">Đang tải chi tiết…</div>;
  if (is404) return <div className="mx-auto max-w-7xl p-6">Không tìm thấy chuyến.</div>;
  if (err) return <div className="mx-auto max-w-7xl p-6 text-red-600">Lỗi: {err}</div>;
  if (!trip) return null;

  const transportType = vendor?.transportType ?? 'Transport';
  const vendorName = vendor?.name ?? '—';

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* background an toàn */}
      <div aria-hidden className="absolute inset-0 -z-20">
        <div
          className="h-full w-full bg-cover bg-center"
          style={{ backgroundImage: "url('/img/parks/waterpark-hero.jpg')" }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(700px_300px_at_20%_0%,rgba(14,165,233,.28),transparent_60%),radial-gradient(700px_300px_at_80%_5%,rgba(45,212,191,.28),transparent_60%)]" />
        <div className="absolute inset-0 bg-white/50 backdrop-blur-[1.5px]" />
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        {/* HERO */}
        <div className="overflow-hidden rounded-3xl border border-white/50 bg-gradient-to-r from-sky-400 via-cyan-400 to-teal-400 shadow-xl">
          <div className="relative px-6 py-8 sm:px-8 sm:py-10">
            <div className="max-w-xl text-white drop-shadow">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">
                <Plane className="h-4 w-4" />
                {/air/i.test(transportType)
                  ? 'Flight'
                  : /train/i.test(transportType)
                    ? 'Train'
                    : /bus/i.test(transportType)
                      ? 'Bus'
                      : transportType}
                <span className="opacity-80">•</span>
                {vendorName}
              </div>
              <h1 className="mt-3 text-3xl font-extrabold leading-tight sm:text-4xl">
                {trip.departure} → {trip.destination}
              </h1>
              <p className="mt-1 text-sm opacity-95">
                {dt(trip.departureTime)} • T/gian dự kiến{' '}
                {duration(trip.departureTime, trip.arrivalTime)}
              </p>
            </div>

            {/* Controls bên phải */}
            <div className="absolute right-6 top-6 flex gap-3">
              <div className="rounded-xl bg-white/95 p-3 text-sky-700 shadow-md">
                <div className="text-xs">Tiền tệ</div>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as Currency)}
                  className="mt-1 h-8 rounded-lg border px-2 text-sm outline-none"
                >
                  <option value="VND">VND</option>
                  <option value="USD">USD</option>
                </select>
              </div>
              <div className="rounded-xl bg-white/95 p-3 text-sky-700 shadow-md">
                <div className="text-xs">Hạng ghế</div>
                <select
                  value={cabin}
                  onChange={(e) => setCabin(e.target.value as CabinClass)}
                  className="mt-1 h-8 rounded-lg border px-2 text-sm outline-none"
                >
                  <option value="ECONOMY">Economy</option>
                  <option value="BUSINESS">Business</option>
                </select>
              </div>
            </div>

            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_180px_at_20%_-10%,rgba(255,255,255,.35),transparent)]" />
          </div>
        </div>

        {/* BODY */}
        <div className="mt-6 grid gap-6 lg:grid-cols-12">
          {/* LEFT */}
          <div className="space-y-4 lg:col-span-8">
            <nav className="text-sm">
              <Link href="/transport" className="text-sky-700 hover:underline">
                ← Quay lại danh sách
              </Link>
            </nav>

            {/* Thông tin hành trình */}
            <section className="rounded-2xl border border-white/60 bg-white/90 p-5 shadow-sm backdrop-blur">
              <h2 className="text-lg font-semibold text-slate-900">Chi tiết hành trình</h2>

              <div className="mt-3 grid items-center gap-4 rounded-xl border border-slate-200/70 bg-white/90 p-4 sm:grid-cols-[1fr_auto_auto]">
                <div className="text-sm">
                  <div className="font-medium text-slate-900">
                    {trip.departure} → {trip.destination}
                  </div>
                  <div className="text-slate-600">
                    {dt(trip.departureTime)} • đến {dt(trip.arrivalTime)} •{' '}
                    <Clock className="mr-1 inline h-4 w-4 align-[-2px]" />
                    {duration(trip.departureTime, trip.arrivalTime)}
                  </div>
                </div>

                <div className="text-sm">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${
                      trip.availableSeats > 0
                        ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/70'
                        : 'bg-slate-100 text-slate-600 ring-1 ring-slate-200/70'
                    }`}
                  >
                    Còn {trip.availableSeats} ghế
                  </span>
                </div>

                <div className="text-right">
                  <div className="text-xs text-slate-500">Base fare / pax</div>
                  <div className="text-lg font-bold text-orange-600">
                    {money(displayPrice(baseFarePerAdultUSD, currency), currency)}
                  </div>
                </div>
              </div>

              {/* Chính sách & tiện ích */}
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <Pill
                  icon={<ShieldCheck className="h-4 w-4" />}
                  text="Hoàn huỷ linh hoạt (theo hãng)"
                />
                <Pill icon={<ArrowRightLeft className="h-4 w-4" />} text="Đổi lịch có phí" />
                <Pill
                  icon={<Luggage className="h-4 w-4" />}
                  text={cabin === 'BUSINESS' ? 'Ký gửi ưu đãi' : 'Mua thêm hành lý'}
                />
              </div>
            </section>

            {/* Fare breakdown */}
            <section className="rounded-2xl border border-white/60 bg-white/90 p-5 shadow-sm backdrop-blur">
              <h2 className="text-lg font-semibold text-slate-900">Giá chi tiết</h2>

              <div className="mt-3 space-y-1 text-sm">
                <Row
                  label={
                    <span className="inline-flex items-center gap-1">
                      <Users className="h-4 w-4" /> Người lớn × {adults}
                    </span>
                  }
                  value={money(displayPrice(baseFarePerAdultUSD * adults, currency), currency)}
                />
                <Row
                  label={
                    <span className="inline-flex items-center gap-1">
                      <Baby className="h-4 w-4" /> Trẻ em × {children}
                    </span>
                  }
                  value={money(displayPrice(baseFarePerChildUSD * children, currency), currency)}
                />
                <Row
                  label={
                    <span className="inline-flex items-center gap-1">
                      <Ticket className="h-4 w-4" /> Thuế & phí
                    </span>
                  }
                  value={money(displayPrice(taxesFeesUSD, currency), currency)}
                  subtle
                />
                <Row
                  label={
                    <span className="inline-flex items-center gap-1">
                      <BriefcaseBusiness className="h-4 w-4" /> Hành lý ký gửi ({bags})
                    </span>
                  }
                  value={money(displayPrice(baggageUSD, currency), currency)}
                  subtle
                />

                <div className="mt-2 border-t pt-2 flex items-center justify-between text-base font-semibold">
                  <span>Tổng cộng</span>
                  <span>
                    {money(
                      displayPrice(baseTotalUSD + taxesFeesUSD + baggageUSD, currency),
                      currency
                    )}
                  </span>
                </div>
              </div>

              {/* Passenger & baggage selectors */}
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <Counter label="Người lớn" value={adults} setValue={setAdults} min={1} />
                <Counter label="Trẻ em" value={children} setValue={setChildren} min={0} />
                <Counter label="Hành lý ký gửi" value={bags} setValue={setBags} min={0} />
              </div>

              <p className="mt-2 text-xs text-slate-500">
                * Giá hiển thị theo {currency}. Giá lưu & đồng bộ API là USD (base fare / pax).
              </p>
            </section>
          </div>

          {/* RIGHT (sticky) */}
          <aside className="lg:col-span-4">
            <div className="sticky top-24 rounded-2xl border border-white/60 bg-white/90 p-5 shadow-sm backdrop-blur">
              <h3 className="text-lg font-semibold text-slate-900">Đặt chỗ</h3>

              <div className="mt-3 space-y-1 text-sm">
                <Row label="Hãng / Đơn vị" value={vendorName} />
                <Row label="Chuyến" value={`${trip.departure} → ${trip.destination}`} />
                <Row label="Khởi hành" value={dt(trip.departureTime)} />
                <Row label="Hạng ghế" value={cabin === 'BUSINESS' ? 'Business' : 'Economy'} />
                <Row label="Số ghế đặt" value={`${pax} pax`} />
              </div>

              <button
                type="button"
                disabled={!canBook}
                onClick={async () => {
                  if (!trip) return;
                  try {
                    // 1) Lấy productId = flight.id (thật)
                    const { productId, flight } = await resolveFlightProduct(trip);

                    // 2) Add Basket: quantity = tổng pax; price = base fare / pax (USD) theo cabin
                    await addToBasketAPI(productId, pax, baseFarePerAdultUSD);

                    // 3) Lưu meta theo flight.id để Cart hiển thị breakdown
                    const uid = getUserId();
                    if (uid && typeof window !== 'undefined') {
                      try {
                        const raw = localStorage.getItem(BASKET_META_KEY);
                        const all = raw ? JSON.parse(raw) : {};
                        all[uid] = all[uid] || {};
                        all[uid][productId] = {
                          cabin,
                          bags,
                          adults,
                          children,
                          passengers: pax,
                          taxesUSD: taxesFeesUSD,
                          baggageUSD,
                          totalUSD: grandUSD,
                          from: flight?.from ?? trip.departure,
                          to: flight?.to ?? trip.destination,
                          departTime: flight?.departTime ?? trip.departureTime,
                          arriveTime: flight?.arriveTime ?? trip.arrivalTime,
                        };
                        localStorage.setItem(BASKET_META_KEY, JSON.stringify(all));
                      } catch {}
                    }

                    showSuccess('Đã thêm vào giỏ (Basket API)!');
                  } catch {
                    // Fallback local
                    addToCartLocal({
                      kind: 'transport',
                      vendorId: vendor?.id ?? trip.transportId,
                      vendorName,
                      transportType,
                      tripId: trip.id,
                      from: trip.departure,
                      to: trip.destination,
                      departureTime: trip.departureTime,
                      arrivalTime: trip.arrivalTime,
                      qty: pax,
                      price: baseFarePerAdultUSD, // USD/pax theo cabin
                      currency,
                      cabin,
                      bags,
                      adults,
                      children,
                      taxesUSD: taxesFeesUSD,
                      baggageUSD: baggageUSD,
                      totalUSD: grandUSD,
                    });
                    alert('Không gọi được Basket API — đã lưu local.');
                  }
                }}
                className={`mt-4 h-11 w-full rounded-xl font-semibold shadow transition
                  ${
                    !canBook
                      ? 'cursor-not-allowed bg-slate-200 text-slate-500'
                      : 'bg-gradient-to-br from-orange-500 to-amber-500 text-white hover:brightness-105 active:brightness-95'
                  }`}
              >
                {canBook ? 'Thêm vào giỏ hàng' : 'Hết chỗ / số lượng vượt quá'}
              </button>

              <div className="mt-3 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
                <div className="mb-1 inline-flex items-center gap-1 font-medium">
                  <Info className="h-4 w-4" />
                  Chính sách vé (demo)
                </div>
                <ul className="list-disc space-y-1 pl-5">
                  <li>Đổi lịch trước giờ khởi hành 24h, phí theo quy định hãng.</li>
                  <li>Hoàn huỷ: áp dụng điều kiện vé đã chọn; có thể có phí.</li>
                  <li>Hành lý xách tay 7kg (Economy), 10kg (Business). Ký gửi mua thêm.</li>
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

/* ===== UI bits ===== */
function Row({
  label,
  value,
  subtle = false,
}: {
  label: string | React.ReactNode;
  value: string;
  subtle?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between ${subtle ? 'text-slate-600' : ''}`}>
      <span>{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
function Pill({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-white/90 px-3 py-1 text-xs text-slate-700">
      {icon}
      {text}
    </div>
  );
}
function Counter({
  label,
  value,
  setValue,
  min = 0,
}: {
  label: string;
  value: number;
  setValue: (n: number) => void;
  min?: number;
}) {
  return (
    <div className="rounded-xl border border-slate-200/70 bg-white/90 p-3">
      <div className="text-xs text-slate-600">{label}</div>
      <div className="mt-1 inline-flex items-center rounded-lg border border-slate-200">
        <button
          type="button"
          className="h-8 w-8 hover:bg-slate-50"
          onClick={() => setValue(Math.max(min, value - 1))}
        >
          −
        </button>
        <div className="h-8 min-w-[42px] border-x text-center leading-8">{value}</div>
        <button
          type="button"
          className="h-8 w-8 hover:bg-slate-50"
          onClick={() => setValue(value + 1)}
        >
          +
        </button>
      </div>
    </div>
  );
}
