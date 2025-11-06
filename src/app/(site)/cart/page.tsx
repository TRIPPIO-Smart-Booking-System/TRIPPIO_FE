/* eslint react/prop-types: 0 */
'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Trash2,
  Plus,
  Minus,
  Loader2,
  CalendarDays,
  Building2,
  MapPin,
  BedDouble,
  Ticket,
  Plane,
  Clock4,
  CircleDot,
  MapPinHouse,
  ArrowRight,
} from 'lucide-react';
import { Basket, clearBasket, getBasket, removeItem, updateQuantity } from '@/lib/cartapi';
import PaymentModal from '@/components/PaymentModal';
import ReviewModal from '@/components/ReviewModal';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'https://trippio.azurewebsites.net';

/* Money helper */
const VND = (n: number) =>
  (n || 0).toLocaleString('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  });

/* BE models */
type ApiRoom = {
  id: string;
  hotelId: string;
  roomType: string;
  pricePerNight: number;
  capacity: number;
};
type ApiHotel = { id: string; name: string; address?: string; city?: string; country?: string };
type ApiShow = {
  id: string;
  name: string;
  location: string;
  city: string;
  startDate: string;
  endDate: string;
  price: number;
};
type ApiFlight = {
  id: string;
  airline: string;
  from: string;
  to: string;
  departTime: string;
  arriveTime: string;
  basePrice: number;
};

/* Local meta */
type LocalMeta = {
  checkIn?: string;
  checkOut?: string;
  nights?: number;
  guests?: number;
  showDate?: string;
  cabin?: string;
  passengers?: number;
  taxesVND?: number;
  baggageVND?: number;
  totalVND?: number;
};
const BASKET_META_KEY = 'basket_item_meta';
function getLocalMeta(userId: string, productId: string): LocalMeta | undefined {
  if (typeof window === 'undefined') return undefined;
  try {
    const raw = localStorage.getItem(BASKET_META_KEY);
    if (!raw) return undefined;
    const all = JSON.parse(raw) as Record<string, Record<string, LocalMeta>>;
    return all?.[userId]?.[productId];
  } catch {
    return undefined;
  }
}

/* UI types */
type Kind = 'hotel' | 'show' | 'flight';
type DisplayItemBase = { productId: string; quantity: number; unitPrice: number; kind: Kind };
type DisplayHotel = DisplayItemBase & {
  kind: 'hotel';
  hotelName?: string;
  hotelAddress?: string;
  roomType?: string;
  capacity?: number;
  checkIn?: string;
  checkOut?: string;
  nights?: number;
  guests?: number;
};
type DisplayShow = DisplayItemBase & {
  kind: 'show';
  showName?: string;
  location?: string;
  city?: string;
  startDate?: string;
  endDate?: string;
  showDate?: string;
};
type DisplayFlight = DisplayItemBase & {
  kind: 'flight';
  airline?: string;
  from?: string;
  to?: string;
  departTime?: string;
  arriveTime?: string;
  cabin?: string;
  passengers?: number;
  taxesVND?: number;
  baggageVND?: number;
  totalVND?: number;
};
type DisplayItem = DisplayHotel | DisplayShow | DisplayFlight;

/* ---- helper to replace the `any` casts for unit price ---- */
type Priced = { unitPrice?: number; price?: number };
function unitPriceOf(it: Priced): number {
  return typeof it.unitPrice === 'number'
    ? it.unitPrice
    : typeof it.price === 'number'
      ? it.price
      : 0;
}

/* Page */
export default function CartPage() {
  const [basket, setBasket] = useState<Basket | null>(null);
  const [items, setItems] = useState<DisplayItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [payOpen, setPayOpen] = useState(false);

  // Review modal
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewOrderId, setReviewOrderId] = useState<number | string | null>(null);

  // Buyer info
  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  useEffect(() => {
    try {
      setBuyerName(localStorage.getItem('userName') || '');
      setBuyerEmail(localStorage.getItem('userEmail') || '');
      setBuyerPhone(localStorage.getItem('userPhone') || '');
    } catch {}
  }, []);

  async function load() {
    try {
      setLoading(true);
      setErr(null);
      const data = await getBasket(); // { userId, items: [...] }
      setBasket(data);

      const productIds = Array.from(new Set(data.items.map((i) => i.productId)));
      const rooms = await fetchRooms(productIds);
      const hotels = await fetchHotels(Array.from(new Set(rooms.map((r) => r.hotelId))));
      const shows = await fetchShows(productIds);
      const flights = await fetchFlights(productIds);

      const roomMap = new Map(rooms.map((r) => [r.id, r]));
      const hotelMap = new Map(hotels.map((h) => [h.id, h]));
      const showMap = new Map(shows.map((s) => [s.id, s]));
      const flightMap = new Map(flights.map((f) => [f.id, f]));

      const enriched: DisplayItem[] = data.items.map((it) => {
        const meta = getLocalMeta(data.userId, it.productId);
        const unit = unitPriceOf(it as Priced);

        const r = roomMap.get(it.productId);
        if (r) {
          const h = hotelMap.get(r.hotelId);
          return {
            kind: 'hotel',
            productId: it.productId,
            quantity: it.quantity,
            unitPrice: unit,
            hotelName: h?.name,
            hotelAddress: joinAddress(h),
            roomType: r?.roomType,
            capacity: r?.capacity,
            checkIn: meta?.checkIn,
            checkOut: meta?.checkOut,
            nights: meta?.nights,
            guests: meta?.guests,
          } as DisplayHotel;
        }
        const s = showMap.get(it.productId);
        if (s) {
          return {
            kind: 'show',
            productId: it.productId,
            quantity: it.quantity,
            unitPrice: unit,
            showName: s.name,
            location: s.location,
            city: s.city,
            startDate: s.startDate,
            endDate: s.endDate,
            showDate: meta?.showDate,
          } as DisplayShow;
        }
        const f = flightMap.get(it.productId);
        if (f) {
          return {
            kind: 'flight',
            productId: it.productId,
            quantity: it.quantity,
            unitPrice: unit,
            airline: f.airline,
            from: f.from,
            to: f.to,
            departTime: f.departTime,
            arriveTime: f.arriveTime,
            cabin: meta?.cabin,
            passengers: meta?.passengers ?? it.quantity,
            taxesVND: meta?.taxesVND,
            baggageVND: meta?.baggageVND,
            totalVND: meta?.totalVND,
          } as DisplayFlight;
        }
        return {
          kind: 'show',
          productId: it.productId,
          quantity: it.quantity,
          unitPrice: unit,
          showName: 'Sản phẩm',
        } as DisplayShow;
      });

      setItems(enriched);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Load cart failed');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const h = () => load();
    window.addEventListener('basket:changed', h);
    return () => window.removeEventListener('basket:changed', h);
  }, []);

  function lineTotalVND(it: DisplayItem): number {
    if (it.kind === 'flight') {
      const f = it as DisplayFlight;
      if (typeof f.totalVND === 'number') return f.totalVND!;
      const base = it.unitPrice * it.quantity;
      const extras = (f.taxesVND ?? 0) + (f.baggageVND ?? 0);
      return base + extras;
    }
    return it.unitPrice * it.quantity;
  }

  const totals = useMemo(() => {
    const subtotalVND = items.reduce((s, it) => s + lineTotalVND(it), 0);
    const baseHotelShow = items
      .filter((it) => it.kind !== 'flight')
      .reduce((s, it) => s + it.unitPrice * it.quantity, 0);
    const taxVND = Math.round(baseHotelShow * 0.1);
    const grandVND = subtotalVND + taxVND;
    return { subtotalVND, taxVND, grandVND };
  }, [items]);

  const userId = basket?.userId ?? '';

  return (
    <div className="mx-auto max-w-5xl px-4 pb-16 pt-8">
      <h1 className="text-2xl font-bold">Giỏ hàng</h1>

      {loading && (
        <div className="mt-6 inline-flex items-center gap-2 text-zinc-600">
          <Loader2 className="h-4 w-4 animate-spin" /> Đang tải…
        </div>
      )}
      {err && (
        <div className="mt-4 rounded border border-red-200 bg-red-50 p-3 text-red-700">{err}</div>
      )}

      {!loading && !items.length && !err && (
        <div className="mt-6 rounded-2xl border bg-white p-6 text-zinc-700">
          Giỏ hàng đang trống.
        </div>
      )}

      {!!items.length && (
        <div className="mt-6 grid gap-6 md:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            {items.map((it) => {
              if (it.kind === 'hotel')
                return (
                  <HotelCard
                    key={it.productId}
                    it={it as DisplayHotel}
                    userId={userId}
                    reload={load}
                  />
                );
              if (it.kind === 'show')
                return (
                  <ShowCard
                    key={it.productId}
                    it={it as DisplayShow}
                    userId={userId}
                    reload={load}
                  />
                );
              return (
                <FlightCard
                  key={it.productId}
                  it={it as DisplayFlight}
                  userId={userId}
                  reload={load}
                />
              );
            })}
          </div>

          {/* Tổng + Buyer */}
          <div className="rounded-2xl border bg-white p-4 shadow-sm">
            <h2 className="text-lg font-semibold">Tổng cộng</h2>
            <div className="mt-2 space-y-1 text-sm">
              <Row label="Tạm tính" value={VND(totals.subtotalVND)} />
              <Row
                label="Thuế & phí (ước tính 10% cho khách sạn/sự kiện)"
                value={VND(totals.taxVND)}
                subtle
              />
              <div className="mt-2 border-t pt-2 flex items-center justify-between text-base font-semibold">
                <span>Thành tiền</span>
                <span>{VND(totals.grandVND)}</span>
              </div>
            </div>

            {/* Buyer info */}
            <div className="mt-4 rounded-2xl border bg-white p-4 shadow-sm">
              <h3 className="text-sm font-semibold">Thông tin người thanh toán</h3>
              <div className="mt-3 space-y-3">
                <div>
                  <label className="mb-1 block text-xs text-zinc-500">Họ tên</label>
                  <input
                    className="w-full rounded-lg border px-3 py-2"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-zinc-500">Email</label>
                  <input
                    className="w-full rounded-lg border px-3 py-2"
                    type="email"
                    value={buyerEmail}
                    onChange={(e) => setBuyerEmail(e.target.value)}
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-zinc-500">Số điện thoại</label>
                  <input
                    className="w-full rounded-lg border px-3 py-2"
                    value={buyerPhone}
                    onChange={(e) => setBuyerPhone(e.target.value)}
                    placeholder="09xxxxxxxx"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    try {
                      localStorage.setItem('userName', buyerName || '');
                      localStorage.setItem('userEmail', buyerEmail || '');
                      localStorage.setItem('userPhone', buyerPhone || '');
                    } catch {}
                  }}
                  className="w-full rounded-lg border px-3 py-2 text-sm hover:bg-zinc-50"
                >
                  Lưu thông tin này
                </button>
              </div>
            </div>

            <button
              className="mt-4 w-full rounded-xl bg-blue-600 py-3 text-white hover:bg-blue-700"
              onClick={() => setPayOpen(true)}
              disabled={!buyerName || !buyerEmail || !buyerPhone}
              title={
                !buyerName || !buyerEmail || !buyerPhone
                  ? 'Điền đủ thông tin người thanh toán'
                  : 'Thanh toán'
              }
            >
              Thanh toán PayOS
            </button>

            <button
              onClick={async () => {
                await clearBasket();
                await load();
              }}
              className="mt-2 w-full rounded-xl border py-2 text-sm text-zinc-700 hover:bg-zinc-50"
            >
              Xoá sạch giỏ hàng
            </button>

            {basket?.userId && (
              <div className="mt-3 rounded-lg bg-zinc-50 p-2 text-[11px] text-zinc-600">
                <Building2 className="mr-1 inline h-3 w-3" />
                User ID: <span className="font-mono">{basket.userId}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal PayOS */}
      <PaymentModal
        open={payOpen}
        onClose={() => setPayOpen(false)}
        totalVND={totals.grandVND}
        userId={basket?.userId}
        buyerName={buyerName}
        buyerEmail={buyerEmail}
        buyerPhone={buyerPhone}
        createUrlEndpoint={`${API_BASE}/api/Checkout/start`}
        statusEndpoint={`${API_BASE}/api/Checkout/status`}
        onPaid={async ({ orderId }) => {
          setPayOpen(false);
          setReviewOrderId(orderId);
          setReviewOpen(true);
          await clearBasket();
          await load();
        }}
      />

      {/* Review Modal */}
      <ReviewModal
        open={reviewOpen}
        orderId={reviewOrderId ?? undefined}
        onClose={() => setReviewOpen(false)}
      />
    </div>
  );
}

/* ---------- Cards (truyền userId vào để xoá) ---------- */
function HotelCard({
  it,
  userId,
  reload,
}: {
  it: DisplayHotel;
  userId: string;
  reload: () => Promise<void>;
}) {
  const subtotalVND = it.unitPrice * it.quantity;
  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm text-zinc-500">HOTEL • ROOM</div>
          <div className="text-base font-semibold">{it.hotelName ?? 'Phòng khách sạn'}</div>
          {!!it.roomType && (
            <div className="mt-0.5 inline-flex items-center gap-1 text-sm text-sky-700">
              <BedDouble className="h-4 w-4" />
              {it.roomType}
              {it.capacity ? (
                <span className="text-zinc-500"> • {it.capacity} khách/phòng</span>
              ) : null}
            </div>
          )}
          {!!it.hotelAddress && (
            <div className="mt-0.5 inline-flex items-center gap-1 text-xs text-zinc-600">
              <MapPin className="h-3.5 w-3.5" />
              {it.hotelAddress}
            </div>
          )}
          {(it.checkIn || it.checkOut) && (
            <div className="mt-2 inline-flex items-center gap-2 rounded-lg bg-zinc-50 px-2 py-1 text-xs text-zinc-700">
              <CalendarDays className="h-3.5 w-3.5" />
              {it.checkIn ?? '—'} → {it.checkOut ?? '—'}
              {it.nights ? <span>• {it.nights} đêm</span> : null}
              {it.guests ? <span>• {it.guests} khách</span> : null}
            </div>
          )}
        </div>
        <button
          className="rounded-lg border px-2 py-1 text-red-600 hover:bg-red-50"
          disabled={!userId}
          onClick={async () => {
            if (!userId) return;
            if (!confirm('Xoá sản phẩm này khỏi giỏ?')) return;
            await removeItem(userId, it.productId);
            await reload();
          }}
          title="Xoá mục này"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      <QtyAndMoney it={it} subtotalVND={subtotalVND} reload={reload} />
    </div>
  );
}

function ShowCard({
  it,
  userId,
  reload,
}: {
  it: DisplayShow;
  userId: string;
  reload: () => Promise<void>;
}) {
  const subtotalVND = it.unitPrice * it.quantity;
  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm text-zinc-500">SHOW • EVENT</div>
          <div className="text-base font-semibold">{it.showName ?? 'Sự kiện'}</div>
          <div className="mt-0.5 inline-flex items-center gap-1 text-xs text-zinc-600">
            <MapPinHouse className="h-3.5 w-3.5" />
            {joinLocation(it.location, it.city) ?? '—'}
          </div>
          {(it.showDate || it.startDate || it.endDate) && (
            <div className="mt-2 inline-flex items-center gap-2 rounded-lg bg-zinc-50 px-2 py-1 text-xs text-zinc-700">
              <Ticket className="h-3.5 w-3.5" />
              {it.showDate
                ? fmt(it.showDate)
                : [it.startDate, it.endDate].filter(Boolean).map(fmt).join(' → ')}
            </div>
          )}
        </div>
        <button
          className="rounded-lg border px-2 py-1 text-red-600 hover:bg-red-50"
          disabled={!userId}
          onClick={async () => {
            if (!userId) return;
            if (!confirm('Xoá sản phẩm này khỏi giỏ?')) return;
            await removeItem(userId, it.productId);
            await reload();
          }}
          title="Xoá mục này"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      <QtyAndMoney it={it} subtotalVND={subtotalVND} reload={reload} />
    </div>
  );
}

function FlightCard({
  it,
  userId,
  reload,
}: {
  it: DisplayFlight;
  userId: string;
  reload: () => Promise<void>;
}) {
  const baseSubtotalVND = it.unitPrice * it.quantity;
  const taxes = it.taxesVND ?? 0;
  const baggage = it.baggageVND ?? 0;
  const totalVND = it.totalVND ?? baseSubtotalVND + taxes + baggage;

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm text-zinc-500">FLIGHT • AIR</div>
          <div className="text-base font-semibold">
            {it.airline ?? 'Chuyến bay'} — {it.from ?? '—'}{' '}
            <ArrowRight className="mx-1 inline h-4 w-4 text-zinc-400" /> {it.to ?? '—'}
          </div>
          {(it.departTime || it.arriveTime) && (
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-zinc-700">
              <span className="inline-flex items-center gap-1 rounded bg-zinc-50 px-2 py-1">
                <Clock4 className="h-3.5 w-3.5" />
                {fmt(it.departTime)} → {fmt(it.arriveTime)} • {dur(it.departTime, it.arriveTime)}
              </span>
              {it.cabin && (
                <span className="inline-flex items-center gap-1 rounded bg-zinc-50 px-2 py-1">
                  <CircleDot className="h-3.5 w-3.5" />
                  {it.cabin}
                </span>
              )}
              {it.passengers ? (
                <span className="inline-flex items-center gap-1 rounded bg-zinc-50 px-2 py-1">
                  <Plane className="h-3.5 w-3.5" />
                  {it.passengers} khách
                </span>
              ) : null}
            </div>
          )}
        </div>
        <button
          className="rounded-lg border px-2 py-1 text-red-600 hover:bg-red-50"
          disabled={!userId}
          onClick={async () => {
            if (!userId) return;
            if (!confirm('Xoá sản phẩm này khỏi giỏ?')) return;
            await removeItem(userId, it.productId);
            await reload();
          }}
          title="Xoá mục này"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <QtyAndMoney it={it} subtotalVND={baseSubtotalVND} reload={reload} />

      <div className="mt-3 rounded-xl border bg-zinc-50/60 p-3 text-sm">
        <div className="flex items-center justify-between">
          <span>Base fare × {it.quantity} pax</span>
          <span className="font-medium">{VND(baseSubtotalVND)}</span>
        </div>
        <div className="mt-1 flex items-center justify-between text-zinc-600">
          <span>Thuế & phí</span>
          <span>{VND(taxes)}</span>
        </div>
        <div className="mt-1 flex items-center justify-between text-zinc-600">
          <span>Hành lý ký gửi</span>
          <span>{VND(baggage)}</span>
        </div>
        <div className="mt-2 border-t pt-2 flex items-center justify-between text-base font-semibold">
          <span>Tổng (chuyến bay)</span>
          <span>{VND(totalVND)}</span>
        </div>
      </div>
    </div>
  );
}

/* Qty & money (giữ nguyên) */
function QtyAndMoney({
  it,
  subtotalVND,
  reload,
}: {
  it: DisplayItem;
  subtotalVND: number;
  reload: () => Promise<void>;
}) {
  return (
    <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
      <div className="inline-flex items-center rounded-lg border">
        <button
          className="h-9 w-9 hover:bg-zinc-50"
          onClick={async () => {
            const q = Math.max(1, it.quantity - 1);
            await updateQuantity(it.productId, q);
            await reload();
          }}
        >
          <Minus className="mx-auto h-4 w-4" />
        </button>
        <div className="h-9 min-w-[46px] border-x text-center leading-9">{it.quantity}</div>
        <button
          className="h-9 w-9 hover:bg-zinc-50"
          onClick={async () => {
            await updateQuantity(it.productId, it.quantity + 1);
            await reload();
          }}
        >
          <Plus className="mx-auto h-4 w-4" />
        </button>
      </div>
      <div className="text-right">
        <div className="text-sm text-zinc-500">Đơn giá</div>
        <div className="font-medium">{VND(it.unitPrice)}</div>
      </div>
      <div className="text-right">
        <div className="text-sm text-zinc-500">Tạm tính</div>
        <div className="font-semibold">{VND(subtotalVND)}</div>
      </div>
    </div>
  );
}

/* Helpers + fetchers */
function Row({ label, value, subtle = false }: { label: string; value: string; subtle?: boolean }) {
  return (
    <div className={`flex items-center justify-between ${subtle ? 'text-zinc-600' : ''}`}>
      <span>{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
function joinAddress(h?: ApiHotel) {
  if (!h) return undefined;
  const parts = [h.address, h.city, h.country].filter(Boolean);
  return parts.length ? parts.join(', ') : undefined;
}
function joinLocation(loc?: string, city?: string) {
  const parts = [loc, city].filter(Boolean);
  return parts.length ? parts.join(', ') : undefined;
}
function fmt(s?: string) {
  if (!s) return '—';
  const d = new Date(s);
  if (isNaN(d.getTime())) return s;
  return d.toLocaleString('vi-VN', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
function dur(a?: string, b?: string) {
  if (!a || !b) return '—';
  const s = new Date(a).getTime();
  const e = new Date(b).getTime();
  if (isNaN(s) || isNaN(e) || e <= s) return '—';
  const mins = Math.round((e - s) / 60000);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h${m ? ` ${m}m` : ''}`;
}

async function fetchRooms(ids: string[]): Promise<ApiRoom[]> {
  if (!ids.length) return [];
  const r = await fetch(`${API_BASE}/api/Room`, { cache: 'no-store' });
  if (!r.ok) return [];
  const all = (await r.json()) as ApiRoom[];
  const set = new Set(ids);
  return all.filter((x) => set.has(x.id));
}
async function fetchHotels(ids: string[]): Promise<ApiHotel[]> {
  const unique = Array.from(new Set(ids)).filter(Boolean);
  if (!unique.length) return [];
  const results: ApiHotel[] = [];
  await Promise.all(
    unique.map(async (id) => {
      const r = await fetch(`${API_BASE}/api/Hotel/${id}`, { cache: 'no-store' });
      if (r.ok) {
        const h = (await r.json()) as ApiHotel;
        if (h?.id) results.push(h);
      }
    })
  );
  return results;
}
async function fetchShows(ids: string[]): Promise<ApiShow[]> {
  if (!ids.length) return [];
  const r = await fetch(`${API_BASE}/api/Show`, { cache: 'no-store' });
  if (r.ok) {
    const all = (await r.json()) as ApiShow[];
    const set = new Set(ids);
    return all.filter((x) => set.has(x.id));
  }
  const out: ApiShow[] = [];
  await Promise.all(
    ids.map(async (id) => {
      try {
        const rr = await fetch(`${API_BASE}/api/Show/${id}`, { cache: 'no-store' });
        if (rr.ok) {
          const s = (await rr.json()) as ApiShow;
          if (s?.id) out.push(s);
        }
      } catch {}
    })
  );
  return out;
}
async function fetchFlights(ids: string[]): Promise<ApiFlight[]> {
  if (!ids.length) return [];
  const r = await fetch(`${API_BASE}/api/Flight`, { cache: 'no-store' });
  if (r.ok) {
    const all = (await r.json()) as ApiFlight[];
    const set = new Set(ids);
    return all.filter((x) => set.has(x.id));
  }
  const out: ApiFlight[] = [];
  await Promise.all(
    ids.map(async (id) => {
      try {
        const rr = await fetch(`${API_BASE}/api/Flight/${id}`, { cache: 'no-store' });
        if (rr.ok) {
          const f = (await rr.json()) as ApiFlight;
          if (f?.id) out.push(f);
        }
      } catch {}
    })
  );
  return out;
}
