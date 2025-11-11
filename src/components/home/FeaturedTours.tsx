'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

import Link from 'next/link';
import Image from 'next/image';
import Button from '@/components/ui/Button';
import Container from '@/components/layout/Container';
import { mockHotels } from '@/data/mockData';

export default function FeaturedToursSwiper() {
  const topHotels = mockHotels.slice(0, 6);

  return (
    <section className="py-16">
      <Container>
        <div className="rounded-3xl bg-[#DFF1EE] p-6 sm:p-8 lg:p-10">
          {/* Header */}
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold sm:text-4xl">🏨 Khách sạn hàng đầu</h2>
              <p className="mt-2 text-muted-foreground">
                Được yêu thích nhất theo đánh giá của khách
              </p>
            </div>
            <Link href="/hotel" className="shrink-0">
              <Button className="rounded-full px-5 sm:px-6">
                Xem thêm
                <svg
                  className="ml-2 h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </Button>
            </Link>
          </div>

          {/* Swiper */}
          <Swiper
            modules={[Navigation]}
            navigation
            spaceBetween={20}
            slidesPerView={1.2}
            className="relative"
            breakpoints={{
              640: { slidesPerView: 2.2 },
              1024: { slidesPerView: 3.2 },
            }}
          >
            {topHotels.map((hotel) => (
              <SwiperSlide key={hotel.id} className="pb-6">
                <div className="group overflow-hidden rounded-xl border bg-white shadow hover:shadow-lg transition">
                  {/* Image */}
                  <div className="relative h-40 w-full overflow-hidden">
                    <Image
                      src={hotel.image}
                      alt={hotel.name}
                      fill
                      className="object-cover group-hover:scale-110 transition"
                      unoptimized
                    />
                  </div>
                  {/* Info */}
                  <div className="p-4">
                    <h3 className="font-bold text-lg truncate">{hotel.name}</h3>
                    <p className="text-sm text-gray-600">{hotel.city}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-500">⭐</span>
                        <span className="font-semibold">{hotel.rating}</span>
                        <span className="text-xs text-gray-500">({hotel.reviews})</span>
                      </div>
                      <span className="font-bold text-sky-600">
                        ₫{hotel.price.toLocaleString('vi-VN')}
                      </span>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </Container>
    </section>
  );
}
