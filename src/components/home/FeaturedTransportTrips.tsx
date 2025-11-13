'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

import Button from '@/components/ui/Button';
import Container from '@/components/layout/Container';
import { apiFeaturedTransportTrips, type ApiTransportTrip } from '@/lib/api-transports';

export default function FeaturedTransportTrips() {
  const [trips, setTrips] = useState<ApiTransportTrip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTrips() {
      try {
        const data = await apiFeaturedTransportTrips(6);
        setTrips(data);
      } catch (error) {
        console.error('Failed to load featured transport trips:', error);
      } finally {
        setLoading(false);
      }
    }

    loadTrips();
  }, []);

  const formatTime = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  const calculateDuration = (departure: string, arrival: string) => {
    try {
      const start = new Date(departure).getTime();
      const end = new Date(arrival).getTime();
      const minutes = Math.round((end - start) / 60000);
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      if (hours === 0) return `${mins}p`;
      return `${hours}h ${mins}p`;
    } catch {
      return 'N/A';
    }
  };

  return (
    <section className="py-16">
      <Container>
        <div className="rounded-3xl bg-gradient-to-br from-orange-50 to-amber-50 p-6 sm:p-8 lg:p-10">
          {/* Header */}
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold sm:text-4xl">🚌 Chuyến đi nổi bật</h2>
              <p className="mt-2 text-muted-foreground">Nhiều chỗ trống, giá tốt nhất</p>
            </div>
            <Link href="/transport" className="shrink-0">
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
              <p className="text-gray-500">Đang tải chuyến đi...</p>
            </div>
          ) : trips.length === 0 ? (
            <div className="flex h-60 items-center justify-center">
              <p className="text-gray-500">Chưa có chuyến đi nào</p>
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
              {trips.map((trip) => (
                <SwiperSlide key={trip.id} className="pb-6">
                  <Link href={`/transport/${trip.id}`}>
                    <div className="group overflow-hidden rounded-xl border bg-white shadow hover:shadow-lg transition">
                      {/* Header with icon */}
                      <div className="bg-gradient-to-r from-orange-400 to-amber-400 p-4 text-white">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm font-medium opacity-90">
                              {trip.transport?.transportType || 'Transport'} 🚌
                            </p>
                            <h3 className="mt-1 font-bold text-lg">
                              {trip.departure} → {trip.destination}
                            </h3>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold">
                              ₫{(trip.price || 0).toLocaleString('vi-VN')}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="space-y-3 p-4">
                        {/* Time */}
                        <div className="flex items-center gap-3">
                          <div className="text-right min-w-[70px]">
                            <p className="text-xs text-gray-500">Khởi hành</p>
                            <p className="font-semibold">{formatTime(trip.departureTime)}</p>
                          </div>
                          <div className="flex-1 flex items-center gap-2">
                            <div className="h-px flex-1 bg-gray-300" />
                            <span className="text-xs text-gray-500 whitespace-nowrap">
                              {calculateDuration(trip.departureTime, trip.arrivalTime)}
                            </span>
                            <div className="h-px flex-1 bg-gray-300" />
                          </div>
                          <div className="text-left min-w-[70px]">
                            <p className="text-xs text-gray-500">Đến</p>
                            <p className="font-semibold">{formatTime(trip.arrivalTime)}</p>
                          </div>
                        </div>

                        {/* Availability */}
                        <div className="flex items-center justify-between pt-2 border-t">
                          <span className="text-sm text-gray-600">Chỗ còn trống</span>
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              trip.availableSeats > 10
                                ? 'bg-green-100 text-green-700'
                                : trip.availableSeats > 0
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {trip.availableSeats} chỗ
                          </span>
                        </div>
                      </div>

                      {/* CTA */}
                      <div className="border-t px-4 py-3 bg-gray-50">
                        <button className="w-full rounded-lg bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700 transition">
                          Đặt vé ngay
                        </button>
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
