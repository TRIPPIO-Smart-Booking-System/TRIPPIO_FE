/* eslint react/prop-types: 0 */
'use client';

import { useParams, useSearchParams } from 'next/navigation';
import React, { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { showSuccess, showError } from '@/lib/toast';
import { getHotelImageByIndex, getRoomImages } from '@/lib/imageLoader';
import {
  MapPin,
  Star,
  Share2,
  Heart,
  CheckCircle2,
  Wifi,
  Coffee,
  Car,
  Dumbbell,
  Bath,
  Snowflake,
  Tv,
  ShieldCheck,
  ChevronRight,
  CalendarDays,
  Users2,
  DoorOpen,
  Sparkles,
  BadgeCheck,
} from 'lucide-react';

/* =========================
    Config
  ========================= */
const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'https://trippio.azurewebsites.net';
const LOCAL_CART_KEY = 'tripio_cart';
const USER_ID_KEY = 'userId';
const AUTH_TOKEN_KEY = 'authToken';

/* =========================
    Types
  ========================= */
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
  rooms: ApiRoom[];
};

type LocalCartItem = {
  kind: 'hotel';
  hotelId: string;
  hotelName: string;
  roomId: string;
  roomType: string;
  nights: number;
  rooms: number;
  checkIn: string;
  checkOut: string;
  pricePerNight: number;
  subtotal: number;
};

/* =========================
    Utilities
  ========================= */
const VND = (n: number) =>
  n.toLocaleString('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 });

function clamp(v: number, min = 0, max = 5) {
  return Math.max(min, Math.min(max, v));
}

function buildMapsURL(
  parts: { address?: string; city?: string; country?: string; lat?: number; lng?: number },
  opts: { embed?: boolean } = {}
) {
  const { address, city, country, lat, lng } = parts || {};
  const byCoords = typeof lat === 'number' && typeof lng === 'number';
  const query = byCoords
    ? `${lat},${lng}`
    : [address, city, country].filter(Boolean).join(', ').trim();
  if (!query) return 'https://www.google.com/maps';
  return opts.embed
    ? `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

function getOrCreateUserId() {
  try {
    const existing = localStorage.getItem(USER_ID_KEY);
    if (existing) return existing;
    const uuid = crypto.randomUUID();
    localStorage.setItem(USER_ID_KEY, uuid);
    return uuid;
  } catch {
    // fallback: deterministic pseudo-id
    return '00000000-0000-0000-0000-000000000000';
  }
}

/** Return a plain header map (Record<string,string>) */
function getAuthHeaders(): Record<string, string> {
  try {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}

/** Safe POST helper with proper HeadersInit typing */
async function postJSON<T = unknown>(url: string, data?: unknown, init?: RequestInit): Promise<T> {
  const base = new Headers({ 'Content-Type': 'application/json', ...getAuthHeaders() });
  if (init?.headers) {
    const extra = new Headers(init.headers as HeadersInit);
    extra.forEach((v, k) => base.set(k, v));
  }

  const res = await fetch(url, {
    ...init,
    method: init?.method ?? 'POST',
    headers: base,
    body: data ? JSON.stringify(data) : init?.body,
  });

  if (!res.ok) throw new Error(`POST ${url} → ${res.status}`);
  try {
    return (await res.json()) as T;
  } catch {
    return {} as T; // 204, empty, etc.
  }
}

function addLocalCart(item: LocalCartItem) {
  try {
    const raw = localStorage.getItem(LOCAL_CART_KEY);
    const arr: LocalCartItem[] = raw ? JSON.parse(raw) : [];
    arr.push(item);
    localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(arr));
  } catch {}
}

/* =========================
    Amenities & UI bits
  ========================= */
function StarRating({ stars }: { stars: number }) {
  const s = clamp(stars);
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i < s ? 'fill-amber-400 text-amber-400' : 'text-zinc-300'}`}
        />
      ))}
      <span className="ml-1 text-sm text-zinc-600">{s.toFixed(1)}</span>
    </div>
  );
}
function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-white/70 px-3 py-1 text-xs text-zinc-700 shadow-sm backdrop-blur">
      {children}
    </span>
  );
}
const AMENITIES: {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { key: 'wifi', label: 'Wi-Fi miễn phí', icon: Wifi },
  { key: 'breakfast', label: 'Bữa sáng', icon: Coffee },
  { key: 'parking', label: 'Bãi đỗ xe', icon: Car },
  { key: 'gym', label: 'Gym', icon: Dumbbell },
  { key: 'bath', label: 'Bồn tắm', icon: Bath },
  { key: 'ac', label: 'Điều hoà', icon: Snowflake },
  { key: 'tv', label: 'Smart TV', icon: Tv },
  { key: 'security', label: 'Bảo vệ 24/7', icon: ShieldCheck },
];

/* =========================
    Page
  ========================= */
export default function HotelDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const deepLinkRoomId = searchParams?.get('room') || '';

  const id = (params?.id as string) ?? '';

  // Booking state
  const [checkIn, setCheckIn] = useState<string>(new Date().toISOString().slice(0, 10));
  const [checkOut, setCheckOut] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  });
  const [adults, setAdults] = useState<number>(2);
  const [children, setChildren] = useState<number>(0);

  // Data
  const [hotel, setHotel] = useState<ApiHotel | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [err, setErr] = useState<string | null>(null);
  const [is404, setIs404] = useState<boolean>(false);

  // per-room qty
  const [qty, setQty] = useState<Record<string, number>>({});
  const [highlightRoomId, setHighlightRoomId] = useState<string | null>(null);

  const setQtyFor = (roomId: string, n: number) =>
    setQty((prev) => ({ ...prev, [roomId]: Math.max(1, n) }));

  useEffect(() => {
    if (!id) return;

    (async () => {
      try {
        setLoading(true);
        setErr(null);
        setIs404(false);

        // 1) Lấy Hotel theo id
        const hotelRes = await fetch(`${API_BASE}/api/Hotel/${id}`, { cache: 'no-store' });
        if (hotelRes.status === 404) {
          setIs404(true);
          setHotel(null);
          return;
        }
        if (!hotelRes.ok) throw new Error(`HTTP ${hotelRes.status} khi lấy Hotel`);

        const h = (await hotelRes.json()) as ApiHotel;
        if (!h?.id) throw new Error('Invalid payload');

        // 2) Lấy Rooms theo hotelId (ưu tiên filter server-side)
        let rooms: ApiRoom[] = [];
        const filteredUrl = `${API_BASE}/api/Room?hotelId=${encodeURIComponent(h.id)}`;
        const probe = await fetch(filteredUrl, { cache: 'no-store' });

        if (probe.ok) {
          rooms = (await probe.json()) as ApiRoom[];
        } else {
          const allRoomsRes = await fetch(`${API_BASE}/api/Room`, { cache: 'no-store' });
          if (!allRoomsRes.ok) throw new Error(`HTTP ${allRoomsRes.status} khi lấy Room`);
          const allRooms = (await allRoomsRes.json()) as ApiRoom[];
          rooms = allRooms.filter((r) => r.hotelId === h.id);
        }

        rooms.sort((a, b) => (a.pricePerNight ?? 0) - (b.pricePerNight ?? 0));

        // 3) Gán rooms vào state hotel
        const merged: ApiHotel = { ...h, rooms };
        setHotel(merged);

        // 4) Init số lượng
        const init: Record<string, number> = {};
        rooms.forEach((r) => (init[r.id] = 1));
        setQty(init);

        // 5) Deep-link room highlight
        if (deepLinkRoomId && rooms.some((r) => r.id === deepLinkRoomId)) {
          setTimeout(() => {
            const el = document.getElementById(`room-${deepLinkRoomId}`);
            el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setHighlightRoomId(deepLinkRoomId);
            setTimeout(() => setHighlightRoomId(null), 2500);
          }, 100);
        }
      } catch (e: unknown) {
        setErr(e instanceof Error ? e.message : 'Fetch failed');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, deepLinkRoomId]);

  const roomsRef = useRef<HTMLDivElement | null>(null);
  const goToRooms = () => roomsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const nights = useMemo(() => {
    const ci = new Date(checkIn);
    const co = new Date(checkOut);
    const diff = Math.round((co.getTime() - ci.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(diff, 1);
  }, [checkIn, checkOut]);

  const totalGuests = adults + children;

  function ensureDatesValid(): string | null {
    if (!checkIn || !checkOut) return 'Vui lòng chọn ngày nhận và trả phòng';
    const ci = new Date(checkIn);
    const co = new Date(checkOut);
    if (isNaN(ci.getTime()) || isNaN(co.getTime())) return 'Ngày không hợp lệ';
    if (co <= ci) return 'Ngày trả phòng phải sau ngày nhận phòng';
    return null;
  }

  function checkRoomConstraints(r: ApiRoom, roomsWanted: number): string | null {
    if (roomsWanted > (r.availableRooms ?? 0))
      return `Chỉ còn ${r.availableRooms} phòng “${r.roomType}”`;
    if (r.capacity && r.capacity * roomsWanted < totalGuests)
      return `Sức chứa không đủ: ${roomsWanted} phòng x ${r.capacity} khách/phòng < ${totalGuests} khách`;
    return null;
  }

  /* ----- Server actions: Basket & Booking ----- */

  async function apiAddToCart(room: ApiRoom, quantity: number) {
    const userId = getOrCreateUserId();
    const payload = {
      productId: room.id, // as required by Swagger
      quantity,
      price: room.pricePerNight,
    };
    await postJSON(`${API_BASE}/api/Basket/${userId}/items`, payload);
  }

  async function apiBookNow(room: ApiRoom, quantity: number) {
    // Adjust payload to match your Booking API, if needed
    const payload = {
      checkIn,
      checkOut,
      rooms: quantity,
    };
    await postJSON(`${API_BASE}/api/Booking/${room.id}`, payload);
  }

  function addLocalCartMirror(h: ApiHotel, r: ApiRoom, roomsWanted: number) {
    const item: LocalCartItem = {
      kind: 'hotel',
      hotelId: h.id,
      hotelName: h.name,
      roomId: r.id,
      roomType: r.roomType,
      nights,
      rooms: roomsWanted,
      checkIn,
      checkOut,
      pricePerNight: r.pricePerNight,
      subtotal: r.pricePerNight * nights * roomsWanted,
    };
    addLocalCart(item);
  }

  /* ----- UI states ----- */
  if (loading) return <SkeletonUI />;
  if (is404)
    return <EmptyState title="Không tìm thấy khách sạn" subtitle="Vui lòng quay lại Trang chủ" />;
  if (err) return <ErrorState message={err} />;
  if (!hotel) return null;

  const mapsUrl = buildMapsURL({
    address: hotel.address,
    city: hotel.city,
    country: hotel.country,
  });
  const selectedRoom: ApiRoom | undefined = hotel.rooms?.find((r) => r.id === deepLinkRoomId);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-28 pt-6 sm:px-6 lg:px-8">
      {/* Header */}
      <HeroHeader
        hotel={hotel}
        mapsUrl={mapsUrl}
        onShare={() => navigator?.share?.({ title: hotel.name })}
      />

      <div className="mt-4 grid gap-6 md:grid-cols-12">
        {/* Left */}
        <div className="md:col-span-8">
          <Gallery />

          {/* Highlights */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
          >
            <Badge>
              <Sparkles className="h-4 w-4" /> Phòng sạch & mới
            </Badge>
            <Badge>
              <BadgeCheck className="h-4 w-4" /> Xác nhận tức thì
            </Badge>
            <Badge>
              <DoorOpen className="h-4 w-4" /> Check-in 24/7
            </Badge>
            <Badge>
              <ShieldCheck className="h-4 w-4" /> An ninh tốt
            </Badge>
          </motion.div>

          {/* ===== Rooms ===== */}
          <section ref={roomsRef} className="mt-8">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {selectedRoom ? 'Chi tiết phòng' : 'Phòng còn trống'}
              </h2>
              {!selectedRoom && (
                <button
                  onClick={goToRooms}
                  className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
                >
                  Xem phòng <ChevronRight className="h-4 w-4" />
                </button>
              )}
            </div>

            {selectedRoom ? (
              <RoomDetailPanel
                room={selectedRoom}
                qty={qty[selectedRoom.id] ?? 1}
                setQty={(n) => setQtyFor(selectedRoom.id, Math.min(n, selectedRoom.availableRooms))}
                nights={nights}
                totalGuests={totalGuests}
                onAddToCart={async () => {
                  const q = qty[selectedRoom.id] ?? 1;
                  const errMsg = ensureDatesValid() || checkRoomConstraints(selectedRoom, q);
                  if (errMsg) {
                    showError(errMsg);
                    return;
                  }
                  try {
                    await apiAddToCart(selectedRoom, q);
                    addLocalCartMirror(hotel, selectedRoom, q);
                    showSuccess('Đã thêm vào giỏ hàng!');
                  } catch (e) {
                    const msg = (e as Error).message || '';
                    if (msg.includes('→ 401'))
                      showError('Bạn cần đăng nhập để thêm vào giỏ hàng (401).');
                    else showError(`Thêm giỏ thất bại: ${msg}`);
                  }
                }}
              />
            ) : !hotel.rooms?.length ? (
              <div className="rounded-2xl border bg-white p-6 text-sm text-zinc-600">
                Chưa có phòng khả dụng.
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
                <table className="min-w-full text-sm">
                  <thead className="bg-zinc-50/70 text-left">
                    <tr>
                      <th className="px-4 py-3 font-medium">Hạng phòng</th>
                      <th className="px-4 py-3 font-medium">Sức chứa</th>
                      <th className="px-4 py-3 font-medium">Còn trống</th>
                      <th className="px-4 py-3 font-medium">Giá/đêm</th>
                      <th className="px-4 py-3 font-medium">Số phòng</th>
                      <th className="px-4 py-3 font-medium">Tổng/đêm</th>
                      <th className="px-4 py-3 text-right font-medium">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hotel.rooms.map((r) => {
                      const q = Math.min(qty[r.id] ?? 1, r.availableRooms || 1);
                      const rowTotal = r.pricePerNight * q;
                      const disableAll = (r.availableRooms ?? 0) <= 0;
                      const highlighted = highlightRoomId === r.id;

                      return (
                        <Fragment key={r.id}>
                          <tr
                            id={`room-${r.id}`}
                            className={`border-t transition-colors ${highlighted ? 'bg-amber-50' : ''}`}
                          >
                            <td className="px-4 py-3">
                              <div className="font-medium text-zinc-900">{r.roomType}</div>
                              <div className="text-xs text-zinc-500">Hoàn huỷ linh hoạt</div>
                              <a
                                href={`?room=${r.id}`}
                                className="mt-1 inline-block text-xs text-blue-600 hover:underline"
                                title="Xem chi tiết phòng"
                              >
                                Chi tiết
                              </a>
                            </td>
                            <td className="px-4 py-3">{r.capacity} khách/phòng</td>
                            <td className="px-4 py-3">
                              {r.availableRooms > 0 ? (
                                <span className="inline-flex items-center gap-1 text-emerald-600">
                                  <CheckCircle2 className="h-4 w-4" /> {r.availableRooms}
                                </span>
                              ) : (
                                <span className="text-zinc-500">Hết</span>
                              )}
                            </td>
                            <td className="px-4 py-3 font-semibold">{VND(r.pricePerNight)}</td>
                            <td className="px-4 py-3">
                              <SmallNumberInput
                                min={1}
                                max={Math.max(1, r.availableRooms ?? 1)}
                                value={q}
                                onChange={(n) =>
                                  setQtyFor(r.id, Math.min(n, r.availableRooms ?? 1))
                                }
                                disabled={disableAll}
                              />
                            </td>
                            <td className="px-4 py-3 font-semibold">{VND(rowTotal)}</td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex flex-wrap justify-end gap-2">
                                <button
                                  type="button"
                                  className="rounded-lg border bg-white px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-zinc-50 disabled:opacity-50"
                                  disabled={disableAll}
                                  onClick={async () => {
                                    const dateErr = ensureDatesValid();
                                    if (dateErr) {
                                      showError(dateErr);
                                      return;
                                    }
                                    const constraint = checkRoomConstraints(r, q);
                                    if (constraint) {
                                      showError(constraint);
                                      return;
                                    }
                                    try {
                                      await apiAddToCart(r, q);
                                      addLocalCartMirror(hotel, r, q);
                                      showSuccess('Đã thêm vào giỏ hàng!');
                                    } catch (e) {
                                      const msg = (e as Error).message || '';
                                      if (msg.includes('→ 401'))
                                        showError('Bạn cần đăng nhập để thêm vào giỏ hàng (401).');
                                      else showError(`Thêm giỏ thất bại: ${msg}`);
                                    }
                                  }}
                                >
                                  Thêm vào giỏ
                                </button>
                                <button
                                  type="button"
                                  className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow hover:bg-blue-700 disabled:opacity-50"
                                  disabled={disableAll}
                                  onClick={async () => {
                                    const dateErr = ensureDatesValid();
                                    if (dateErr) return alert(dateErr);
                                    const constraint = checkRoomConstraints(r, q);
                                    if (constraint) return alert(constraint);
                                    try {
                                      await apiBookNow(r, q);
                                      alert('Đặt phòng thành công!');
                                    } catch (e) {
                                      const msg = (e as Error).message || '';
                                      if (msg.includes('→ 401'))
                                        alert('Bạn cần đăng nhập để đặt phòng (401).');
                                      else alert(`Đặt phòng thất bại: ${msg}`);
                                    }
                                  }}
                                >
                                  Đặt ngay
                                </button>
                              </div>
                            </td>
                          </tr>
                        </Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {!!hotel.description && (
            <section className="mt-8 rounded-2xl border bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold">Giới thiệu</h2>
              <p className="mt-2 leading-7 text-zinc-700">{hotel.description}</p>
            </section>
          )}

          {/* Map */}
          <section className="mt-8">
            <h2 className="mb-3 text-lg font-semibold">Vị trí</h2>
            <div className="overflow-hidden rounded-2xl border bg-white p-0 shadow-sm">
              <div className="flex items-center justify-between px-6 pt-6">
                <div className="flex items-center gap-3 text-zinc-700">
                  <MapPin className="h-5 w-5" />
                  <span>
                    {hotel.address}
                    {hotel.city ? `, ${hotel.city}` : ''}
                    {hotel.country ? `, ${hotel.country}` : ''}
                  </span>
                </div>
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mr-6 inline-flex items-center gap-1 rounded-lg border bg-white px-3 py-1.5 text-sm hover:bg-zinc-50"
                >
                  Xem trên Google Maps <ChevronRight className="h-4 w-4" />
                </a>
              </div>
              <div className="mt-4 h-64 w-full">
                <iframe
                  title="Hotel location"
                  aria-label="Google Map"
                  className="h-full w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  src={buildMapsURL(
                    { address: hotel.address, city: hotel.city, country: hotel.country },
                    { embed: true }
                  )}
                />
              </div>
            </div>
          </section>
        </div>

        {/* Right — sticky booking summary */}
        <div className="md:col-span-4">
          <div className="sticky top-24">
            <div className="rounded-2xl border bg-white p-4 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="text-sm text-zinc-600">Giá từ</div>
                <div className="flex items-center gap-1 text-amber-500">
                  <Star className="h-4 w-4 fill-amber-400" />
                  <span className="text-sm">{hotel.stars}.0</span>
                </div>
              </div>
              <div className="mt-1 text-2xl font-semibold">
                {VND(hotel.rooms?.[0]?.pricePerNight ?? 0)}
                <span className="ml-1 text-sm font-normal text-zinc-500">/ đêm</span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <Field icon={CalendarDays} label="Nhận phòng">
                  <input
                    type="date"
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                  />
                </Field>
                <Field icon={CalendarDays} label="Trả phòng">
                  <input
                    type="date"
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                  />
                </Field>
                <Field icon={Users2} label="Người lớn">
                  <NumberInput value={adults} onChange={setAdults} min={1} />
                </Field>
                <Field icon={Users2} label="Trẻ em">
                  <NumberInput value={children} onChange={setChildren} min={0} />
                </Field>
              </div>

              <div className="mt-3 rounded-xl bg-zinc-50 p-3 text-xs text-zinc-600">
                Chọn phòng & số lượng ở bảng để tính tổng phí chính xác.
              </div>

              <div className="mt-3 flex items-center justify-between text-xs text-zinc-600">
                <div className="inline-flex items-center gap-1">
                  <ShieldCheck className="h-4 w-4" />
                  Thanh toán an toàn
                </div>
                <div className="inline-flex items-center gap-1">
                  <Share2 className="h-4 w-4" />
                  Chia sẻ
                </div>
                <div className="inline-flex items-center gap-1">
                  <Heart className="h-4 w-4" />
                  Lưu
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================
    Partials
  ========================= */
function HeroHeader({
  hotel,
  onShare,
  mapsUrl,
}: {
  hotel: ApiHotel;
  onShare?: () => void;
  mapsUrl?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="overflow-hidden rounded-3xl border bg-white shadow-sm"
    >
      <div className="relative">
        <div className="h-32 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600" />
        <div className="p-6 sm:p-8">
          <div className="-mt-16 flex flex-col items-start gap-3 sm:-mt-12 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/80 px-3 py-1 text-xs text-zinc-700 shadow backdrop-blur">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span>Khách sạn {hotel.stars} sao</span>
              </div>
              <h1 className="mt-2 text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
                {hotel.name}
              </h1>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-zinc-600">
                <StarRating stars={hotel.stars} />
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {hotel.city ? `${hotel.city}, ` : ''}
                  {hotel.country || hotel.address}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl border bg-white px-3 py-2 text-sm shadow-sm hover:bg-zinc-50"
              >
                Mở trên Google Maps
              </a>
              <button
                onClick={onShare}
                className="rounded-xl border bg-white px-3 py-2 text-sm shadow-sm hover:bg-zinc-50"
              >
                Chia sẻ
              </button>
              <button className="rounded-xl border bg-white px-3 py-2 text-sm shadow-sm hover:bg-zinc-50">
                Lưu
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function Gallery() {
  const roomImages = getRoomImages(0); // Use first room's images
  const [mainImage, setMainImage] = useState<string>(
    roomImages[0] || '/images/roomhotel/room1.jpg'
  );
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="grid grid-cols-4 gap-2">
      {/* Main large image */}
      <div className="col-span-4 overflow-hidden rounded-2xl border bg-zinc-100 sm:col-span-2 sm:row-span-2">
        <div className="relative aspect-[16/10] w-full">
          {isLoading && (
            <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-zinc-50 to-zinc-200" />
          )}
          <Image
            src={mainImage}
            alt="Hotel main gallery"
            fill
            className="object-cover"
            priority
            unoptimized
            onLoadingComplete={() => setIsLoading(false)}
          />
        </div>
      </div>
      {/* Thumbnail images */}
      {roomImages.map((src, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-2xl border bg-zinc-100 cursor-pointer hover:ring-2 ring-blue-400 transition"
          onClick={() => setMainImage(src)}
        >
          <div className="relative aspect-[4/3] w-full">
            <Image
              src={src}
              alt={`Room gallery ${i + 1}`}
              fill
              className="object-cover hover:scale-105 transition"
              unoptimized
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function Field({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="mb-1 flex items-center gap-1 text-xs text-zinc-600">
        <Icon className="h-4 w-4" /> {label}
      </div>
      {children}
    </label>
  );
}

function NumberInput({
  value,
  onChange,
  min = 0,
}: {
  value: number;
  onChange: (n: number) => void;
  min?: number;
}) {
  return (
    <div className="flex items-center rounded-lg border">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        className="h-9 w-9 text-lg leading-none text-zinc-700 hover:bg-zinc-50"
      >
        −
      </button>
      <input
        type="number"
        min={min}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-9 w-full flex-1 appearance-none border-x px-2 text-center text-sm"
      />
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        className="h-9 w-9 text-lg leading-none text-zinc-700 hover:bg-zinc-50"
      >
        +
      </button>
    </div>
  );
}

function SmallNumberInput({
  value,
  onChange,
  min = 1,
  max = 99,
  disabled,
}: {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
}) {
  return (
    <div className={`inline-flex items-center rounded-lg border ${disabled ? 'opacity-50' : ''}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(Math.max(min, value - 1))}
        className="h-8 w-8 text-lg leading-none text-zinc-700 hover:bg-zinc-50"
      >
        −
      </button>
      <input
        type="number"
        min={min}
        max={max}
        disabled={disabled}
        value={value}
        onChange={(e) => onChange(Math.min(max, Math.max(min, Number(e.target.value))))}
        className="h-8 w-16 appearance-none border-x px-2 text-center text-sm"
      />
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(Math.min(max, value + 1))}
        className="h-8 w-8 text-lg leading-none text-zinc-700 hover:bg-zinc-50"
      >
        +
      </button>
    </div>
  );
}

function SkeletonUI() {
  return (
    <div className="mx-auto max-w-7xl animate-pulse px-4 pb-20 pt-8 sm:px-6 lg:px-8">
      <div className="h-40 rounded-3xl bg-gradient-to-r from-zinc-100 to-zinc-200" />
      <div className="mt-6 grid gap-6 md:grid-cols-12">
        <div className="space-y-4 md:col-span-8">
          <div className="h-64 rounded-2xl bg-zinc-100" />
          <div className="h-40 rounded-2xl bg-zinc-100" />
          <div className="h-64 rounded-2xl bg-zinc-100" />
        </div>
        <div className="md:col-span-4">
          <div className="h-96 rounded-2xl bg-zinc-100" />
        </div>
      </div>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="mx-auto max-w-2xl rounded-2xl border bg-white p-6 text-center shadow-sm">
      <div className="mx-auto h-14 w-14 rounded-full bg-red-50 p-3">
        <span className="block h-full w-full rounded-full bg-red-100" />
      </div>
      <h2 className="mt-3 text-lg font-semibold">Lỗi tải dữ liệu</h2>
      <p className="mt-1 text-sm text-zinc-600">{message}</p>
    </div>
  );
}

function EmptyState({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mx-auto max-w-2xl rounded-2xl border bg-white p-8 text-center shadow-sm">
      <h2 className="text-lg font-semibold">{title}</h2>
      {subtitle && <p className="mt-1 text-sm text-zinc-600">{subtitle}</p>}
    </div>
  );
}

/* ===== Single-room detail panel ===== */
function RoomDetailPanel({
  room,
  qty,
  setQty,
  nights,
  totalGuests,
  onAddToCart,
}: {
  room: ApiRoom;
  qty: number;
  setQty: (n: number) => void;
  nights: number;
  totalGuests: number;
  onAddToCart: () => void;
}) {
  const perNight = room.pricePerNight;
  const subtotal = perNight * qty * nights;
  const tax = Math.round(subtotal * 0.1);

  return (
    <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
      <div className="grid gap-4 p-4 md:grid-cols-3">
        {/* (mock) image */}
        <div className="md:col-span-1">
          <div className="aspect-[4/3] w-full overflow-hidden rounded-xl border bg-zinc-100" />
        </div>

        <div className="md:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <div className="text-xs text-zinc-500">Hạng phòng</div>
              <h3 className="text-xl font-semibold text-zinc-900">{room.roomType}</h3>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                <Badge>
                  <Users2 className="h-4 w-4" /> {room.capacity} khách/phòng
                </Badge>
                <Badge>
                  <CheckCircle2 className="h-4 w-4" /> {room.availableRooms} phòng còn
                </Badge>
                <Badge>Hoàn huỷ linh hoạt</Badge>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-zinc-500">Giá/đêm</div>
              <div className="text-2xl font-bold text-emerald-600">{VND(perNight)}</div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="rounded-xl bg-zinc-50 p-3 text-sm">
              <div className="text-zinc-600">Số phòng</div>
              <div className="mt-1">
                <SmallNumberInput
                  value={qty}
                  onChange={(n) => setQty(Math.min(n, Math.max(1, room.availableRooms)))}
                  min={1}
                  max={Math.max(1, room.availableRooms)}
                />
              </div>
            </div>
            <div className="rounded-xl bg-zinc-50 p-3 text-sm">
              <div className="text-zinc-600">Số đêm</div>
              <div className="mt-1 font-semibold">{nights}</div>
            </div>
            <div className="rounded-xl bg-zinc-50 p-3 text-sm">
              <div className="text-zinc-600">Tổng khách</div>
              <div className="mt-1 font-semibold">{totalGuests}</div>
            </div>
          </div>

          <div className="mt-4 rounded-xl border p-3 text-sm">
            <div className="flex items-center justify-between">
              <span>Tạm tính</span>
              <span className="font-semibold">{VND(subtotal)}</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-zinc-600">
              <span>Thuế & phí (10%)</span>
              <span>{VND(tax)}</span>
            </div>
            <div className="mt-2 border-t pt-2 text-base font-semibold">
              Tổng: {VND(subtotal + tax)}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={onAddToCart}
              className="rounded-xl border bg-white px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-zinc-50"
            >
              Thêm vào giỏ
            </button>
            <a
              href="."
              className="ml-auto rounded-xl border bg-white px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
              title="Xem các hạng phòng khác"
            >
              ← Xem tất cả phòng
            </a>
          </div>

          <div className="mt-6">
            <h4 className="font-medium">Tiện nghi nổi bật</h4>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {AMENITIES.slice(0, 6).map((a) => (
                <div key={a.key} className="flex items-center gap-2 text-sm text-zinc-700">
                  <a.icon className="h-4 w-4" />
                  {a.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
