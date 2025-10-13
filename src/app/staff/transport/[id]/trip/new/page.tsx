// src/app/staff/transport/[id]/trip/new/page.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getAuth } from '@/lib/auth';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:7142';

/* ==================== Types ==================== */
type ApiTransport = {
  id: string;
  transportType: string; // Airline | Train | Bus | ...
  name: string;
  dateCreated: string;
  modifiedDate: string | null;
};

type TripCore = {
  transportId: string;
  departure: string;
  destination: string;
  departureTime: string; // "YYYY-MM-DDTHH:mm:ss" (no timezone)
  arrivalTime: string; // "YYYY-MM-DDTHH:mm:ss" (no timezone)
  price: number;
  availableSeats: number;
};

type TripRoot = {
  transportTrip: TripCore & {
    transport?: {
      id: string;
      transportType: string;
      name: string;
      dateCreated: string;
      modifiedDate: string | null;
      transportTrips: unknown[];
    };
  };
};

type Province = { code: number; name: string; name_en?: string };

/* ==================== Utils ==================== */
function authHeaders(): HeadersInit {
  const { accessToken } = getAuth();
  return {
    'Content-Type': 'application/json',
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };
}
function errMsg(e: unknown): string {
  return e instanceof Error ? e.message : 'Đã xảy ra lỗi';
}

// Chuẩn hoá value từ <input type="datetime-local"> thành "YYYY-MM-DDTHH:mm:ss" (không Z)
function toLocalNoTZ(dtLocal: string): string | undefined {
  if (!dtLocal) return undefined;
  // input có dạng "YYYY-MM-DDTHH:mm" hoặc "YYYY-MM-DDTHH:mm:ss"
  return dtLocal.length === 16 ? `${dtLocal}:00` : dtLocal;
}

// Đọc lỗi .NET gọn gàng + log để debug
async function readError(res: Response): Promise<string> {
  const text = await res.text().catch(() => '');
  console.error('POST /TransportTrip FAILED', res.status, text); // <-- debug log
  try {
    const j = JSON.parse(text) as {
      title?: string;
      errors?: Record<string, string[]>;
      message?: string;
      detail?: string;
    };
    if (j?.errors) {
      const lines = Object.entries(j.errors).flatMap(([k, arr]) =>
        (arr ?? []).map((m) => (k === '' || k === 'null' ? m : `${k}: ${m}`))
      );
      if (lines.length) return lines.join('\n');
    }
    return j?.message || j?.detail || j?.title || text || `HTTP ${res.status}`;
  } catch {
    return text || `HTTP ${res.status}`;
  }
}

function saysTransportRequired(msg: string) {
  return /(^|[\s:])Transport\b.*required/i.test(msg);
}
function saysTransportTripRequired(msg: string) {
  return /transportTrip\b.*required/i.test(msg);
}

/* ==================== Page ==================== */
export default function TransportTripCreatePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const transportId = params?.id;

  const [transport, setTransport] = useState<ApiTransport | null>(null);
  const [loadingInfo, setLoadingInfo] = useState(true);
  const [infoErr, setInfoErr] = useState<string | null>(null);

  // fetch transport info (để hiển thị header + có sẵn data fallback embed)
  useEffect(() => {
    if (!transportId) return;
    (async () => {
      setLoadingInfo(true);
      setInfoErr(null);
      try {
        const res = await fetch(`${API_BASE}/api/Transport/${transportId}`, { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const t: ApiTransport = await res.json();
        setTransport(t);
      } catch (e) {
        setInfoErr(errMsg(e));
      } finally {
        setLoadingInfo(false);
      }
    })();
  }, [transportId]);

  /* -------- provinces dropdown -------- */
  const OPEN = 'https://provinces.open-api.vn/api';
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [provLoading, setProvLoading] = useState(true);
  const [provErr, setProvErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setProvLoading(true);
      setProvErr(null);
      try {
        const res = await fetch(`${OPEN}/p/`, { cache: 'force-cache' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: unknown = await res.json();
        const maybe = (data as { results?: Province[] })?.results ?? data;
        const list: Province[] = Array.isArray(maybe) ? (maybe as Province[]) : [];
        list.sort((a, b) => a.name.localeCompare(b.name, 'vi'));
        setProvinces(list);
      } catch (e) {
        setProvErr(errMsg(e));
      } finally {
        setProvLoading(false);
      }
    })();
  }, []);

  /* -------- form states -------- */
  const [depProvinceCode, setDepProvinceCode] = useState<number | undefined>();
  const [destProvinceCode, setDestProvinceCode] = useState<number | undefined>();
  const [depCustom, setDepCustom] = useState('');
  const [destCustom, setDestCustom] = useState('');

  const depName = useMemo(
    () => provinces.find((p) => p.code === depProvinceCode)?.name,
    [provinces, depProvinceCode]
  );
  const destName = useMemo(
    () => provinces.find((p) => p.code === destProvinceCode)?.name,
    [provinces, destProvinceCode]
  );

  const [departureTime, setDepartureTime] = useState('');
  const [arrivalTime, setArrivalTime] = useState('');
  const [price, setPrice] = useState('');
  const [seats, setSeats] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [okMsg, setOkMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    if (!transportId) return false;

    const fromCity = depProvinceCode === -1 ? depCustom.trim() : (depName ?? '').trim();
    const toCity = destProvinceCode === -1 ? destCustom.trim() : (destName ?? '').trim();
    if (!fromCity || !toCity) return false;

    if (!departureTime || !arrivalTime) return false;

    const p = Number(price);
    const s = Number(seats);
    if (!Number.isFinite(p) || p < 0) return false;
    if (!Number.isInteger(s) || s < 0) return false;

    return !submitting;
  }, [
    transportId,
    depProvinceCode,
    destProvinceCode,
    depCustom,
    destCustom,
    depName,
    destName,
    departureTime,
    arrivalTime,
    price,
    seats,
    submitting,
  ]);

  async function postTrip(body: TripRoot) {
    const res = await fetch(`${API_BASE}/api/TransportTrip`, {
      method: 'POST',
      headers: authHeaders(),
      credentials: 'include',
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(await readError(res));
    return res.json();
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit || !transportId) return;

    setSubmitting(true);
    setOkMsg(null);
    setErr(null);
    try {
      const dep = toLocalNoTZ(departureTime);
      const arr = toLocalNoTZ(arrivalTime);
      if (!dep || !arr) throw new Error('Thời gian không hợp lệ');
      if (arr <= dep) throw new Error('Giờ đến phải sau giờ khởi hành');

      const fromCity = (depProvinceCode === -1 ? depCustom : (depName ?? '')).trim();
      const toCity = (destProvinceCode === -1 ? destCustom : (destName ?? '')).trim();
      if (fromCity === toCity) throw new Error('Điểm đi và điểm đến phải khác nhau');

      // 1) thử dạng BE yêu cầu wrapper: { transportTrip: { ... } }
      const baseRoot: TripRoot = {
        transportTrip: {
          transportId,
          departure: fromCity,
          destination: toCity,
          departureTime: dep,
          arrivalTime: arr,
          price: Number(price),
          availableSeats: Number(seats),
        },
      };

      try {
        await postTrip(baseRoot);
      } catch (e) {
        const msg = errMsg(e);

        // 2) nếu BE kêu thiếu Transport => embed navigation & retry
        if (saysTransportRequired(msg) && transport) {
          const retryRoot: TripRoot = {
            transportTrip: {
              ...baseRoot.transportTrip,
              transport: {
                id: transport.id,
                transportType: transport.transportType,
                name: transport.name,
                dateCreated: transport.dateCreated ?? new Date().toISOString(),
                modifiedDate: transport.modifiedDate ?? null,
                transportTrips: [],
              },
            },
          };
          await postTrip(retryRoot);
        } else if (saysTransportTripRequired(msg)) {
          // (phòng khi lần đầu bạn vẫn gửi body không có wrapper)
          await postTrip(baseRoot);
        } else {
          throw e;
        }
      }

      setOkMsg('Tạo Trip thành công!');
      // reset form
      setDepartureTime('');
      setArrivalTime('');
      setPrice('');
      setSeats('');
    } catch (e) {
      setErr(errMsg(e));
    } finally {
      setSubmitting(false);
    }
  }

  /* ==================== UI ==================== */
  return (
    <div className="relative min-h-screen w-full overflow-x-clip">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 bg-gradient-to-b from-sky-100/60 via-teal-100/40 to-transparent"
      />
      <div className="mx-auto wull max-w-3xl px-4 pb-16 pt-8">
        <header className="mb-5">
          <div className="rounded-3xl border border-white/60 bg-white/90 p-5 shadow-xl backdrop-blur">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight text-sky-800">
                  ➕ Tạo Trip cho Transport
                </h1>
                {loadingInfo ? (
                  <p className="mt-1 text-sky-900/80">Đang tải thông tin transport…</p>
                ) : infoErr ? (
                  <p className="mt-1 whitespace-pre-wrap text-red-700">{infoErr}</p>
                ) : transport ? (
                  <p className="mt-1 text-sky-900/80">
                    Transport: <b>{transport.transportType}</b> — <b>{transport.name}</b>
                  </p>
                ) : (
                  <p className="mt-1 text-red-700">Không tìm thấy transport.</p>
                )}
              </div>
              <button
                onClick={() => router.push('/staff/transport')}
                className="shrink-0 rounded-xl border border-sky-200 bg-white px-4 py-2 font-semibold text-sky-700 hover:bg-sky-50"
              >
                Về trang quản lý
              </button>
            </div>
          </div>
        </header>

        <form
          onSubmit={onSubmit}
          className="space-y-4 rounded-2xl border border-white/60 bg-white/90 p-5 shadow backdrop-blur"
        >
          {/* From / To */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* From */}
            <div>
              <label className="mb-1 block text-sm text-slate-700">Điểm đi *</label>
              <select
                value={depProvinceCode ?? ''}
                onChange={(e) => {
                  const val = e.target.value;
                  const code = val === '__OTHER__' ? -1 : Number(val) || undefined;
                  setDepProvinceCode(code);
                  if (code !== -1) setDepCustom('');
                }}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white/95 px-3 outline-none focus:ring-2 focus:ring-sky-300"
                disabled={provLoading}
                required
              >
                <option value="">{provLoading ? 'Đang tải…' : '— Chọn Tỉnh/Thành —'}</option>
                {provinces.map((p) => (
                  <option key={p.code} value={p.code}>
                    {p.name}
                  </option>
                ))}
                <option value="__OTHER__">Khác…</option>
              </select>
              {depProvinceCode === -1 && (
                <input
                  className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white/95 px-3 outline-none focus:ring-2 focus:ring-sky-300"
                  placeholder="Nhập tên thành phố/tỉnh"
                  value={depCustom}
                  onChange={(e) => setDepCustom(e.target.value)}
                  required
                />
              )}
              {provErr && <p className="mt-1 text-xs text-red-600">{provErr}</p>}
            </div>

            {/* To */}
            <div>
              <label className="mb-1 block text-sm text-slate-700">Điểm đến *</label>
              <select
                value={destProvinceCode ?? ''}
                onChange={(e) => {
                  const val = e.target.value;
                  const code = val === '__OTHER__' ? -1 : Number(val) || undefined;
                  setDestProvinceCode(code);
                  if (code !== -1) setDestCustom('');
                }}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white/95 px-3 outline-none focus:ring-2 focus:ring-sky-300"
                disabled={provLoading}
                required
              >
                <option value="">{provLoading ? 'Đang tải…' : '— Chọn Tỉnh/Thành —'}</option>
                {provinces.map((p) => (
                  <option key={p.code} value={p.code}>
                    {p.name}
                  </option>
                ))}
                <option value="__OTHER__">Khác…</option>
              </select>
              {destProvinceCode === -1 && (
                <input
                  className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white/95 px-3 outline-none focus:ring-2 focus:ring-sky-300"
                  placeholder="Nhập tên thành phố/tỉnh"
                  value={destCustom}
                  onChange={(e) => setDestCustom(e.target.value)}
                  required
                />
              )}
              {provErr && <p className="mt-1 text-xs text-red-600">{provErr}</p>}
            </div>
          </div>

          {/* Time */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-slate-700">Giờ khởi hành *</label>
              <input
                type="datetime-local"
                className="h-11 w-full rounded-xl border border-slate-200 bg-white/95 px-3 outline-none focus:ring-2 focus:ring-sky-300"
                value={departureTime}
                onChange={(e) => setDepartureTime(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-700">Giờ đến *</label>
              <input
                type="datetime-local"
                className="h-11 w-full rounded-xl border border-slate-200 bg-white/95 px-3 outline-none focus:ring-2 focus:ring-sky-300"
                value={arrivalTime}
                onChange={(e) => setArrivalTime(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Price & Seats */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-slate-700">Giá *</label>
              <input
                inputMode="decimal"
                className="h-11 w-full rounded-xl border border-slate-200 bg-white/95 px-3 outline-none focus:ring-2 focus:ring-sky-300"
                placeholder="VD: 120"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-700">Số chỗ *</label>
              <input
                inputMode="numeric"
                className="h-11 w-full rounded-xl border border-slate-200 bg-white/95 px-3 outline-none focus:ring-2 focus:ring-sky-300"
                placeholder="VD: 180"
                value={seats}
                onChange={(e) => setSeats(e.target.value)}
                required
              />
            </div>
          </div>

          {err && (
            <div className="whitespace-pre-wrap rounded-xl border border-red-200/60 bg-red-50/80 px-3 py-2 text-sm text-red-700">
              {err}
            </div>
          )}
          {okMsg && (
            <div className="rounded-2xl border border-emerald-200/60 bg-emerald-50/80 px-3 py-2 text-sm text-emerald-700">
              {okMsg}
            </div>
          )}

          <div className="flex items-center gap-2 pt-1">
            <button
              type="submit"
              disabled={!canSubmit}
              className="rounded-xl bg-sky-600 px-4 py-2 font-semibold text-white hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Đang tạo…' : 'Tạo Trip'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/staff/transport')}
              className="rounded-xl border border-sky-200 bg-white px-4 py-2 font-semibold text-sky-700 hover:bg-sky-50"
            >
              Về trang quản lý
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
