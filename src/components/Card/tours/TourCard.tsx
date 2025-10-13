'use client';

import Image from 'next/image';
import Link from 'next/link';
import Button from '../../ui/Button';
import { Tour } from '@/data/tours';

type Props = { tour: Tour & { groupSize?: string } };

export default function TourCard({ tour }: Props) {
  const price = `VND ${tour.price.toLocaleString('vi-VN')}`;
  const groupSize = tour.groupSize ?? '4-6 người';

  return (
    // z-0 để card không nổi lên trên filter dropdown
    <article className="group relative z-0">
      {/* 1) Ảnh */}
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-3xl">
        <Image
          src={tour.imageUrl}
          alt={tour.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          sizes="(max-width:768px)100vw,(max-width:1200px)50vw,33vw"
        />

        {/* Tim — hạ z-index xuống 10 */}
        <button
          aria-label="Yêu thích"
          className="absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-foreground shadow-md transition hover:bg-white"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          </svg>
        </button>
      </div>

      {/* 2) Rating — hạ z-index xuống 20 (dropdown bạn đang dùng z-[90]) */}
      <div className="relative">
        <div className="absolute left-6 -top-5 z-20 rounded-full bg-white px-3.5 py-2 text-sm shadow-lg md:left-8">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-yellow-400">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.77 5.82 22 7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </span>
            <span className="font-medium">{tour.rating}</span>
            <span className="text-muted-foreground">({tour.reviews} reviews)</span>
          </div>
        </div>

        {/* 3) Detail */}
        <div className="-mt-4 rounded-3xl bg-white p-5 pt-7 ring-1 ring-black/5 shadow-sm md:-mt-5 md:p-6 md:pt-8">
          <h3 className="text-xl font-semibold leading-7 md:text-[22px] line-clamp-2">
            {tour.title}
          </h3>

          <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-2 text-[15px] text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <svg
                width="18"
                height="18"
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
                width="18"
                height="18"
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

          <div className="mt-4 flex items-center justify-between gap-4">
            <div>
              <div className="text-[15px] font-semibold">
                {price} <span className="font-normal text-muted-foreground">/ person</span>
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                Taxes and fees are not included
              </div>
            </div>
            <Link href={`/tours/${tour.id}`}>
              <Button className="h-10 rounded-full px-5 md:h-11 md:px-6">Book now</Button>
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
