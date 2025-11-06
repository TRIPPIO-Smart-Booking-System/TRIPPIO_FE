import { API_BASE } from '@/data/show.api';

const LS = 'TRIPPIO_ORDER_REVIEWS';

export type Review = {
  id: string;
  orderId: number; // = orderCode
  rating: number;
  comment: string;
  createdAt?: string;
  updatedAt?: string;
};

const loadMap = () => JSON.parse(localStorage.getItem(LS) ?? '{}') as Record<string, Review>;
const saveMap = (m: Record<string, Review>) => localStorage.setItem(LS, JSON.stringify(m));

export async function getReview(orderCode: number, token?: string): Promise<Review | null> {
  // 1) thử cache
  const cache = loadMap()[String(orderCode)];
  // 2) fetch server
  const r = await fetch(`${API_BASE}/api/reviews/by-order/${orderCode}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    cache: 'no-store',
  });
  if (!r.ok) return cache ?? null;
  const srv = (await r.json())?.data as Review | null;
  // 3) sync cache
  const map = loadMap();
  if (srv) map[String(orderCode)] = srv;
  else delete map[String(orderCode)];
  saveMap(map);
  return srv ?? cache ?? null;
}

export async function upsertReview(
  input: { orderCode: number; rating: number; comment: string },
  token?: string
) {
  // Optimistic: lưu cache trước
  const map = loadMap();
  map[String(input.orderCode)] = {
    id: map[String(input.orderCode)]?.id ?? `local_${Math.random().toString(36).slice(2)}`,
    orderId: input.orderCode,
    rating: input.rating,
    comment: input.comment,
  };
  saveMap(map);
  window.dispatchEvent(new CustomEvent('reviews:changed'));

  // Gửi server
  const r = await fetch(`${API_BASE}/api/reviews/upsert`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(input),
  });
  if (!r.ok) throw new Error('Upsert review failed');
  const srv = (await r.json())?.data as Review;

  // Replace cache bằng bản server (id thật)
  const map2 = loadMap();
  map2[String(input.orderCode)] = srv;
  saveMap(map2);
  window.dispatchEvent(new CustomEvent('reviews:changed'));
  return srv;
}

export async function removeReview(orderCode: number, id: string, token?: string) {
  // Xoá server trước
  const r = await fetch(`${API_BASE}/api/reviews/${id}`, {
    method: 'DELETE',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (!r.ok) throw new Error('Delete review failed');
  // Xoá cache
  const map = loadMap();
  delete map[String(orderCode)];
  saveMap(map);
  window.dispatchEvent(new CustomEvent('reviews:changed'));
  return true;
}
