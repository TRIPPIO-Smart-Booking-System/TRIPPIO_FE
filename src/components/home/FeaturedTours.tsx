'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import Button from '@/components/ui/Button';
import Container from '@/components/layout/Container';
import { apiFeaturedHotels, type ApiHotel } from '@/lib/api-hotels';

export default function FeaturedToursSwiper() {
  const [hotels, setHotels] = useState<ApiHotel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHotels() {
      try {
        const data = await apiFeaturedHotels(6);
        setHotels(data);
      } catch (error) {
        console.error('Failed to load featured hotels:', error);
      } finally {
        setLoading(false);
      }
    }

    loadHotels();
  }, []);

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
          {loading ? (
            <div className="flex h-60 items-center justify-center">
              <p className="text-gray-500">Đang tải khách sạn...</p>
            </div>
          ) : hotels.length === 0 ? (
            <div className="flex h-60 items-center justify-center">
              <p className="text-gray-500">Chưa có khách sạn nào</p>
            </div>
          ) : (
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
              {hotels.map((hotel) => (
                <SwiperSlide key={hotel.id} className="pb-6">
                  <Link href={`/hotel/${hotel.id}`}>
                    <div className="group overflow-hidden rounded-xl border bg-white shadow hover:shadow-lg transition">
                      {/* Image */}
                      <div className="relative h-40 w-full overflow-hidden bg-gray-200">
                        {hotel.id ? (
                          <div className="flex h-full items-center justify-center bg-gradient-to-br from-blue-100 to-cyan-100">
                            <span className="text-4xl">🏨</span>
                          </div>
                        ) : null}
                      </div>
                      {/* Info */}
                      <div className="p-4">
                        <h3 className="font-bold text-lg truncate">{hotel.name}</h3>
                        <p className="text-sm text-gray-600">{hotel.city}</p>
                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <span className="text-yellow-500">⭐</span>
                            <span className="font-semibold">{hotel.stars}/5</span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {hotel.rooms?.length || 0} phòng
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </SwiperSlide>
              ))}
            </Swiper>
          )}
        </div>
      </Container>
    </section>
  );
}
