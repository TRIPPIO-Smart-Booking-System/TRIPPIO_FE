// src/components/show/ShowCard.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { ApiShow, formatDateTime, formatMoney } from '@/data/show.api';
import { loadShows, getRandomItem, type ShowData } from '@/lib/csvLoader';

type Props = {
  show: ApiShow;
  currency?: 'VND' | 'USD';
  /** Optional controlled expand state (for “chỉ mở 1 card”) */
  isOpen?: boolean;
  /** Optional toggle handler from parent */
  onToggle?: () => void;
};

export default function ShowCard({ show, currency = 'VND', isOpen, onToggle }: Props) {
  const soldOut = show.availableTickets <= 0;
  const [randomShowImage, setRandomShowImage] = useState<ShowData | null>(null);

  useEffect(() => {
    // Load random show image once when component mounts
    (async () => {
      const shows = await loadShows();
      const randomShow = getRandomItem(shows);
      setRandomShowImage(randomShow || null);
    })();
  }, []);

  return (
    <article className="group overflow-hidden rounded-2xl border bg-white shadow transition hover:shadow-lg">
      {/* Image Banner */}
      <div className="relative h-40 w-full bg-gray-200">
        <Image
          src={randomShowImage?.image_url || '/img/placeholder.jpg'}
          alt={show.name}
          fill
          sizes="(max-width: 768px) 100vw, 400px"
          className="object-cover"
          priority={false}
          unoptimized
        />
        <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-sky-700 shadow">
          {formatMoney(show.price, currency)}/vé
        </div>
        <div className="absolute -bottom-6 right-4 rotate-2 rounded-xl bg-white/90 px-3 py-1 text-xs font-semibold text-cyan-700 shadow">
          🎟️ {soldOut ? 'Hết vé' : `${show.availableTickets} vé còn`}
        </div>
      </div>

      {/* Body */}
      <div className="space-y-2 p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="line-clamp-2 text-lg font-semibold">{show.name}</h3>

          {/* Toggle button (optional, only if onToggle provided) */}
          {onToggle && (
            <button
              type="button"
              onClick={onToggle}
              aria-expanded={!!isOpen}
              aria-controls={`show-card-details-${show.id}`}
              className="ml-auto inline-flex h-8 min-w-8 items-center justify-center rounded-lg border px-2 text-sm text-sky-700 hover:bg-sky-50"
              title={isOpen ? 'Thu gọn' : 'Mở chi tiết'}
            >
              <span className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}>⌄</span>
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-700">
          <span className="inline-flex items-center gap-2">
            🕒 {formatDateTime(show.startDate)} — {formatDateTime(show.endDate)}
          </span>
          <span className="inline-flex items-center gap-2">
            📍 {show.location}, {show.city}
          </span>
        </div>

        {/* Collapsible details (rendered only when isOpen is defined -> controlled mode) */}
        {typeof isOpen === 'boolean' && (
          <div
            id={`show-card-details-${show.id}`}
            className={`overflow-hidden transition-[max-height,opacity] duration-300 ${
              isOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="mt-2 rounded-xl border bg-zinc-50/70 p-3 text-sm text-zinc-700">
              <div>
                <span className="font-medium text-sky-800">Mô tả nhanh: </span>
                {show.description || 'Chưa có mô tả.'}
              </div>
              <div className="mt-1">
                <span className="font-medium text-sky-800">Địa điểm chi tiết: </span>
                {show.location}, {show.city}
              </div>
            </div>
          </div>
        )}

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
