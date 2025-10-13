// src/lib/cartApi.ts
export type BasketItem = {
  productId: string;
  quantity: number;
  price: number; // đơn giá (USD gốc). Backend của bạn nhận { productId, quantity, price }
  name?: string;
  kind?: 'hotel' | 'transport';
  meta?: Record<string, unknown>;
};

export type Basket = {
  userId: string;
  items: BasketItem[];
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:7142';

// -> Bạn để sẵn 2 key này trong localStorage sau khi login + bootstrap (hoặc từ Redis bạn đẩy ra FE)
const USER_ID_KEY = 'userId';
const TOKEN_KEY = 'authToken';

function getUserId(): string {
  const id = typeof window !== 'undefined' ? localStorage.getItem(USER_ID_KEY) : null;
  if (!id) throw new Error('Missing userId in localStorage');
  return id;
}

function authHeaders() {
  const t = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
  return t ? { Authorization: `Bearer ${t}` } : {};
}

export async function getBasket(): Promise<Basket> {
  const userId = getUserId();
  const res = await fetch(`${API_BASE}/api/Basket/${userId}`, {
    headers: { Accept: 'application/json', ...authHeaders() },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Basket GET ${res.status}`);
  return (await res.json()) as Basket;
}

export async function addItem(item: BasketItem) {
  const userId = getUserId();
  const res = await fetch(`${API_BASE}/api/Basket/${userId}/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: '*/*', ...authHeaders() },
    body: JSON.stringify({
      productId: item.productId,
      quantity: item.quantity,
      price: item.price,
    }),
  });
  if (!res.ok) throw new Error(`Basket ADD ${res.status}`);
  window.dispatchEvent(new CustomEvent('basket:changed'));
}

export async function updateQuantity(productId: string, quantity: number) {
  const userId = getUserId();
  const res = await fetch(`${API_BASE}/api/Basket/${userId}/items/quantity`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Accept: '*/*', ...authHeaders() },
    body: JSON.stringify({ productId, quantity }),
  });
  if (!res.ok) throw new Error(`Basket UPDATE ${res.status}`);
  window.dispatchEvent(new CustomEvent('basket:changed'));
}

export async function removeItem(productId: string) {
  const userId = getUserId();
  const res = await fetch(`${API_BASE}/api/Basket/${userId}/items/${productId}`, {
    method: 'DELETE',
    headers: { Accept: '*/*', ...authHeaders() },
  });
  if (!res.ok) throw new Error(`Basket REMOVE ${res.status}`);
  window.dispatchEvent(new CustomEvent('basket:changed'));
}

export async function clearBasket() {
  const userId = getUserId();
  const res = await fetch(`${API_BASE}/api/Basket/${userId}`, {
    method: 'DELETE',
    headers: { Accept: '*/*', ...authHeaders() },
  });
  if (!res.ok) throw new Error(`Basket CLEAR ${res.status}`);
  window.dispatchEvent(new CustomEvent('basket:changed'));
}
