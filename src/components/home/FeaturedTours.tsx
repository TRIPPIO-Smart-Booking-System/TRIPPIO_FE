'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

import Link from 'next/link';
import Button from '@/components/ui/Button';
import Container from '@/components/layout/Container';
import TourCard from '@/components/Card/tours/TourCard';
import { tours } from '@/data/tours';
import { getTopToursByRating } from '@/utils/getTopTours';

export default function FeaturedToursSwiper() {
  const topTours = getTopToursByRating(tours, 10);

  return (
    <section className="py-16">
      <Container>
        <div className="rounded-3xl bg-[#DFF1EE] p-6 sm:p-8 lg:p-10">
          {/* Header */}
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold sm:text-4xl">Khách sạn hàng đầu</h2>
              <p className="mt-2 text-muted-foreground">Chất lượng đánh giá của khách hàng!</p>
            </div>
            <Link href="/tours" className="shrink-0">
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
            {topTours.map((tour) => (
              <SwiperSlide key={tour.id} className="pb-6">
                <TourCard tour={tour} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </Container>
    </section>
  );
}
