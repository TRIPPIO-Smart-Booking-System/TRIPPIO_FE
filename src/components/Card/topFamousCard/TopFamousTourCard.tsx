'use client';

import Image from 'next/image';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { Tour } from '@/data/tours';

type Status =
  | { type: 'top-rated'; label?: string }
  | { type: 'best-sale'; label?: string }
  | { type: 'discount'; percent: number; label?: string };

type Props = {
  tour: Tour & { groupSize?: string };
  href?: string;
  status?: Status; // ⬅️ thêm prop trạng thái
};

const statusStyle = (s?: Status) => {
  if (!s) return null;
  switch (s.type) {
    case 'top-rated':
      return { text: s.label ?? 'Top Rated', classes: 'bg-amber-100 text-amber-700' };
    case 'best-sale':
      return { text: s.label ?? 'Best Sale', classes: 'bg-emerald-100 text-emerald-700' };
    case 'discount':
      return {
        text: s.label ?? `${s.percent}% Off`,
        classes: 'bg-orange-100 text-orange-700',
      };
  }
};

export default function TopFamousTourCard({ tour, href = `/tours/${tour.id}`, status }: Props) {
  const groupSize = tour.groupSize ?? '4-6 người';
  const price = `VND ${tour.price.toLocaleString('vi-VN')}`;
  const chip = statusStyle(status);

  return (
    <article className="group w-full rounded-2xl bg-white">
      {/* IMAGE */}
      <div className="relative overflow-hidden rounded-2xl">
        <div className="aspect-[4/3]">
          <Image
            src={tour.imageUrl}
            alt={tour.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            sizes="(max-width:768px)100vw,(max-width:1200px)50vw,33vw"
          />
        </div>

        {/* Status badge */}
        {chip && (
          <span
            className={`absolute left-3 top-3 z-20 rounded-full px-3 py-1 text-xs font-semibold shadow-sm backdrop-blur ${chip.classes}`}
          >
            {chip.text}
          </span>
        )}

        {/* Heart */}
        <button
          aria-label="Yêu thích"
          className="absolute right-3 top-3 z-20 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-foreground shadow-sm transition hover:bg-white"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          </svg>
        </button>
      </div>

      {/* CONTENT */}
      <div className="px-2 pt-4 sm:px-0 sm:pt-4">
        <Link href={href} className="block px-2 sm:px-1">
          <h3 className="text-lg font-semibold leading-6 hover:underline">{tour.title}</h3>
        </Link>

        {/* meta */}
        <div className="mt-2 flex items-center gap-6 px-2 text-sm text-muted-foreground sm:px-1">
          <span className="inline-flex items-center gap-2">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M8 2v4" />
              <path d="M16 2v4" />
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M3 10h18" />
            </svg>
            {tour.duration}
          </span>
          <span className="inline-flex items-center gap-2">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            {groupSize}
          </span>
        </div>

        {/* price + CTA */}
        <div className="mt-4 flex items-center justify-between px-2 pb-4 sm:px-1">
          <div className="text-sm">
            <span className="font-semibold">{price}</span>
            <span className="text-muted-foreground"> / người</span>
          </div>
          <Link href={href}>
            <Button className="h-9 rounded-full px-5 text-sm">Đặt Ngay</Button>
          </Link>
        </div>
      </div>
    </article>
  );
}
