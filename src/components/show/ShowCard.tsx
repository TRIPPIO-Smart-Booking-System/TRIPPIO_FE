// src/components/show/ShowCard.tsx
'use client';

import Link from 'next/link';
import { ApiShow, formatDateTime, formatMoney } from '@/data/show.api';

export default function ShowCard({
  show,
  currency = 'VND',
}: {
  show: ApiShow;
  currency?: 'VND' | 'USD';
}) {
  const soldOut = show.availableTickets <= 0;

  return (
    <article className="group overflow-hidden rounded-2xl border bg-white shadow hover:shadow-lg transition">
      <div className="relative h-28 w-full bg-gradient-to-r from-sky-400 via-cyan-400 to-teal-400">
        <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-sky-700 shadow">
          {formatMoney(show.price, currency)}/vé
        </div>
        <div className="absolute -bottom-6 right-4 rotate-2 rounded-xl bg-white/90 px-3 py-1 text-xs font-semibold text-cyan-700 shadow">
          🎟️ {soldOut ? 'Hết vé' : `${show.availableTickets} vé còn`}
        </div>
      </div>

      <div className="space-y-2 p-4">
        <h3 className="line-clamp-2 text-lg font-semibold">{show.name}</h3>

        <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-700">
          <span className="inline-flex items-center gap-2">
            🕒 {formatDateTime(show.startDate)} — {formatDateTime(show.endDate)}
          </span>
          <span className="inline-flex items-center gap-2">
            📍 {show.location}, {show.city}
          </span>
        </div>

        <div className="pt-2">
          <Link
            href={`/show/${show.id}`}
            className={`inline-flex h-10 items-center rounded-xl px-4 font-semibold ${
              soldOut
                ? 'cursor-not-allowed bg-zinc-200 text-zinc-500'
                : 'bg-orange-500 text-white hover:bg-orange-600'
            }`}
            onClick={(e) => {
              if (soldOut) e.preventDefault();
            }}
          >
            {soldOut ? 'Hết vé' : 'Xem chi tiết'}
          </Link>
        </div>
      </div>
    </article>
  );
}
