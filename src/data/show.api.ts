// src/data/show.api.ts
export const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:7142';

export type ApiShow = {
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

export type UpdateShowDto = Partial<{
  name: string;
  location: string;
  city: string;
  startDate: string; // ISO
  endDate: string; // ISO
  price: number;
  availableTickets: number;
}>;

/** Luôn trả về Headers chuẩn, tránh union object gây lỗi TS2769 */
function buildHeaders(withJson = true): Headers {
  const h = new Headers();
  if (withJson) h.set('Content-Type', 'application/json');

  try {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('authToken') || '';
      if (token) h.set('Authorization', `Bearer ${token}`);
    }
  } catch {
    // ignore
  }
  return h;
}

export async function apiListShows(): Promise<ApiShow[]> {
  const res = await fetch(`${API_BASE}/api/Show`, {
    method: 'GET',
    credentials: 'include',
    headers: buildHeaders(false), // GET không bắt buộc Content-Type
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return Array.isArray(data) ? (data as ApiShow[]) : [];
}

export async function apiUpdateShow(id: string, body: UpdateShowDto): Promise<ApiShow> {
  const res = await fetch(`${API_BASE}/api/Show/${id}`, {
    method: 'PUT',
    credentials: 'include',
    headers: buildHeaders(true),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `HTTP ${res.status}`);
  }
  return (await res.json()) as ApiShow;
}

export async function apiDeleteShow(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/Show/${id}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: buildHeaders(false),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `HTTP ${res.status}`);
  }
}
// ---- Formatting utils (export để ShowCard dùng) ----
export function formatDateTime(
  iso?: string,
  locale: string = 'vi-VN',
  opts?: Intl.DateTimeFormatOptions
): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleString(locale, opts ?? { dateStyle: 'medium', timeStyle: 'short' });
}

export function formatMoney(value: number, currency: 'VND' | 'USD' = 'VND'): string {
  try {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency,
      // để VND không có phần thập phân:
      minimumFractionDigits: currency === 'VND' ? 0 : 2,
      maximumFractionDigits: currency === 'VND' ? 0 : 2,
    }).format(value);
  } catch {
    // fallback đơn giản
    return `${value} ${currency}`;
  }
}
