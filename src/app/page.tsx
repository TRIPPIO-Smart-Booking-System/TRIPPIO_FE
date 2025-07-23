import { tours } from '@/data/tours';
import TourCard from '@/components/tours/TourCard';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  const featuredTours = tours.slice(0, 3);
  const popularDestinations = tours.slice(0, 8);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[500px] w-full">
        <div className="absolute inset-0 bg-black/40 z-10" />
        <Image src="/images/halong.jpg" alt="Hero Image" fill className="object-cover" priority />
        <div className="container relative z-20 flex h-full max-w-screen-2xl flex-col items-center justify-center text-center text-white px-4">
          <h1 className="text-4xl font-bold sm:text-5xl md:text-6xl">
            Khám phá những điểm đến tuyệt đẹp tại Việt Nam
          </h1>
          <p className="mt-4 max-w-2xl text-lg sm:text-xl">
            Trải nghiệm những chuyến du lịch tuyệt vời với Trippio - Nền tảng đặt tour du lịch trực
            tuyến hàng đầu
          </p>
        </div>
      </section>

      {/* Search Box */}
      <section className="relative z-20 mx-auto -mt-10 w-full max-w-4xl px-4">
        <div className="rounded-xl bg-white p-6 shadow-lg">
          <h2 className="mb-4 text-center text-xl font-semibold text-gray-800">
            Tìm phòng/chuyến đi lý tưởng đến điểm đến của bạn
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Điểm đến</label>
              <input
                type="text"
                placeholder="Nhập điểm đến"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ngày đi</label>
              <input
                type="date"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ngày về</label>
              <input
                type="date"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tìm kiếm</label>
              <button className="w-full rounded-lg bg-teal-500 py-2 text-white transition-colors hover:bg-teal-600">
                Tìm kiếm
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Tours */}
      <section className="container max-w-screen-2xl py-16 px-4">
        <div className="flex flex-col items-start">
          <h2 className="text-2xl font-bold sm:text-3xl text-gray-800">Khách sạn hàng đầu</h2>
          <p className="mt-2 text-gray-600">Khám phá những khách sạn được đánh giá cao nhất</p>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {featuredTours.map((tour) => (
            <TourCard key={tour.id} tour={tour} />
          ))}
        </div>
        <div className="mt-8 flex justify-end">
          <Link href="/tours">
            <Button
              variant="outline"
              size="sm"
              className="border-teal-500 text-teal-500 hover:bg-teal-50"
            >
              Xem tất cả
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="ml-1"
              >
                <path d="M5 12h14"></path>
                <path d="m12 5 7 7-7 7"></path>
              </svg>
            </Button>
          </Link>
        </div>
      </section>

      {/* Promotion Section */}
      <section className="py-16 bg-gray-50">
        <div className="container max-w-screen-2xl px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="order-2 md:order-1">
              <h2 className="text-2xl font-bold sm:text-3xl text-gray-800 mb-4">
                Nhận giá phòng tốt nhất trong mọi đặt chỗ của bạn
              </h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 text-teal-500 mr-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Đảm bảo giá tốt nhất</h3>
                    <p className="text-gray-600">
                      Chúng tôi cam kết mang đến mức giá tốt nhất cho bạn
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 text-teal-500 mr-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Thanh toán an toàn</h3>
                    <p className="text-gray-600">Hệ thống thanh toán bảo mật và đáng tin cậy</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 text-teal-500 mr-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <path d="M12 6v6l4 2"></path>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Đặt phòng nhanh chóng</h3>
                    <p className="text-gray-600">
                      Quy trình đặt phòng đơn giản, nhanh chóng và tiện lợi
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2 relative h-[300px] md:h-[400px] rounded-xl overflow-hidden">
              <Image src="/images/dalat.jpg" alt="Promotion" fill className="object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="container max-w-screen-2xl py-16 px-4">
        <div className="flex flex-col items-start">
          <h2 className="text-2xl font-bold sm:text-3xl text-gray-800">
            Điểm đến phổ biến nhất Việt Nam
          </h2>
          <p className="mt-2 text-gray-600">Khám phá những điểm đến được yêu thích nhất</p>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {popularDestinations.map((destination, index) => (
            <Link href={`/tours/${destination.id}`} key={destination.id} className="group">
              <div className="relative h-[200px] w-full overflow-hidden rounded-lg">
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10" />
                <Image
                  src={destination.imageUrl}
                  alt={destination.destination}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute bottom-0 left-0 z-20 p-4 text-white">
                  <h3 className="text-lg font-semibold">{destination.destination}</h3>
                  <p className="text-sm">{destination.duration}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-8 flex justify-center">
          <Link href="/destinations">
            <Button className="bg-teal-500 text-white hover:bg-teal-600">
              Xem tất cả điểm đến
            </Button>
          </Link>
        </div>
      </section>

      {/* Chương trình khuyến mãi */}
      <section className="py-16 bg-gray-50">
        <div className="container max-w-screen-2xl px-4">
          <div className="flex flex-col items-center text-center mb-12">
            <h2 className="text-2xl font-bold sm:text-3xl text-gray-800">
              Chương trình khuyến mãi
            </h2>
            <p className="mt-2 text-gray-600 max-w-2xl">
              Đừng bỏ lỡ những ưu đãi đặc biệt từ Trippio
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="text-teal-500 font-semibold mb-2">Khuyến mãi đặc biệt</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Giảm 30% cho Tour Hạ Long</h3>
                <p className="text-gray-600 mb-4">Áp dụng cho đặt tour từ 15/7 đến 30/7</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-teal-500 text-teal-500 hover:bg-teal-50"
                >
                  Xem chi tiết
                </Button>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="text-teal-500 font-semibold mb-2">Ưu đãi tháng 7</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Tour Đà Nẵng - Hội An 4N3Đ</h3>
                <p className="text-gray-600 mb-4">Giảm 500.000đ khi đặt tour trước 20/7</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-teal-500 text-teal-500 hover:bg-teal-50"
                >
                  Xem chi tiết
                </Button>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="text-teal-500 font-semibold mb-2">Flash Sale</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Tour Phú Quốc 3N2Đ</h3>
                <p className="text-gray-600 mb-4">Chỉ 2.990.000đ - Số lượng có hạn</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-teal-500 text-teal-500 hover:bg-teal-50"
                >
                  Xem chi tiết
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Các tour du lịch nổi bật của chúng tôi */}
      <section className="container max-w-screen-2xl py-16 px-4">
        <div className="flex flex-col items-start">
          <h2 className="text-2xl font-bold sm:text-3xl text-gray-800">
            Các tour du lịch nổi bật của chúng tôi
          </h2>
          <p className="mt-2 text-gray-600">Khám phá những tour du lịch được yêu thích nhất</p>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tours.map((tour) => (
            <TourCard key={tour.id} tour={tour} />
          ))}
        </div>
      </section>

      {/* Tại sao nên đi du lịch cùng chúng tôi */}
      <section className="py-16 bg-gray-50">
        <div className="container max-w-screen-2xl px-4">
          <div className="flex flex-col items-center text-center mb-12">
            <h2 className="text-2xl font-bold sm:text-3xl text-gray-800">
              Tại sao nên đi du lịch cùng chúng tôi?
            </h2>
            <p className="mt-2 text-gray-600 max-w-2xl">
              Chúng tôi cam kết mang đến cho bạn những trải nghiệm du lịch tuyệt vời nhất
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-100 text-teal-500 mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m7 11 2-2-2-2" />
                  <path d="M11 13h4" />
                  <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Đặt vé dễ dàng</h3>
              <p className="text-gray-600">Quy trình đặt vé đơn giản, nhanh chóng và an toàn</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-100 text-teal-500 mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2v20" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Giá cả hợp lý</h3>
              <p className="text-gray-600">Chúng tôi cam kết mang đến mức giá tốt nhất cho bạn</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-100 text-teal-500 mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Dịch vụ chất lượng</h3>
              <p className="text-gray-600">Đội ngũ nhân viên chuyên nghiệp, tận tâm phục vụ</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-100 text-teal-500 mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M2 12h10" />
                  <path d="M9 4v16" />
                  <path d="M14 9h8" />
                  <path d="M18 5v8" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Hỗ trợ 24/7</h3>
              <p className="text-gray-600">Luôn sẵn sàng hỗ trợ bạn mọi lúc, mọi nơi</p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="container max-w-screen-2xl py-16 px-4">
        <div className="rounded-xl bg-teal-500 p-8 text-white md:p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <h2 className="text-2xl font-bold sm:text-3xl">Đăng ký nhận thông tin</h2>
            <p className="mt-4 max-w-2xl">
              Đăng ký để nhận thông tin về các ưu đãi và tour du lịch mới nhất từ Trippio
            </p>
            <div className="mt-8 flex w-full max-w-md flex-col gap-4 sm:flex-row">
              <input
                type="email"
                placeholder="Email của bạn"
                className="flex h-12 w-full rounded-lg border-0 bg-white/10 px-4 py-2 text-white placeholder:text-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <Button className="h-12 bg-white text-teal-500 hover:bg-white/90">Đăng ký</Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
