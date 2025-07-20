import Button from '@/components/ui/Button';
import Link from 'next/link';

export default function ConfirmationPage() {
  return (
    <div className="container max-w-screen-2xl py-16">
      <div className="mx-auto max-w-2xl text-center">
        <div className="flex justify-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-primary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>
        </div>
        <h1 className="mt-6 text-3xl font-bold">Đặt tour thành công!</h1>
        <p className="mt-4 text-muted-foreground">
          Cảm ơn bạn đã đặt tour với Trippio. Chúng tôi đã gửi email xác nhận đến địa chỉ email của
          bạn.
        </p>
        <div className="mt-8 rounded-lg border border-border p-6 text-left">
          <h2 className="text-xl font-semibold">Thông tin đặt tour</h2>
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Mã đặt tour</span>
              <span className="font-medium">TRIP-123456</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Tour</span>
              <span className="font-medium">Khám phá Vịnh Hạ Long</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Ngày khởi hành</span>
              <span className="font-medium">15/08/2023</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Số người</span>
              <span className="font-medium">1</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Tổng cộng</span>
              <span className="font-medium">2.500.000 đ</span>
            </div>
          </div>
        </div>
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link href="/">
            <Button size="lg">Quay lại trang chủ</Button>
          </Link>
          <Link href="/tours">
            <Button size="lg" variant="outline">
              Khám phá thêm tours
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
