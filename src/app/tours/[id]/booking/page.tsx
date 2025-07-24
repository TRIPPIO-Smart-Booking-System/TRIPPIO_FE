import { tours } from '@/data/tours';
import Button from '@/components/ui/Button';
import { notFound } from 'next/navigation';

interface BookingPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function BookingPage({ params }: BookingPageProps) {
  const { id } = await params;
  const tour = tours.find((tour) => tour.id === id);

  if (!tour) {
    notFound();
  }

  return (
    <div className="container max-w-screen-2xl py-16">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold">Đặt tour: {tour.title}</h1>
        <p className="mt-2 text-muted-foreground">{tour.destination}</p>

        <div className="mt-8 rounded-lg border border-border p-6">
          <h2 className="text-xl font-semibold">Thông tin liên hệ</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium">
                Họ
              </label>
              <input
                type="text"
                id="firstName"
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium">
                Tên
              </label>
              <input
                type="text"
                id="lastName"
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium">
                Email
              </label>
              <input
                type="email"
                id="email"
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium">
                Số điện thoại
              </label>
              <input
                type="tel"
                id="phone"
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-lg border border-border p-6">
          <h2 className="text-xl font-semibold">Thông tin đặt tour</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="date" className="block text-sm font-medium">
                Ngày khởi hành
              </label>
              <input
                type="date"
                id="date"
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
            <div>
              <label htmlFor="people" className="block text-sm font-medium">
                Số người
              </label>
              <input
                type="number"
                id="people"
                min="1"
                defaultValue="1"
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="notes" className="block text-sm font-medium">
                Ghi chú
              </label>
              <textarea
                id="notes"
                rows={4}
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-lg border border-border p-6">
          <h2 className="text-xl font-semibold">Tóm tắt đơn hàng</h2>
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between">
              <span>Giá tour</span>
              <span>{tour.price.toLocaleString('vi-VN')} đ</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Số người</span>
              <span>1</span>
            </div>
            <div className="border-t border-border pt-2">
              <div className="flex items-center justify-between font-semibold">
                <span>Tổng cộng</span>
                <span>{tour.price.toLocaleString('vi-VN')} đ</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <Button size="lg">Xác nhận đặt tour</Button>
        </div>
      </div>
    </div>
  );
}
