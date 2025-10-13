'use client';

import Image from 'next/image';
import Link from 'next/link';

type Destination = {
  name: string;
  slug: string;
  image: string; // path trong /public
};

const DESTINATIONS: Destination[] = [
  { name: 'Đà Nẵng', slug: 'da-nang', image: '/images/dalat.jpg' },
  { name: 'Phú Quốc', slug: 'phu-quoc', image: '/images/halong.jpg' },
  { name: 'Hà Nội', slug: 'ha-noi', image: '/images/halong.jpg' },
  { name: 'Đà Lạt', slug: 'da-lat', image: '/images/dalat.jpg' },
  { name: 'Phú Quý', slug: 'phu-quy', image: '/images/halong.jpg' },
  { name: 'Nha Trang', slug: 'nha-trang', image: '/images/halong.jpg' },
  { name: 'Nghệ An', slug: 'nghe-an', image: '/images/dalat.jpg' },
];

export default function PopularDestinations() {
  return (
    <section className="py-12 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Điểm đến phổ biến nhất Việt Nam
        </h2>

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {DESTINATIONS.map((d) => (
            <Link
              key={d.slug}
              href={`/tours?destination=${d.slug}`}
              className="group rounded-[18px] border border-zinc-200 bg-white p-3 shadow-sm transition hover:shadow-md"
            >
              <div className="relative overflow-hidden rounded-[18px]">
                <div className="aspect-[16/9] w-full">
                  <Image
                    src={d.image}
                    alt={d.name}
                    fill
                    className="rounded-[18px] object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 25vw"
                  />
                </div>
              </div>

              {/* caption */}
              <div className="mt-3 flex items-center justify-between">
                <span className="text-[15px] font-semibold text-zinc-900">{d.name}</span>
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-zinc-300 bg-white text-zinc-700 transition group-hover:translate-x-0.5">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </span>
              </div>
            </Link>
          ))}

          {/* CTA card */}
          <div className="rounded-[18px] border border-zinc-200 bg-zinc-100 p-3">
            <div className="flex h-full items-end justify-start rounded-[14px] bg-zinc-100 p-4">
              <Link
                href="/tours"
                className="inline-flex items-center gap-2 rounded-xl bg-black px-4 py-3 text-white shadow-sm hover:bg-black/90"
              >
                <span className="text-sm font-semibold leading-none">Tất cả các điểm đến</span>
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/15">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
