// src/app/(site)/cart/page.tsx
'use client';

import { useEffect, useState } from 'react';

import { Trash2, Plus, Minus, Loader2 } from 'lucide-react';
import { Basket, clearBasket, getBasket, removeItem, updateQuantity } from '@/lib/cartapi';

const USD = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });
const VND = (n: number) =>
  n.toLocaleString('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 });

// Quy đổi hiển thị: VND = USD * 25 (theo yêu cầu)
const toVND = (usd: number) => usd * 25;

export default function CartPage() {
  const [basket, setBasket] = useState<Basket | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      setErr(null);
      const data = await getBasket();
      setBasket(data);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Load cart failed');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const h = () => load();
    window.addEventListener('basket:changed', h);
    return () => window.removeEventListener('basket:changed', h);
  }, []);

  const items = basket?.items ?? [];
  const subtotalUSD = items.reduce((s, it) => s + it.price * it.quantity, 0);
  const subtotalVND = toVND(subtotalUSD);

  return (
    <div className="mx-auto max-w-4xl px-4 pb-16 pt-8">
      <h1 className="text-2xl font-bold">Giỏ hàng</h1>

      {loading && (
        <div className="mt-6 inline-flex items-center gap-2 text-zinc-600">
          <Loader2 className="h-4 w-4 animate-spin" /> Đang tải…
        </div>
      )}
      {err && (
        <div className="mt-4 rounded border border-red-200 bg-red-50 p-3 text-red-700">{err}</div>
      )}

      {!loading && !items.length && !err && (
        <div className="mt-6 rounded-2xl border bg-white p-6 text-zinc-700">
          Giỏ hàng đang trống.
        </div>
      )}

      {!!items.length && (
        <div className="mt-6 grid gap-6 md:grid-cols-[1fr_320px]">
          {/* List dọc */}
          <div className="space-y-4">
            {items.map((it) => (
              <div key={it.productId} className="rounded-xl border bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm text-zinc-500">{it.kind?.toUpperCase()}</div>
                    <div className="text-base font-semibold">{it.name ?? it.productId}</div>
                    <div className="mt-1 text-sm text-zinc-600">
                      Đơn giá: <span className="font-medium">{USD(it.price)}</span> (~{' '}
                      {VND(toVND(it.price))} )
                    </div>
                  </div>

                  <button
                    className="rounded-lg border px-2 py-1 text-red-600 hover:bg-red-50"
                    onClick={async () => {
                      await removeItem(it.productId);
                      await load();
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <div className="inline-flex items-center rounded-lg border">
                    <button
                      className="h-9 w-9 hover:bg-zinc-50"
                      onClick={async () => {
                        const q = Math.max(1, it.quantity - 1);
                        await updateQuantity(it.productId, q);
                        await load();
                      }}
                    >
                      <Minus className="mx-auto h-4 w-4" />
                    </button>
                    <div className="h-9 min-w-[46px] border-x text-center leading-9">
                      {it.quantity}
                    </div>
                    <button
                      className="h-9 w-9 hover:bg-zinc-50"
                      onClick={async () => {
                        await updateQuantity(it.productId, it.quantity + 1);
                        await load();
                      }}
                    >
                      <Plus className="mx-auto h-4 w-4" />
                    </button>
                  </div>

                  <div className="text-right">
                    <div className="text-sm text-zinc-500">Tạm tính</div>
                    <div className="font-semibold">
                      {USD(it.price * it.quantity)} ({VND(toVND(it.price * it.quantity))})
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Tổng kết */}
          <div className="rounded-2xl border bg-white p-4 shadow-sm">
            <h2 className="text-lg font-semibold">Tổng cộng</h2>
            <div className="mt-2 space-y-1 text-sm">
              <div className="flex items-center justify-between">
                <span>Tạm tính</span>
                <span className="font-medium">
                  {USD(subtotalUSD)} ({VND(subtotalVND)})
                </span>
              </div>
              <div className="flex items-center justify-between text-zinc-600">
                <span>Thuế & phí (ước tính)</span>
                <span>{USD(subtotalUSD * 0.1)}</span>
              </div>
              <div className="mt-2 border-t pt-2 flex items-center justify-between text-base font-semibold">
                <span>Thành tiền</span>
                <span>
                  {USD(subtotalUSD * 1.1)} ({VND(toVND(subtotalUSD * 1.1))})
                </span>
              </div>
            </div>

            <button className="mt-4 w-full rounded-xl bg-blue-600 py-3 text-white hover:bg-blue-700">
              Tiến hành thanh toán
            </button>

            <button
              onClick={async () => {
                await clearBasket();
                await load();
              }}
              className="mt-2 w-full rounded-xl border py-2 text-sm text-zinc-700 hover:bg-zinc-50"
            >
              Xoá sạch giỏ hàng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
