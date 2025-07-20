import { tours } from '@/data/tours';
import TourCard from '@/components/tours/TourCard';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  const featuredTours = tours.slice(0, 3);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[600px] w-full">
        <div className="absolute inset-0 bg-black/50 z-10" />
        <Image src="/images/halong.jpg" alt="Hero Image" fill className="object-cover" priority />
        <div className="container relative z-20 flex h-full max-w-screen-2xl flex-col items-center justify-center text-center text-white">
          <h1 className="text-4xl font-bold sm:text-5xl md:text-6xl">Khám phá Việt Nam</h1>
          <p className="mt-4 max-w-2xl text-lg sm:text-xl">
            Trải nghiệm những chuyến du lịch tuyệt vời với Trippio - Nền tảng đặt vé du lịch trực
            tuyến hàng đầu
          </p>
          <div className="mt-8 flex gap-4">
            <Link href="/tours">
              <Button size="lg" className="bg-white text-black hover:bg-white/90">
                Khám phá ngay
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/20"
              >
                Liên hệ với chúng tôi
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Tours */}
      <section className="container max-w-screen-2xl py-16">
        <div className="flex flex-col items-center justify-center text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">Tour du lịch nổi bật</h2>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            Khám phá những tour du lịch hấp dẫn nhất của chúng tôi với giá cả phải chăng và dịch vụ
            chất lượng
          </p>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuredTours.map((tour) => (
            <TourCard key={tour.id} tour={tour} />
          ))}
        </div>
        <div className="mt-12 flex justify-center">
          <Link href="/tours">
            <Button size="lg">Xem tất cả tours</Button>
          </Link>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-card py-16">
        <div className="container max-w-screen-2xl">
          <div className="flex flex-col items-center justify-center text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">Tại sao chọn Trippio?</h2>
            <p className="mt-4 max-w-2xl text-muted-foreground">
              Chúng tôi cam kết mang đến cho bạn những trải nghiệm du lịch tuyệt vời nhất
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
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
              <h3 className="mt-4 text-xl font-semibold">Đặt vé dễ dàng</h3>
              <p className="mt-2 text-muted-foreground">
                Quy trình đặt vé đơn giản, nhanh chóng và an toàn
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
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
              <h3 className="mt-4 text-xl font-semibold">Giá cả hợp lý</h3>
              <p className="mt-2 text-muted-foreground">
                Chúng tôi cam kết mang đến mức giá tốt nhất cho bạn
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
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
              <h3 className="mt-4 text-xl font-semibold">Dịch vụ chất lượng</h3>
              <p className="mt-2 text-muted-foreground">
                Đội ngũ nhân viên chuyên nghiệp, tận tâm phục vụ
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
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
              <h3 className="mt-4 text-xl font-semibold">Hỗ trợ 24/7</h3>
              <p className="mt-2 text-muted-foreground">
                Luôn sẵn sàng hỗ trợ bạn mọi lúc, mọi nơi
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="container max-w-screen-2xl py-16">
        <div className="rounded-lg bg-primary p-8 text-primary-foreground md:p-12 lg:p-16">
          <div className="flex flex-col items-center justify-center text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">Đăng ký nhận thông tin</h2>
            <p className="mt-4 max-w-2xl">
              Đăng ký để nhận thông tin về các ưu đãi và tour du lịch mới nhất từ Trippio
            </p>
            <div className="mt-8 flex w-full max-w-md flex-col gap-4 sm:flex-row">
              <input
                type="email"
                placeholder="Email của bạn"
                className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <Button className="h-12 bg-background text-foreground hover:bg-background/90">
                Đăng ký
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
