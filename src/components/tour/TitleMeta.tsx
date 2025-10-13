'use client';

import { VND } from '@/utils/currency';
import { StarIcon, ClockIcon, MapPinIcon, TagIcon } from './icons';

export default function TitleMeta({
  title,
  rating,
  reviews,
  duration,
  destination,
  price,
}: {
  title: string;
  rating: number;
  reviews: number;
  duration: string;
  destination: string;
  price: number;
}) {
  return (
    <header className="mt-8">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-amber-700">
          <StarIcon /> {rating} ({reviews} đánh giá)
        </span>
        <span className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-3 py-1">
          <ClockIcon /> {duration}
        </span>
        <span className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-3 py-1">
          <MapPinIcon /> {destination}
        </span>
        <span className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-3 py-1">
          <TagIcon /> {VND(price)} / người
        </span>
      </div>
    </header>
  );
}
