'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { apiListHotels, type ApiHotel } from '@/lib/api-hotels';
import { apiListTransportTrips, type ApiTransportTrip } from '@/lib/api-transports';
import { apiListShows, type ApiShow } from '@/data/show.api';
import { getHotelImageByIndex } from '@/lib/imageLoader';
import Container from '@/components/layout/Container';
import Footer from '@/components/layout/Footer';
import { formatVietnamDate } from '@/lib/timezone';

// Random image utils
function getRandomShowImage(seed: number): string {
  const shows = ['show1', 'show2', 'show3', 'show4', 'show5', 'show6'];
  const ext = ['webp', 'jpg', 'webp', 'webp', 'webp', 'jpg']; // Fixed: show4 is .webp, not .jpg
  const idx = seed % shows.length;
  return `/images/show/${shows[idx]}.${ext[idx]}`;
}

function getTransportImage(transportType?: string): string {
  if (!transportType) return '/images/transport/transport-header.webp';

  const type = transportType.toLowerCase();

  // Map common transport type names to image files
  if (type.includes('bus')) {
    return '/images/transport/bus.webp';
  } else if (type.includes('flight') || type.includes('airline') || type.includes('air')) {
    return '/images/transport/flight.webp';
  } else if (type.includes('train') || type.includes('railway')) {
    return '/images/transport/train.webp';
  }

  // Default fallback
  return '/images/transport/transport-header.webp';
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

function formatDate(dateStr: string): string {
  return formatVietnamDate(dateStr, 'vi-VN') || dateStr;
}

interface HotelCardProps {
  hotel: ApiHotel;
  index: number;
}

function HotelCard({ hotel, index }: HotelCardProps) {
  const minPrice = hotel.rooms?.[0]?.pricePerNight || 0;
  const imageUrl = getHotelImageByIndex(index);

  return (
    <Link href={`/hotel/${hotel.id}`}>
      <div className="group overflow-hidden rounded-2xl bg-white shadow-md hover:shadow-xl transition-shadow duration-300 h-full flex flex-col">
        {/* Image */}
        <div className="relative h-48 w-full overflow-hidden bg-gray-200">
          <Image
            src={imageUrl}
            alt={hotel.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-300"
          />
        </div>

        {/* Content */}
        <div className="flex-1 p-4 flex flex-col">
          <h3 className="font-bold text-lg line-clamp-2 text-slate-900">{hotel.name}</h3>
          <p className="text-sm text-gray-600 mb-2">{hotel.city}</p>

          <p className="text-sm text-gray-700 line-clamp-2 flex-1 mb-3">{hotel.description}</p>

          {/* Rating & Price */}
          <div className="flex items-center justify-between pt-3 border-t">
            <div className="flex items-center gap-1">
              <span className="text-yellow-500">⭐</span>
              <span className="font-semibold text-sm">{hotel.stars}/5</span>
            </div>
            {minPrice > 0 && (
              <span className="text-blue-600 font-bold text-sm">từ {formatPrice(minPrice)}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

interface TripCardProps {
  trip: ApiTransportTrip;
  index: number;
}

function TripCard({ trip, index }: TripCardProps) {
  const imageUrl = getTransportImage(trip.transportType);
  const startDate = formatDate(trip.departureTime);
  const transportName = trip.transportName || 'Chuyến đi';

  return (
    <Link href={`/transport/trip/${trip.id}`}>
      <div className="group overflow-hidden rounded-2xl bg-white shadow-md hover:shadow-xl transition-shadow duration-300 h-full flex flex-col">
        {/* Image */}
        <div className="relative h-48 w-full overflow-hidden bg-gray-200">
          <Image
            src={imageUrl}
            alt={trip.departure}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>

        {/* Content */}
        <div className="flex-1 p-4 flex flex-col">
          <h3 className="font-bold text-lg text-slate-900">
            {trip.departure} → {trip.destination}
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            {transportName} · {startDate}
          </p>

          <p className="text-sm text-gray-700 line-clamp-2 flex-1 mb-3">
            Chuyến đi thú vị từ {trip.departure} đến {trip.destination}
          </p>

          {/* Price & Availability */}
          <div className="flex items-center justify-between pt-3 border-t">
            <div className="text-blue-600 font-bold">{formatPrice(trip.price)}</div>
            <div className="text-sm text-gray-600">
              {trip.availableSeats > 0 ? `${trip.availableSeats} chỗ` : 'Hết chỗ'}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

interface ShowCardProps {
  show: ApiShow;
  index: number;
}

function ShowCard({ show, index }: ShowCardProps) {
  const imageUrl = getRandomShowImage(index);
  const startDate = formatDate(show.startDate);

  return (
    <Link href={`/show/${show.id}`}>
      <div className="group overflow-hidden rounded-2xl bg-white shadow-md hover:shadow-xl transition-shadow duration-300 h-full flex flex-col">
        {/* Image */}
        <div className="relative h-48 w-full overflow-hidden bg-gray-200">
          <Image
            src={imageUrl}
            alt={show.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-300"
          />
        </div>

        {/* Content */}
        <div className="flex-1 p-4 flex flex-col">
          <h3 className="font-bold text-lg line-clamp-2 text-slate-900">{show.name}</h3>
          <p className="text-sm text-gray-600 mb-2">{show.location}</p>

          <p className="text-sm text-gray-700 line-clamp-2 flex-1 mb-3">{show.description}</p>

          {/* Date & Price */}
          <div className="flex items-center justify-between pt-3 border-t">
            <div className="text-sm text-gray-600">{startDate}</div>
            <div className="text-blue-600 font-bold">{formatPrice(show.price)}</div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function HomePage() {
  const [hotels, setHotels] = useState<ApiHotel[]>([]);
  const [trips, setTrips] = useState<ApiTransportTrip[]>([]);
  const [shows, setShows] = useState<ApiShow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        const [hotelsData, tripsData, showsData] = await Promise.all([
          apiListHotels().catch(() => []),
          apiListTransportTrips().catch(() => []),
          apiListShows().catch(() => []),
        ]);

        setHotels(hotelsData.slice(0, 6));
        setTrips(tripsData.slice(0, 6));
        setShows(showsData.slice(0, 6));
      } catch (err) {
        console.error('Failed to load data:', err);
        setError('Không thể tải dữ liệu');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  return (
    <div className="relative min-h-[100dvh] overflow-x-clip">
      <FullBleedBG />

      {/* CONTENT */}
      <main className="relative z-10 flex flex-col">
        {/* Hero Section */}
        <HeroSection />

        {/* Featured Hotels */}
        <section className="py-16 sm:py-24" id="hotels">
          <Container>
            <div className="mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
                🏨 Khách sạn nổi bật
              </h2>
              <p className="text-gray-600 mt-2">Những địa điểm lưu trú tuyệt vời tại Việt Nam</p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-64">
                <p className="text-gray-500">Đang tải...</p>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-64">
                <p className="text-red-500">{error}</p>
              </div>
            ) : hotels.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <p className="text-gray-500">Chưa có khách sạn nào</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {hotels.map((hotel, idx) => (
                  <HotelCard key={hotel.id} hotel={hotel} index={idx} />
                ))}
              </div>
            )}

            <div className="mt-8 text-center">
              <Link href="/hotel">
                <button className="px-6 py-3 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition">
                  Xem tất cả khách sạn →
                </button>
              </Link>
            </div>
          </Container>
        </section>

        {/* Featured Trips */}
        <section className="py-16 sm:py-24 bg-gradient-to-br from-orange-50 to-amber-50">
          <Container>
            <div className="mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">🚌 Chuyến đi thú vị</h2>
              <p className="text-gray-600 mt-2">Những hành trình đáng nhớ khắp Việt Nam</p>
            </div>

            {trips.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <p className="text-gray-500">Chưa có chuyến đi nào</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {trips.map((trip, idx) => (
                  <TripCard key={trip.id} trip={trip} index={idx} />
                ))}
              </div>
            )}

            <div className="mt-8 text-center">
              <Link href="/transport">
                <button className="px-6 py-3 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition">
                  Xem tất cả chuyến đi →
                </button>
              </Link>
            </div>
          </Container>
        </section>

        {/* Featured Shows */}
        <section className="py-16 sm:py-24">
          <Container>
            <div className="mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
                🎭 Show giải trí đặc sắc
              </h2>
              <p className="text-gray-600 mt-2">Những trải nghiệm giải trí không nên bỏ lỡ</p>
            </div>

            {shows.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <p className="text-gray-500">Chưa có show nào</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {shows.map((show, idx) => (
                  <ShowCard key={show.id} show={show} index={idx} />
                ))}
              </div>
            )}

            <div className="mt-8 text-center">
              <Link href="/show">
                <button className="px-6 py-3 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition">
                  Xem tất cả show →
                </button>
              </Link>
            </div>
          </Container>
        </section>

        {/* Footer */}
        <Footer />
      </main>

      {/* Decorative blobs */}
      <Blob className="left-[-6%] top-[18%]" delay="0s" />
      <Blob className="right-[-8%] top-[38%]" delay="1s" />
      <Blob className="left-[50%] top-[78%] -translate-x-1/2" delay="2s" />
    </div>
  );
}

function HeroSection() {
  return (
    <section className="relative w-full min-h-[560px]">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            'url(https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&h=600&fit=crop)',
        }}
      >
        <div className="absolute inset-0 bg-black/50" />
      </div>

      <div className="relative z-10 mx-auto flex h-[560px] max-w-7xl flex-col items-center justify-center px-4 text-white">
        <h1 className="text-center text-4xl sm:text-5xl lg:text-6xl font-bold">
          Khám phá Việt Nam
        </h1>
        <p className="mt-4 text-center text-lg sm:text-xl opacity-90 max-w-2xl">
          Những khách sạn tuyệt vời, chuyến đi thú vị, và show giải trí đặc sắc đang chờ bạn
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <a
            href="#hotels"
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-full font-semibold transition"
          >
            Khám phá ngay
          </a>
          <a
            href="#contact"
            className="px-8 py-3 border-2 border-white hover:bg-white/20 rounded-full font-semibold transition"
          >
            Liên hệ
          </a>
        </div>
      </div>
    </section>
  );
}

function FullBleedBG() {
  return (
    <>
      <div className="fixed inset-0 -z-30 bg-[radial-gradient(1400px_700px_at_70%_-10%,#ffb2c8_0%,transparent_60%),radial-gradient(900px_500px_at_20%_0%,#fde68a_0%,transparent_50%),linear-gradient(180deg,#0ea5e9_0%,#06b6d4_35%,#14b8a6_60%,#0ea5e9_100%)] opacity-90 dark:opacity-80" />
      <div className="fixed inset-0 -z-20 [background:linear-gradient(transparent_23px,rgba(255,255,255,.07)_24px),linear-gradient(90deg,transparent_23px,rgba(255,255,255,.07)_24px)] [background-size:24px_24px] mix-blend-overlay" />
      <div className="fixed inset-0 -z-20 opacity-40 mix-blend-overlay [background-image:url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 opacity=%220.03%22><filter id=%22n%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%222%22/></filter><rect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/></svg>')]" />

      <svg
        className="fixed inset-x-0 bottom-0 -z-20 h-36 w-full"
        viewBox="0 0 1440 200"
        preserveAspectRatio="none"
      >
        <path
          d="M0,160 C240,140 320,200 480,180 C640,160 720,120 900,150 C1080,180 1200,120 1440,150 L1440,220 L0,220 Z"
          fill="url(#ocean)"
          opacity="0.9"
        />
        <defs>
          <linearGradient id="ocean" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#0891b2" />
            <stop offset="100%" stopColor="#0ea5e9" />
          </linearGradient>
        </defs>
      </svg>
    </>
  );
}

function Blob({ className = '', delay = '0s' }: { className?: string; delay?: string }) {
  return (
    <div
      className={`pointer-events-none absolute -z-10 h-64 w-64 rounded-full opacity-30 blur-3xl ${className}`}
      style={{
        background:
          'radial-gradient(circle at 30% 30%, rgba(244,114,182,.8), transparent 60%), radial-gradient(circle at 70% 70%, rgba(34,211,238,.7), transparent 55%)',
        animation: `float 12s ease-in-out infinite`,
        animationDelay: delay,
      }}
    />
  );
}
