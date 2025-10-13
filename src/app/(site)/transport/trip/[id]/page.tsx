/* eslint react/prop-types: 0 */
'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';

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
  price: number; // đơn giá gốc USD (giả định)
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

type CartItem = {
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
  price: number; // USD gốc
  currency: Currency; // chỉ để hiển thị
};

const CART_KEY = 'tripio_cart';

/* ===== FX & Utils hiển thị ===== */
// Dùng 25_000 VND cho 1 USD để hiển thị (trước đây 25 là quá nhỏ)
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
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—';
};

/* ===== Local cart fallback ===== */
function addToCartLocal(item: CartItem) {
  try {
    const raw = localStorage.getItem(CART_KEY);
    const arr: CartItem[] = raw ? JSON.parse(raw) : [];
    arr.push(item);
    localStorage.setItem(CART_KEY, JSON.stringify(arr));
    window.dispatchEvent(new Event('cart:changed'));
  } catch {}
}

/* ===== Basket API helpers ===== */
function getToken(): string | null {
  try {
    return localStorage.getItem('accessToken');
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

async function addToBasketAPI(productId: string, quantity: number, price: number) {
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
    body: JSON.stringify({ productId, quantity, price }), // price gửi USD gốc
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Basket POST ${res.status}`);
  window.dispatchEvent(new Event('cart:changed'));
}

/* ===== Page ===== */
export default function TransportTripDetailPage() {
  const { id } = useParams<{ id: string }>();

  const [trip, setTrip] = useState<ApiTransportTrip | null>(null);
  const [vendor, setVendor] = useState<ApiTransport | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [is404, setIs404] = useState(false);

  const [currency, setCurrency] = useState<Currency>('VND');
  const [passengers, setPassengers] = useState(1);

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

  const canBook = useMemo(() => !!trip && trip.availableSeats >= passengers, [trip, passengers]);

  const displayTotal = useMemo(
    () => (trip ? displayPrice(trip.price, currency) * passengers : 0),
    [trip, passengers, currency]
  );

  if (loading) return <div className="mx-auto max-w-7xl p-6">Đang tải chi tiết…</div>;
  if (is404) return <div className="mx-auto max-w-7xl p-6">Không tìm thấy chuyến.</div>;
  if (err) return <div className="mx-auto max-w-7xl p-6 text-red-600">Lỗi: {err}</div>;
  if (!trip) return null;

  const transportType = vendor?.transportType ?? 'Transport';
  const vendorName = vendor?.name ?? '—';

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* background an toàn, không gây tràn */}
      <div aria-hidden className="absolute inset-0 -z-20">
        <div
          className="h-full w-full bg-cover bg-center"
          style={{ backgroundImage: "url('/img/parks/waterpark-hero.jpg')" }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(700px_300px_at_20%_0%,rgba(14,165,233,.28),transparent_60%),radial-gradient(700px_300px_at_80%_5%,rgba(45,212,191,.28),transparent_60%)]" />
        <div className="absolute inset-0 bg-white/50 backdrop-blur-[1.5px]" />
      </div>

      {/* CONTAINER CHUẨN */}
      <div className="mx-auto w-full max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        {/* HERO trong container để không tràn ngang */}
        <div className="overflow-hidden rounded-3xl border border-white/50 bg-gradient-to-r from-sky-400 via-cyan-400 to-teal-400 shadow-xl">
          <div className="relative px-6 py-8 sm:px-8 sm:py-10">
            {/* trái */}
            <div className="max-w-xl text-white drop-shadow">
              <div className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">
                {/air/i.test(transportType)
                  ? '✈️'
                  : /train/i.test(transportType)
                    ? '🚆'
                    : /bus/i.test(transportType)
                      ? '🚌'
                      : '🚗'}{' '}
                {transportType}
              </div>
              <h1 className="mt-3 text-3xl font-extrabold leading-tight sm:text-4xl">
                {vendorName}
              </h1>
              <p className="mt-1 text-sm opacity-95">
                Chuyến: {trip.departure} → {trip.destination}
              </p>
            </div>

            {/* phải */}
            <div className="absolute right-6 top-6">
              <div className="rounded-xl bg-white/95 p-3 text-sky-700 shadow-md">
                <div className="text-xs">Tiền tệ hiển thị</div>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as Currency)}
                  className="mt-1 h-8 rounded-lg border px-2 text-sm outline-none"
                >
                  <option value="VND">VND</option>
                  <option value="USD">USD</option>
                </select>
              </div>
            </div>

            {/* shine overlay */}
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

            <section className="rounded-2xl border border-white/60 bg-white/90 p-5 shadow-sm backdrop-blur">
              <h2 className="text-lg font-semibold text-slate-900">Thông tin chuyến</h2>

              <div className="mt-3 grid items-center gap-3 rounded-xl border border-slate-200/70 bg-white/90 p-3 sm:grid-cols-[1fr_auto_auto]">
                <div className="text-sm">
                  <div className="font-medium text-slate-900">
                    {trip.departure} → {trip.destination}
                  </div>
                  <div className="text-slate-600">
                    {dt(trip.departureTime)} • đến {dt(trip.arrivalTime)}
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
                  <div className="text-xs text-slate-500">Giá / vé</div>
                  <div className="text-lg font-bold text-orange-600">
                    {money(displayPrice(trip.price, currency), currency)}
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* RIGHT (sticky) */}
          <aside className="lg:col-span-4">
            <div className="sticky top-24 rounded-2xl border border-white/60 bg-white/90 p-5 shadow-sm backdrop-blur">
              <h3 className="text-lg font-semibold text-slate-900">Đặt chỗ</h3>

              <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-50 p-3">
                <span className="text-sm text-slate-700">Số hành khách</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="h-8 w-8 rounded border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    onClick={() => setPassengers((q) => Math.max(1, q - 1))}
                    aria-label="Giảm"
                  >
                    −
                  </button>
                  <span className="w-8 text-center font-medium text-slate-900">{passengers}</span>
                  <button
                    type="button"
                    className="h-8 w-8 rounded border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    onClick={() => setPassengers((q) => q + 1)}
                    aria-label="Tăng"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="mt-3 space-y-1 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Chuyến</span>
                  <span className="font-medium text-slate-900">
                    {trip.departure} → {trip.destination}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Thời gian</span>
                  <span className="font-medium text-slate-900">{dt(trip.departureTime)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Tổng tiền</span>
                  <span className="text-lg font-extrabold text-slate-900">
                    {money(displayTotal, currency)}
                  </span>
                </div>
              </div>

              <button
                type="button"
                disabled={!canBook}
                onClick={async () => {
                  if (!trip) return;
                  try {
                    await addToBasketAPI(trip.id, passengers, trip.price); // USD gốc
                    alert('Đã thêm vào giỏ (Basket API)!');
                  } catch {
                    addToCartLocal({
                      kind: 'transport',
                      vendorId: vendor?.id ?? trip.transportId,
                      vendorName: vendorName,
                      transportType,
                      tripId: trip.id,
                      from: trip.departure,
                      to: trip.destination,
                      departureTime: trip.departureTime,
                      arrivalTime: trip.arrivalTime,
                      qty: passengers,
                      price: trip.price, // lưu USD gốc
                      currency,
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
                {canBook ? 'Add to cart' : 'Hết chỗ / số lượng vượt quá'}
              </button>

              <p className="mt-2 text-center text-xs text-slate-500">
                * Tổng tiền hiển thị theo {currency}. Giá lưu & đồng bộ API là USD.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
