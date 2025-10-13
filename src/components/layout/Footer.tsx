import Link from 'next/link';
import { Facebook, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative mt-16 overflow-hidden bg-gradient-to-b from-background to-card text-foreground">
      <div className="mx-auto max-w-screen-2xl px-4 pt-12 pb-8 md:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Cột 1 - Logo & Mô tả */}
          <div>
            <h3 className="flex items-center gap-2 text-lg font-bold">
              <span className="inline-block rounded-full bg-muted p-1">
                <span className="block h-3 w-3 rounded-full bg-primary" />
              </span>
              Trippio
            </h3>
            <p className="mt-3 text-sm text-muted-foreground">
              Nền tảng đặt vé du lịch trực tuyến hàng đầu với nhiều ưu đãi hấp dẫn.
            </p>
            <div className="mt-4 flex gap-3">
              <Link
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-full border hover:bg-muted"
              >
                <Facebook className="h-4 w-4" />
              </Link>
              <Link
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-full border hover:bg-muted"
              >
                <Instagram className="h-4 w-4" />
              </Link>
              <Link
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-full border hover:bg-muted"
              >
                <Youtube className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Cột 2 - Liên kết */}
          <div>
            <h4 className="text-lg font-semibold">Liên kết</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/">Trang chủ</Link>
              </li>
              <li>
                <Link href="/tours">Tours</Link>
              </li>
              <li>
                <Link href="/about">Giới thiệu</Link>
              </li>
              <li>
                <Link href="/contact">Liên hệ</Link>
              </li>
            </ul>
          </div>

          {/* Cột 3 - Điểm đến phổ biến */}
          <div>
            <h4 className="text-lg font-semibold">Điểm đến phổ biến</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="#">Hạ Long</Link>
              </li>
              <li>
                <Link href="#">Hội An</Link>
              </li>
              <li>
                <Link href="#">Đà Lạt</Link>
              </li>
              <li>
                <Link href="#">Phú Quốc</Link>
              </li>
            </ul>
          </div>

          {/* Cột 4 - Liên hệ */}
          <div>
            <h4 className="text-lg font-semibold">Liên hệ</h4>
            <ul className="mt-3 space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" /> info@trippio.vn
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" /> 1900 1234
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4" /> 123 Đường ABC, Quận XYZ, TP. Hồ Chí Minh
              </li>
            </ul>
            <div className="mt-4 flex">
              <input
                type="email"
                placeholder="Nhập email để nhận tin"
                className="flex-1 rounded-l-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
              <button className="rounded-r-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                Đăng ký
              </button>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t pt-4 text-xs text-muted-foreground md:flex-row">
          <p>© 2025 Trippio. Tất cả các quyền được bảo lưu.</p>
          <div className="flex gap-4">
            <Link href="#">Điều khoản</Link>
            <Link href="#">Chính sách bảo mật</Link>
          </div>
        </div>
      </div>

      {/* Blob trang trí - không còn gây dư khoảng trắng */}
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
    </footer>
  );
}
