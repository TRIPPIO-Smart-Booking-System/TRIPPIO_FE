'use client';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:7142';
const CART_LOCAL_KEY = 'tripio_cart'; // fallback local

export type Currency = 'USD' | 'VND';

export type LocalCartItem = {
  kind: 'transport' | 'product';
  productId?: string;
  tripId?: string;

  vendorId?: string;
  vendorName?: string;
  transportType?: string;
  from?: string;
  to?: string;
  departureTime?: string;
  arrivalTime?: string;

  qty: number;
  price: number; // đơn giá gốc (nên là USD). VND hiển thị nhân 25 ở UI
  currency: Currency;
};

export type BasketItemDTO = {
  productId: string;
  quantity: number;
  price: number;
};

export type BasketDTO = {
  id: string; // userId
  items: BasketItemDTO[];
  total?: number;
};

// ===== helpers =====
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

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const token = getToken();
  const res = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers || {}),
    },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  // một số DELETE có thể không trả JSON
  if (res.status === 204) return undefined as unknown as T;
  return res.json() as Promise<T>;
}

// ======= API GIỎ HÀNG CHUẨN SWAGGER =======
export async function getBasket(): Promise<BasketDTO | null> {
  const userId = getUserId();
  if (!userId) return null;
  try {
    return await api<BasketDTO>(`${API_BASE}/api/Basket/${userId}`);
  } catch {
    return null;
  }
}

export async function clearBasket(): Promise<void> {
  const userId = getUserId();
  if (!userId) throw new Error('No user id');
  await api<void>(`${API_BASE}/api/Basket/${userId}`, { method: 'DELETE' });
}

export async function addBasketItem(productId: string, quantity: number, price: number) {
  const userId = getUserId();
  if (!userId) throw new Error('No user id');

  // POST /api/Basket/{userId}/items  body: { productId, quantity, price }
  return api<BasketItemDTO>(`${API_BASE}/api/Basket/${userId}/items`, {
    method: 'POST',
    body: JSON.stringify({ productId, quantity, price }),
  });
}

export async function updateBasketQuantity(productId: string, quantity: number) {
  const userId = getUserId();
  if (!userId) throw new Error('No user id');

  // PUT /api/Basket/{userId}/items/quantity  body: { productId, quantity }
  return api<BasketItemDTO>(`${API_BASE}/api/Basket/${userId}/items/quantity`, {
    method: 'PUT',
    body: JSON.stringify({ productId, quantity }),
  });
}

export async function removeBasketItem(productId: string) {
  const userId = getUserId();
  if (!userId) throw new Error('No user id');
  // DELETE /api/Basket/{userId}/items/{productId}
  await api<void>(`${API_BASE}/api/Basket/${userId}/items/${productId}`, { method: 'DELETE' });
}

// ======= LOCAL fallback (đang dùng cho vé transport) =======
export function localGet(): LocalCartItem[] {
  try {
    const raw = localStorage.getItem(CART_LOCAL_KEY);
    return raw ? (JSON.parse(raw) as LocalCartItem[]) : [];
  } catch {
    return [];
  }
}
export function localSet(arr: LocalCartItem[]) {
  try {
    localStorage.setItem(CART_LOCAL_KEY, JSON.stringify(arr));
    window.dispatchEvent(new Event('cart:changed'));
  } catch {}
}
export function localAdd(item: LocalCartItem) {
  const list = localGet();
  list.push(item);
  localSet(list);
}
export function localRemove(index: number) {
  const list = localGet();
  list.splice(index, 1);
  localSet(list);
}
