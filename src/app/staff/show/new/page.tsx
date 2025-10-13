// src/app/staff/show/new/page.tsx
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_BASE } from '@/data/show.api';
import { getAuth } from '@/lib/auth';

/* =================== Types =================== */
type FormState = {
  name: string;
  location: string;
  city: string; // sẽ gán = tên tỉnh khi submit
  startDate: string; // datetime-local
  endDate: string; // datetime-local
  price: string;
  availableTickets: string;
};

type CreateShowResp = {
  id: string;
  name: string;
  location: string;
  city: string;
  startDate: string;
  endDate: string;
  price: number;
  availableTickets: number;
  dateCreated?: string;
  modifiedDate?: string;
};

type Province = { code: number; name: string; name_en?: string };
type District = { code: number; name: string; province_code?: number };

type VMPlace = { name: string; address?: string };
type VietMapRes =
  | {
      data?: Array<{ name?: string; address?: string }>;
      features?: Array<{
        properties?: { name?: string; full_address?: string };
        text?: string;
        place_name?: string;
      }>;
    }
  | Array<{ name?: string; address?: string }>
  | Record<string, unknown>;

/* ================ Utils ================ */
function toIso(dtLocal: string): string | undefined {
  if (!dtLocal) return undefined;
  const ms = Date.parse(dtLocal);
  if (Number.isNaN(ms)) return undefined;
  return new Date(ms).toISOString();
}
function errorMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (typeof e === 'object' && e && 'toString' in e) return String(e as object);
  return 'Đã xảy ra lỗi';
}

function isProvinceArray(x: unknown): x is Province[] {
  return (
    Array.isArray(x) && x.every((i) => typeof i?.code === 'number' && typeof i?.name === 'string')
  );
}
function isDistrictArray(x: unknown): x is District[] {
  return (
    Array.isArray(x) && x.every((i) => typeof i?.code === 'number' && typeof i?.name === 'string')
  );
}

/* =================== Component =================== */
export default function StaffShowCreatePage() {
  const router = useRouter();

  const [form, setForm] = useState<FormState>({
    name: '',
    location: '',
    city: '',
    startDate: '',
    endDate: '',
    price: '',
    availableTickets: '',
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  // 👉 hàm quay về danh sách
  const goBackToList = () => router.push('/staff/show');

  /* ---------- Provinces/Districts (Open API v1) ---------- */
  const OPEN = 'https://provinces.open-api.vn/api';

  const [provinces, setProvinces] = useState<Province[]>([]);
  const [provLoading, setProvLoading] = useState(true);
  const [provErr, setProvErr] = useState<string | null>(null);

  const [districts, setDistricts] = useState<District[]>([]);
  const [distLoading, setDistLoading] = useState(false);
  const [distErr, setDistErr] = useState<string | null>(null);

  const [provinceCode, setProvinceCode] = useState<number | undefined>();
  const [districtCode, setDistrictCode] = useState<number | undefined>();

  const currentProvinceName = useMemo(
    () => provinces.find((p) => p.code === provinceCode)?.name,
    [provinces, provinceCode]
  );
  const currentDistrictName = useMemo(
    () => districts.find((d) => d.code === districtCode)?.name,
    [districts, districtCode]
  );

  // load provinces
  useEffect(() => {
    (async () => {
      setProvLoading(true);
      setProvErr(null);
      try {
        const res = await fetch(`${OPEN}/p/`, { cache: 'force-cache' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const raw: unknown = await res.json();
        const list = isProvinceArray((raw as { results?: unknown })?.results ?? raw)
          ? ((raw as { results?: Province[] }).results ?? (raw as Province[]))
          : [];
        setProvinces(list.sort((a, b) => a.name.localeCompare(b.name, 'vi')));
      } catch (e) {
        setProvErr(errorMessage(e));
      } finally {
        setProvLoading(false);
      }
    })();
  }, []);

  // load districts by province
  async function loadDistrictsByProvince(code?: number) {
    setDistricts([]);
    setDistrictCode(undefined);
    if (!code) return;
    setDistLoading(true);
    setDistErr(null);
    try {
      const res = await fetch(`${OPEN}/p/${code}?depth=2`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: unknown = await res.json();
      const list = isDistrictArray((data as { districts?: unknown })?.districts)
        ? ((data as { districts?: District[] }).districts as District[])
        : [];
      setDistricts(list.sort((a, b) => a.name.localeCompare(b.name, 'vi')));
    } catch (e) {
      setDistErr(errorMessage(e));
    } finally {
      setDistLoading(false);
    }
  }

  /* ---------- VietMap Autocomplete (optional) ---------- */
  const VM_BASE = 'https://maps.vietmap.vn/api/autocomplete/v3';
  const VM_KEY = process.env.NEXT_PUBLIC_VIETMAP_API_KEY;
  const [streetQuery, setStreetQuery] = useState('');
  const [streetOpts, setStreetOpts] = useState<{ label: string; value: string }[]>([]);
  const [streetLoading, setStreetLoading] = useState(false);
  const debounceRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!VM_KEY) {
      setStreetOpts([]);
      return;
    }
    // debounce 300ms
    window.clearTimeout(debounceRef.current);
    if (!streetQuery.trim()) {
      setStreetOpts([]);
      return;
    }
    debounceRef.current = window.setTimeout(async () => {
      setStreetLoading(true);
      try {
        const contextual = [streetQuery.trim(), currentDistrictName, currentProvinceName]
          .filter(Boolean)
          .join(', ');
        const url = `${VM_BASE}?text=${encodeURIComponent(contextual)}&apikey=${encodeURIComponent(
          VM_KEY
        )}&limit=8`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: VietMapRes = await res.json();

        // Chuẩn hoá về mảng VMPlace
        const arr: VMPlace[] = Array.isArray((data as { data?: unknown[] }).data)
          ? ((data as { data?: Array<{ name?: string; address?: string }> }).data ?? []).map(
              (x) => ({
                name: x?.name ?? '',
                address: x?.address ?? '',
              })
            )
          : Array.isArray((data as { features?: unknown[] }).features)
            ? (
                (
                  data as {
                    features?: Array<{
                      properties?: { name?: string; full_address?: string };
                      text?: string;
                      place_name?: string;
                    }>;
                  }
                ).features ?? []
              ).map((x) => ({
                name: x?.properties?.name || x?.text || '',
                address: x?.properties?.full_address || x?.place_name || '',
              }))
            : [];

        setStreetOpts(
          arr
            .filter((x) => x.name)
            .map((x) => ({
              label: x.address ? `${x.name} — ${x.address}` : x.name,
              value: x.name,
            }))
        );
      } catch {
        setStreetOpts([]);
      } finally {
        setStreetLoading(false);
      }
    }, 300);
    return () => window.clearTimeout(debounceRef.current);
  }, [streetQuery, currentProvinceName, currentDistrictName, VM_KEY]);

  /* ---------- Submit enable/disable ---------- */
  const disabled = useMemo(() => {
    if (loading) return true;
    if (!form.name.trim()) return true;
    if (!currentProvinceName) return true;
    const loc = form.location.trim() || streetQuery.trim();
    if (!loc) return true;
    if (!form.startDate || !form.endDate) return true;
    if (!form.price) return true;
    if (!form.availableTickets) return true;
    return false;
  }, [form, loading, currentProvinceName, streetQuery]);

  /* ---------------- Submit ---------------- */
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (disabled) return;

    setErr(null);
    setOkMsg(null);
    setLoading(true);

    try {
      const startIso = toIso(form.startDate);
      const endIso = toIso(form.endDate);
      if (!startIso || !endIso) throw new Error('Ngày/giờ không hợp lệ');

      const priceNum = Number(form.price);
      const ticketsNum = Number(form.availableTickets);
      if (!Number.isFinite(priceNum) || priceNum < 0) throw new Error('Giá phải là số ≥ 0');
      if (!Number.isInteger(ticketsNum) || ticketsNum < 0)
        throw new Error('Số vé phải là số nguyên ≥ 0');

      const locationValue = (form.location || streetQuery).trim();
      const cityValue = currentProvinceName || '';

      const body = {
        name: form.name.trim(),
        location: locationValue,
        city: cityValue,
        startDate: startIso,
        endDate: endIso,
        price: priceNum,
        availableTickets: ticketsNum,
      };

      const { accessToken } = getAuth();
      const res = await fetch(`${API_BASE}/api/Show`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? ({ Authorization: `Bearer ${accessToken}` } as const) : {}),
        },
        credentials: 'include',
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(text || `HTTP ${res.status}`);
      }

      // Nếu không dùng dữ liệu trả về, chỉ cần await để tránh ESLint "unused".
      await res.json(); // hoặc: void (await res.json());

      setOkMsg('Tạo show thành công!');
      setTimeout(() => {
        goBackToList();
      }, 600);
    } catch (e: unknown) {
      setErr(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  /* =================== UI =================== */
  return (
    <div className="relative">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-br from-sky-100 via-cyan-100 to-teal-100"
      />
      <div className="mx-auto max-w-3xl px-4 py-8">
        <header className="mb-6 flex items-center justify-between">
          <div className="rounded-2xl border border-white/60 bg-white/80 p-5 shadow backdrop-blur">
            <h1 className="text-2xl font-extrabold tracking-tight text-sky-800">🎟️ Tạo Show mới</h1>
            <p className="mt-1 text-sky-900/80 text-sm">
              Chọn <b>Tỉnh/Thành</b> (mới nhất), <b>Quận/Huyện</b> và gõ <b>Đường/Địa điểm</b>. Có
              gợi ý nếu cấu hình VietMap API key.
            </p>
          </div>
          <button
            type="button"
            onClick={goBackToList}
            className="ml-3 rounded-xl border border-sky-200 bg-white px-4 py-2 font-semibold text-sky-700 shadow hover:bg-sky-50"
            title="Về trang quản lý show"
          >
            ← Về quản lý
          </button>
        </header>

        <form
          onSubmit={onSubmit}
          className="space-y-4 rounded-2xl border border-white/60 bg-white/80 p-5 shadow backdrop-blur"
        >
          {/* Name */}
          <div>
            <label className="mb-1 block text-sm font-medium text-sky-900/80">Tên show *</label>
            <input
              className="h-11 w-full rounded-xl border border-sky-200/70 bg-white/90 px-3 outline-none focus:ring-2 focus:ring-sky-300"
              value={form.name}
              onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
              placeholder="VD: Summer Splash 2025"
              required
            />
          </div>

          {/* Province & District */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-sky-900/80">Tỉnh/Thành *</label>
              <select
                value={provinceCode ?? ''}
                onChange={(e) => {
                  const code = Number(e.target.value) || undefined;
                  setProvinceCode(code);
                  setDistrictCode(undefined);
                  setForm((s) => ({ ...s, city: '' }));
                  if (code) void loadDistrictsByProvince(code);
                }}
                className="h-11 w-full rounded-xl border border-sky-200/70 bg-white/90 px-3 outline-none focus:ring-2 focus:ring-sky-300"
                disabled={provLoading}
                required
              >
                <option value="">{provLoading ? 'Đang tải…' : '— Chọn Tỉnh/Thành —'}</option>
                {provinces.map((p) => (
                  <option key={p.code} value={p.code}>
                    {p.name}
                  </option>
                ))}
              </select>
              {provErr && <p className="mt-1 text-xs text-red-600">{provErr}</p>}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-sky-900/80">Quận/Huyện</label>
              <select
                value={districtCode ?? ''}
                onChange={(e) => setDistrictCode(Number(e.target.value) || undefined)}
                className="h-11 w-full rounded-xl border border-sky-200/70 bg-white/90 px-3 outline-none focus:ring-2 focus:ring-sky-300"
                disabled={!provinceCode || distLoading}
              >
                <option value="">{distLoading ? 'Đang tải…' : '— Chọn Quận/Huyện —'}</option>
                {districts.map((d) => (
                  <option key={d.code} value={d.code}>
                    {d.name}
                  </option>
                ))}
              </select>
              {distErr && <p className="mt-1 text-xs text-red-600">{distErr}</p>}
            </div>
          </div>

          {/* Street / Location with optional autocomplete */}
          <div>
            <label className="mb-1 block text-sm font-medium text-sky-900/80">
              Đường / Địa điểm *
            </label>
            <input
              className="h-11 w-full rounded-xl border border-sky-200/70 bg-white/90 px-3 outline-none focus:ring-2 focus:ring-sky-300"
              placeholder="VD: 2 Hai Bà Trưng, Nhà hát lớn…"
              value={streetQuery}
              onChange={(e) => {
                setStreetQuery(e.target.value);
                setForm((s) => ({ ...s, location: e.target.value }));
              }}
              onBlur={() => {
                if (currentProvinceName) setForm((s) => ({ ...s, city: currentProvinceName }));
              }}
              required
              disabled={!provinceCode}
            />
            {VM_KEY && streetLoading && (
              <div className="mt-1 text-xs text-sky-700">Đang gợi ý…</div>
            )}
            {VM_KEY && !!streetOpts.length && (
              <div className="mt-1 max-h-56 overflow-auto rounded-xl border border-sky-200/70 bg-white/90 shadow">
                {streetOpts.map((opt) => (
                  <button
                    type="button"
                    key={opt.label + opt.value}
                    onClick={() => {
                      setStreetQuery(opt.value);
                      setForm((s) => ({
                        ...s,
                        location: opt.value,
                        city: currentProvinceName || s.city,
                      }));
                      setStreetOpts([]);
                    }}
                    className="block w-full px-3 py-2 text-left text-sm hover:bg-sky-50"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
            {!VM_KEY && (
              <p className="mt-1 text-xs text-sky-700">
                (Tuỳ chọn) Bật gợi ý bằng cách thêm{' '}
                <code className="rounded bg-sky-100 px-1">NEXT_PUBLIC_VIETMAP_API_KEY</code> vào
                <code className="rounded bg-sky-100 px-1">.env.local</code>.
              </p>
            )}
          </div>

          {/* Dates */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-sky-900/80">Bắt đầu *</label>
              <input
                type="datetime-local"
                className="h-11 w-full rounded-xl border border-sky-200/70 bg-white/90 px-3 outline-none focus:ring-2 focus:ring-sky-300"
                value={form.startDate}
                onChange={(e) => setForm((s) => ({ ...s, startDate: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-sky-900/80">Kết thúc *</label>
              <input
                type="datetime-local"
                className="h-11 w-full rounded-xl border border-sky-200/70 bg-white/90 px-3 outline-none focus:ring-2 focus:ring-sky-300"
                value={form.endDate}
                onChange={(e) => setForm((s) => ({ ...s, endDate: e.target.value }))}
                required
              />
            </div>
          </div>

          {/* Price & Tickets */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-sky-900/80">Giá (VND) *</label>
              <input
                inputMode="decimal"
                className="h-11 w-full rounded-xl border border-sky-200/70 bg-white/90 px-3 outline-none focus:ring-2 focus:ring-sky-300"
                value={form.price}
                onChange={(e) => setForm((s) => ({ ...s, price: e.target.value }))}
                placeholder="VD: 150000"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-sky-900/80">Số vé *</label>
              <input
                inputMode="numeric"
                className="h-11 w-full rounded-xl border border-sky-200/70 bg-white/90 px-3 outline-none focus:ring-2 focus:ring-sky-300"
                value={form.availableTickets}
                onChange={(e) => setForm((s) => ({ ...s, availableTickets: e.target.value }))}
                placeholder="VD: 100"
                required
              />
            </div>
          </div>

          {err && (
            <div className="rounded-xl border border-red-300/40 bg-red-50/80 px-3 py-2 text-sm text-red-700">
              {err}
            </div>
          )}
          {okMsg && (
            <div className="rounded-xl border border-emerald-300/40 bg-emerald-50/80 px-3 py-2 text-sm text-emerald-700">
              {okMsg}
            </div>
          )}

          <div className="flex items-center gap-2 pt-2">
            <button
              type="submit"
              disabled={disabled}
              className="inline-flex items-center justify-center rounded-xl bg-sky-600 px-4 py-2 font-semibold text-white shadow hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Đang lưu…' : 'Lưu'}
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-xl border border-sky-200 bg-white px-4 py-2 font-semibold text-sky-700 hover:bg-sky-50"
              onClick={goBackToList}
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
