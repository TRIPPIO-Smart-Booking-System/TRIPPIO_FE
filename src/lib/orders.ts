// src/lib/orders.ts
export type OrderStatus = 'Pending' | 'Paid' | 'Completed' | 'Refunded' | 'Cancelled';

export type Order = {
  id: string;
  userId?: string | null;
  paymentId?: string | null;
  amountVND: number;
  status: OrderStatus;
  createdAt: string; // ISO
  updatedAt?: string; // ISO
  items?: Array<{
    productId: string;
    kind?: 'hotel' | 'show' | 'flight';
    name?: string;
    quantity: number;
    unitPriceVND: number;
  }>;
  note?: string;
};

const KEY = 'orders_local_history';

export function loadLocalOrders(): Order[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as Order[];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function saveLocalOrders(list: Order[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
    window.dispatchEvent(new Event('orders:changed'));
  } catch {}
}

export function addLocalOrder(o: Order) {
  const cur = loadLocalOrders();
  cur.unshift(o);
  saveLocalOrders(cur);
}
