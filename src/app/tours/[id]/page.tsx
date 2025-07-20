import { tours } from '@/data/tours';
import Button from '@/components/ui/Button';
import Image from 'next/image';
import { notFound } from 'next/navigation';

interface TourDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function TourDetailPage({ params }: TourDetailPageProps) {
  const { id } = await params;
  const tour = tours.find((tour) => tour.id === id);

  if (!tour) {
    notFound();
  }

  return (
    <div className="container max-w-screen-2xl py-16">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="relative h-[400px] w-full overflow-hidden rounded-lg">
            <Image src={tour.imageUrl} alt={tour.title} fill className="object-cover" priority />
          </div>
          <h1 className="mt-8 text-3xl font-bold">{tour.title}</h1>
          <div className="mt-4 flex items-center gap-2">
            <div className="flex items-center gap-1">
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
                className="text-yellow-500"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              <span className="font-medium">{tour.rating}</span>
              <span className="text-muted-foreground">({tour.reviews} đánh giá)</span>
            </div>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">{tour.destination}</span>
          </div>
          <div className="mt-8">
            <h2 className="text-2xl font-semibold">Mô tả</h2>
            <p className="mt-4 text-muted-foreground">{tour.description}</p>
          </div>
          <div className="mt-8">
            <h2 className="text-2xl font-semibold">Điểm nổi bật</h2>
            <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {tour.highlights.map((highlight, index) => (
                <li key={index} className="flex items-center gap-2">
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
                    className="text-primary"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-8">
            <h2 className="text-2xl font-semibold">Lịch trình</h2>
            <div className="mt-4 space-y-4">
              {tour.itinerary.map((item) => (
                <div key={item.day} className="rounded-lg border border-border p-4">
                  <h3 className="font-semibold">
                    Ngày {item.day}: {item.title}
                  </h3>
                  <p className="mt-2 text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div>
          <div className="sticky top-24 rounded-lg border border-border p-6">
            <h2 className="text-2xl font-semibold">Đặt tour</h2>
            <div className="mt-4 space-y-4">
              <div>
                <p className="text-sm font-medium">Giá tour</p>
                <p className="text-2xl font-bold">{tour.price.toLocaleString('vi-VN')} đ</p>
                <p className="text-sm text-muted-foreground">/ người</p>
              </div>
              <div>
                <p className="text-sm font-medium">Thời gian</p>
                <p className="font-medium">{tour.duration}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Dịch vụ bao gồm</p>
                <ul className="mt-2 space-y-2">
                  {tour.included.map((item, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
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
                        className="text-primary"
                      >
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="pt-4">
                <Button className="w-full">Đặt ngay</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
