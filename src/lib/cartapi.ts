// src/lib/cartapi.ts
'use client';

export type BasketItem = {
  productId: string;
  quantity: number;
  /** Giá chuẩn dùng thống nhất trong FE */
  unitPrice: number;
  /** Fallback để tương thích BE cũ (nếu còn trả về price) */
  price?: number;
  name?: string;
  kind?: 'hotel' | 'transport' | 'show' | 'flight';
  meta?: Record<string, unknown>;
};

export type Basket = { userId: string; items: BasketItem[] };

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:7142';

const USER_ID_KEY = 'userId';
const TOKEN_KEY = 'authToken';

/* ---------------- User/Token helpers ---------------- */
export function setUserId(userId: string) {
  if (typeof window !== 'undefined') localStorage.setItem(USER_ID_KEY, userId);
}
export function setAuthToken(token: string) {
  if (typeof window !== 'undefined') localStorage.setItem(TOKEN_KEY, token);
}
function getUserId(): string {
  const id = typeof window !== 'undefined' ? localStorage.getItem(USER_ID_KEY) : null;
  if (!id) throw new Error('Missing userId in localStorage');
  return id;
}

/* ---------------- headers helpers ---------------- */
type HeaderMap = Record<string, string>;
function authHeaders(): HeaderMap {
  const t = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
  const h: HeaderMap = {};
  if (t) h.Authorization = `Bearer ${t}`;
  return h;
}
function buildHeaders(base: HeaderMap = {}): HeadersInit {
  return { ...base, ...authHeaders() };
}

/* ---------------- unwrap helpers ---------------- */
function hasData<T>(x: unknown): x is { data: T } {
  return typeof x === 'object' && x !== null && 'data' in (x as Record<string, unknown>);
}
async function safeJson<T = unknown>(res: Response): Promise<T | undefined> {
  // Tránh lỗi khi BE trả 204/empty body
  const text = await res.text();
  if (!text) return undefined as unknown as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    return undefined as unknown as T;
  }
}
function unwrapData<T>(raw: unknown): T {
  return hasData<T>(raw) ? (raw as { data: T }).data : (raw as T);
}

/* ---------------- API payload types from BE ---------------- */
type ApiBasketItemIn = Partial<BasketItem> & Record<string, unknown>;
type ApiBasket = { userId?: string; items?: ApiBasketItemIn[] };

/* ---------------- normalizer ---------------- */
function normalizeItems(itemsIn: ApiBasketItemIn[] = []): BasketItem[] {
  return itemsIn.map((i) => {
    const unitNum = Number(
      (i as Record<string, unknown>)?.unitPrice ?? (i as Record<string, unknown>)?.price ?? 0
    );
    const qNum = Number((i as Record<string, unknown>)?.quantity ?? 0);
    return {
      productId: String((i as Record<string, unknown>)?.productId ?? ''),
      quantity: Number.isNaN(qNum) ? 0 : qNum,
      unitPrice: Number.isNaN(unitNum) ? 0 : unitNum,
      price:
        typeof (i as Record<string, unknown>)?.price === 'number'
          ? (i as { price: number }).price
          : undefined,
      name: (i as Record<string, unknown>)?.name as string | undefined,
      kind: (i as Record<string, unknown>)?.kind as BasketItem['kind'] | undefined,
      meta: (i as Record<string, unknown>)?.meta as Record<string, unknown> | undefined,
    };
  });
}

/* ---------------- API ---------------- */
export async function getBasket(): Promise<Basket> {
  const userId = getUserId();
  const res = await fetch(`${API_BASE}/api/Basket/${encodeURIComponent(userId)}`, {
    headers: buildHeaders({ Accept: 'application/json' }),
    credentials: 'include',
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Basket GET ${res.status}`);
  const raw = await safeJson(res);
  const data = unwrapData<ApiBasket>(raw ?? {});
  return { userId: data?.userId ?? userId, items: normalizeItems(data?.items ?? []) };
}

export async function addItem(item: Pick<BasketItem, 'productId' | 'quantity' | 'unitPrice'>) {
  const userId = getUserId();
  const body = {
    productId: item.productId,
    quantity: item.quantity,
    unitPrice: item.unitPrice, // khóa chuẩn
    price: item.unitPrice, // tương thích ngược (nếu BE cũ dùng price)
  };
  const res = await fetch(`${API_BASE}/api/Basket/${encodeURIComponent(userId)}/items`, {
    method: 'POST',
    headers: buildHeaders({ 'Content-Type': 'application/json', Accept: '*/*' }),
    credentials: 'include',
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Basket ADD ${res.status}`);
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('basket:changed'));
}

export async function updateQuantity(productId: string, quantity: number) {
  const userId = getUserId();
  const res = await fetch(`${API_BASE}/api/Basket/${encodeURIComponent(userId)}/items/quantity`, {
    method: 'PUT',
    headers: buildHeaders({ 'Content-Type': 'application/json', Accept: '*/*' }),
    credentials: 'include',
    body: JSON.stringify({ productId, quantity }),
  });
  if (!res.ok) throw new Error(`Basket UPDATE ${res.status}`);
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('basket:changed'));
}

/** Xoá 1 sản phẩm. Có thể truyền userId (ưu tiên), nếu bỏ qua sẽ lấy từ localStorage. */
export async function removeItem(productId: string, userIdOverride?: string) {
  const userId = userIdOverride ?? getUserId();
  const res = await fetch(
    `${API_BASE}/api/Basket/${encodeURIComponent(userId)}/items/${encodeURIComponent(productId)}`,
    {
      method: 'DELETE',
      headers: buildHeaders({ Accept: '*/*' }),
      credentials: 'include',
    }
  );
  if (!res.ok) throw new Error(`Basket REMOVE ${res.status}`);
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('basket:changed'));
}

export async function clearBasket(userIdOverride?: string) {
  const userId = userIdOverride ?? getUserId();
  const res = await fetch(`${API_BASE}/api/Basket/${encodeURIComponent(userId)}`, {
    method: 'DELETE',
    headers: buildHeaders({ Accept: '*/*' }),
    credentials: 'include',
  });
  if (!res.ok) throw new Error(`Basket CLEAR ${res.status}`);
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('basket:changed'));
}
