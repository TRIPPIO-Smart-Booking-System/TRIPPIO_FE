/* eslint react/prop-types: 0 */
export type PaymentStatus = 'Pending' | 'Paid' | 'Failed' | 'Refunded' | 'Expired';

export type PaymentRecord = {
  id: string; // paymentId
  orderId: string;
  amountVND: number;
  method?: 'VNPAY' | 'MOMO' | 'CARD' | 'CASH' | string;
  status: PaymentStatus;
  createdAt: string; // ISO
  updatedAt?: string; // ISO
  note?: string;
};

const KEY = 'payment_history_v1';

export function loadLocalHistory(): PaymentRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as PaymentRecord[]) : [];
  } catch {
    return [];
  }
}

export function saveLocalHistory(list: PaymentRecord[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
    window.dispatchEvent(new Event('payments:changed'));
  } catch {}
}

export function addLocalPayment(rec: PaymentRecord) {
  const list = loadLocalHistory();
  list.unshift(rec);
  saveLocalHistory(list);
}

export function fmtVND(n: number) {
  return n.toLocaleString('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  });
}
