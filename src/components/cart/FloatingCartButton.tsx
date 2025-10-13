// src/components/cart/FloatingCartButton.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ShoppingCart } from 'lucide-react';
import { getBasket } from '@/lib/cart';

export default function FloatingCartButton() {
  const [count, setCount] = useState<number>(0);
  const router = useRouter();
  const pathname = usePathname();

  async function refresh() {
    try {
      const b = await getBasket();
      const c = b?.items?.reduce((s, it) => s + (it.quantity ?? 0), 0) ?? 0;
      setCount(c);
    } catch {
      setCount(0);
    }
  }

  useEffect(() => {
    refresh();
    const h = () => refresh();
    window.addEventListener('basket:changed', h);
    return () => window.removeEventListener('basket:changed', h);
  }, [pathname]);

  return (
    <button
      aria-label="Mở giỏ hàng"
      onClick={() => router.push('/cart')}
      className="fixed bottom-6 right-6 z-[60] inline-flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-xl transition hover:bg-blue-700"
    >
      <ShoppingCart className="h-6 w-6" />
      {count > 0 && (
        <span className="absolute -right-1 -top-1 min-w-[22px] rounded-full bg-amber-400 px-1.5 text-center text-[11px] font-bold leading-5 text-zinc-900 shadow">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </button>
  );
}
