'use client';

import Link from 'next/link';
import type { Hotel } from '@/data/hotel.types';
import Gallery from '../tour/Gallery';

type Props = {
  hotel: Hotel;
  price?: number;
  oldPrice?: number;
  rating?: number;
  reviews?: number;
  rankNote?: string;
  promoBadge?: string;
  taxNote?: string;
  points?: number;
};

const VND = (n: number) =>
  n.toLocaleString('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  });

export default function HotelCard({
  hotel,
  price = 17_876_147,
  oldPrice = 23_834_863,
  rating = hotel.rating ?? 9.4,
  reviews = 681,
  rankNote = 'Hạng 7 trong số Khách sạn 5 sao',
  promoBadge = 'Gần biển',
  taxNote = 'Bao gồm thuế và phí',
  points = 62567,
}: Props) {
  const main = hotel.images?.[0] ?? '/img/placeholder.jpg';
  const thumbs = (hotel.images ?? []).slice(1, 4);

  return (
    <article className="flex w-full overflow-hidden rounded-xl border bg-white shadow hover:shadow-lg transition">
      {/* LEFT: Gallery */}
      <div className="w-[30%] border-r">
        <Gallery main={main} thumbs={thumbs} />
      </div>

      {/* MIDDLE: Info */}
      <div className="flex flex-col flex-1 p-4">
        {/* Title + rating */}
        <div className="flex justify-between items-start">
          <Link href={`/hotel/${hotel.id}`} className="block max-w-[70%]">
            <h2 className="text-lg font-semibold leading-snug hover:underline line-clamp-2">
              {hotel.name}
            </h2>
          </Link>

          <div className="text-right">
            <div className="text-blue-600 font-bold text-lg">{rating.toFixed(1)}</div>
            <div className="text-xs text-zinc-500">
              ({reviews} đánh giá)
              <div className="mt-0.5 text-[11px] text-zinc-500">Xuất sắc</div>
            </div>
          </div>
        </div>

        {/* Type + stars + rank note */}
        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
          <span className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5">
            🏨 Khách sạn
          </span>
          <span className="text-amber-500">{'★'.repeat(hotel.stars)}</span>
          {rankNote && (
            <span className="rounded bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700">
              {rankNote}
            </span>
          )}
        </div>

        {/* Location */}
        <div className="mt-2 flex items-center gap-2 text-sm text-zinc-700">
          📍 <span className="line-clamp-1">{hotel.address || hotel.city}</span>
        </div>

        {/* Amenities */}
        <div className="mt-2 flex flex-wrap gap-2 text-xs">
          {hotel.amenity_groups?.[0]?.items.slice(0, 3).map((a, i) => (
            <span key={i} className="rounded bg-zinc-100 px-2 py-1">
              {a}
            </span>
          ))}
          {hotel.amenity_groups?.[0]?.items.length > 3 && (
            <span className="rounded bg-zinc-100 px-2 py-1">
              +{(hotel.amenity_groups?.[0]?.items.length || 0) - 3}
            </span>
          )}
        </div>

        {/* Points + Promo */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-xs text-amber-700">
            🪙 {points.toLocaleString('vi-VN')} Points
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
            % Mã giảm đến 500K có sẵn trong ví của bạn!
          </span>
        </div>
      </div>

      {/* RIGHT: Price & CTA */}
      <div className="w-[220px] border-l p-4 flex flex-col justify-between text-right">
        <div>
          {promoBadge && (
            <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
              {promoBadge}
            </span>
          )}
          {oldPrice && (
            <div className="mt-2 text-sm text-zinc-400 line-through">{VND(oldPrice)}</div>
          )}
          <div className="mt-1 text-xl font-bold text-orange-600">{VND(price)}</div>
          <div className="text-xs text-zinc-500">{taxNote}</div>
        </div>

        <Link
          href={`/hotel/${hotel.id}`}
          className="mt-3 inline-block rounded-lg bg-orange-500 px-4 py-2 text-white font-semibold hover:bg-orange-600"
        >
          Chọn phòng
        </Link>
      </div>
    </article>
  );
}
