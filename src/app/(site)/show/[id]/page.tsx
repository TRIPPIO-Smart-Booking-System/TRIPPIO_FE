/* eslint react/prop-types: 0 */
'use client';

import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { showSuccess, showError } from '@/lib/toast';
import { formatVietnamDateTime } from '@/lib/timezone';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'https://trippio.azurewebsites.net';

// ===== Types =====
type ApiShow = {
  id: string;
  name: string;
  location: string;
  city: string;
  startDate: string;
  endDate: string;
  price: number; // đơn giá (nguồn data master của show)
  availableTickets: number;
  dateCreated: string;
  modifiedDate: string | null;
};

// ===== Helpers =====
const USER_ID_KEY = 'userId';
const AUTH_TOKEN_KEY = 'authToken';

function money(n: number, currency: 'VND' | 'USD' = 'VND') {
  return n.toLocaleString(currency === 'VND' ? 'vi-VN' : 'en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: currency === 'VND' ? 0 : 2,
  });
}
function dt(s: string) {
  return formatVietnamDateTime(s, 'vi-VN', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
function getUserId(): string | null {
  try {
    return localStorage.getItem(USER_ID_KEY);
  } catch {
    return null;
  }
}
function getAuthToken(): string | null {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
}
function authHeaders(): HeadersInit {
  const t = getAuthToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}
async function postJSON<T = unknown>(url: string, data?: unknown, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...(init?.headers || {}),
    },
    body: data ? JSON.stringify(data) : undefined,
    ...init,
  });
  if (!res.ok) {
    let detail = '';
    try {
      detail = await res.text();
    } catch {}
    throw new Error(`POST ${url} → ${res.status}${detail ? ` | ${detail}` : ''}`);
  }
  try {
    return (await res.json()) as T;
  } catch {
    return {} as T;
  }
}

export default function ShowDetailPage() {
  const params = useParams();
  const id = (params?.id as string) ?? '';

  const [show, setShow] = useState<ApiShow | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [is404, setIs404] = useState(false);

  const [qty, setQty] = useState(1);
  const [currency, setCurrency] = useState<'VND' | 'USD'>('VND');

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        setIs404(false);

        const res = await fetch(`${API_BASE}/api/Show/${id}`, { cache: 'no-store' });
        if (res.status === 404) {
          setIs404(true);
          setShow(null);
          return;
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = (await res.json()) as ApiShow;
        if (!data?.id) throw new Error('Invalid payload');
        setShow(data);
      } catch (e: unknown) {
        setErr(e instanceof Error ? e.message : 'Fetch failed');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const soldOut = (show?.availableTickets ?? 0) <= 0;
  const total = useMemo(() => (show ? show.price * qty : 0), [show, qty]);

  async function addToCart() {
    if (!show) return;
    const userId = getUserId();
    const token = getAuthToken();
    if (!userId || !token) {
      showError('Bạn cần đăng nhập trước khi thêm vào giỏ hàng.');
      return;
    }
    if (qty < 1) {
      showError('Số lượng phải ≥ 1');
      return;
    }
    if (qty > show.availableTickets) {
      showError(`Vượt quá số vé còn lại (${show.availableTickets}).`);
      return;
    }

    try {
      // ✅ GỬI unitPrice cho BE (đồng bộ schema Basket)
      await postJSON(`${API_BASE}/api/Basket/${userId}/items`, {
        productId: show.id,
        quantity: qty,
        unitPrice: show.price, // <— KHÁC BIỆT CHÍNH
        // price: show.price,   // (tuỳ chọn) backward-compat
      });
      window.dispatchEvent(new CustomEvent('basket:changed'));
      showSuccess('Đã thêm vào giỏ hàng!');
    } catch (e) {
      const msg = (e as Error).message || '';
      if (msg.includes('→ 401')) {
        showError('Phiên đăng nhập hết hạn hoặc thiếu token (401). Vui lòng đăng nhập lại.');
      } else {
        showError(`Thêm giỏ thất bại: ${msg}`);
      }
    }
  }

  if (loading) return <div className="mx-auto max-w-7xl p-6">Đang tải show…</div>;
  if (is404) return <div className="mx-auto max-w-7xl p-6">Không tìm thấy sự kiện.</div>;
  if (err) return <div className="mx-auto max-w-7xl p-6 text-red-600">Lỗi: {err}</div>;
  if (!show) return null;

  return (
    <div className="relative">
      {/* background hero */}
      <div
        aria-hidden
        className="absolute inset-0 -z-20 bg-cover bg-center"
        style={{ backgroundImage: "url('/img/parks/waterpark-hero.jpg')" }}
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          backgroundImage:
            'radial-gradient(ellipse at 30% 10%, rgba(56,189,248,0.35), transparent 60%), radial-gradient(ellipse at 70% 20%, rgba(45,212,191,0.35), transparent 60%)',
        }}
      />
      <div aria-hidden className="absolute inset-0 -z-5 bg-white/40 backdrop-blur-[1.5px]" />

      <div className="mx-auto max-w-7xl pb-20">
        {/* HERO */}
        <div className="relative h-56 w-full overflow-hidden rounded-b-[2rem] bg-gradient-to-r from-sky-400 via-cyan-400 to-teal-400">
          <div
            className="absolute inset-0 opacity-15"
            style={{
              backgroundImage: 'radial-gradient(white 2px, transparent 2px)',
              backgroundSize: '24px 24px',
            }}
          />
          <div className="absolute left-6 top-8 text-white drop-shadow">
            <div className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">
              🎡 Sự kiện giải trí
            </div>
            <h1 className="mt-3 text-3xl font-extrabold leading-tight">{show.name}</h1>
            <p className="mt-1 text-sm opacity-90">
              {show.location}, {show.city}
            </p>
          </div>
          <div className="absolute right-6 top-8 rounded-xl bg-white/90 px-4 py-2 text-sky-700 shadow-md">
            <div className="text-xs">Giá từ</div>
            <div className="text-xl font-bold">{money(show.price, currency)}/vé</div>
          </div>
        </div>

        {/* BODY */}
        <div className="mt-6 grid gap-6 px-4 sm:px-6 lg:grid-cols-12 lg:px-8">
          {/* LEFT */}
          <div className="space-y-4 lg:col-span-8">
            <nav className="text-sm">
              <a href="/show" className="text-sky-700 hover:underline">
                ← Quay lại danh sách
              </a>
            </nav>

            <section className="rounded-2xl border bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold">Thông tin chương trình</h2>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <Info label="Thời gian bắt đầu" value={dt(show.startDate)} />
                <Info label="Thời gian kết thúc" value={dt(show.endDate)} />
                <Info label="Địa điểm" value={`${show.location}, ${show.city}`} />
                <Info
                  label="Tình trạng vé"
                  value={
                    (show.availableTickets ?? 0) <= 0 ? 'Hết vé' : `${show.availableTickets} vé còn`
                  }
                  pillClass={
                    (show.availableTickets ?? 0) <= 0
                      ? 'bg-zinc-100 text-zinc-600'
                      : 'bg-emerald-50 text-emerald-700'
                  }
                />
              </div>
            </section>

            <section className="rounded-2xl border bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold">Mô tả</h2>
              <p className="mt-2 leading-7 text-zinc-700">
                Trải nghiệm biểu diễn nghệ thuật đặc sắc trong không gian rực rỡ sắc màu. Phù hợp
                cho gia đình và nhóm bạn – vibe công viên nước tươi mát. 🌊✨
              </p>
            </section>
          </div>

          {/* RIGHT – BOOKING */}
          <aside className="lg:col-span-4">
            <div className="sticky top-24 rounded-2xl border bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="text-sm text-zinc-600">Tiền tệ</div>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as 'VND' | 'USD')}
                  className="h-9 rounded-lg border px-3 text-sm outline-none focus:ring-2 focus:ring-sky-200"
                >
                  <option value="VND">VND</option>
                </select>
              </div>

              <div className="mt-2 text-2xl font-bold text-orange-600">
                {money(show.price, currency)}{' '}
                <span className="text-sm font-normal text-zinc-500">/ vé</span>
              </div>

              <div className="mt-3 flex items-center justify-between rounded-xl bg-zinc-50 p-3">
                <span className="text-sm">Số lượng vé</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="h-8 w-8 rounded border hover:bg-zinc-100"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    aria-label="Giảm"
                  >
                    −
                  </button>
                  <span className="w-8 text-center font-medium">{qty}</span>
                  <button
                    type="button"
                    className="h-8 w-8 rounded border hover:bg-zinc-100"
                    onClick={() =>
                      setQty((q) => Math.min(Math.max(1, show.availableTickets), q + 1))
                    }
                    aria-label="Tăng"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between text-sm">
                <span>Tổng tiền</span>
                <span className="text-lg font-bold">{money(total, currency)}</span>
              </div>

              <button
                type="button"
                disabled={soldOut}
                className={`mt-3 h-11 w-full rounded-xl font-semibold ${
                  soldOut
                    ? 'cursor-not-allowed bg-zinc-200 text-zinc-500'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
                onClick={addToCart}
              >
                {soldOut ? 'Hết vé' : 'Thêm vào giỏ hàng'}
              </button>

              <p className="mt-2 text-center text-xs text-zinc-500">
                * Vé điện tử sẽ được gửi qua email/số điện thoại.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value, pillClass }: { label: string; value: string; pillClass?: string }) {
  return (
    <div className="rounded-xl border p-3">
      <div className="text-xs text-zinc-500">{label}</div>
      <div
        className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-sm ${pillClass ?? 'bg-sky-50 text-sky-700'}`}
      >
        {value}
      </div>
    </div>
  );
}
