import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container max-w-screen-2xl py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <h3 className="text-lg font-semibold">Trippio</h3>
            <p className="mt-4 text-sm text-muted-foreground">
              Nền tảng đặt vé du lịch trực tuyến hàng đầu với nhiều ưu đãi hấp dẫn.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Liên kết</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-foreground">
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link href="/tours" className="text-muted-foreground hover:text-foreground">
                  Tours
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-foreground">
                  Giới thiệu
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-foreground">
                  Liên hệ
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Điểm đến phổ biến</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link
                  href="/tours?destination=ha-long"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Hạ Long
                </Link>
              </li>
              <li>
                <Link
                  href="/tours?destination=hoi-an"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Hội An
                </Link>
              </li>
              <li>
                <Link
                  href="/tours?destination=da-lat"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Đà Lạt
                </Link>
              </li>
              <li>
                <Link
                  href="/tours?destination=phu-quoc"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Phú Quốc
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Liên hệ</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li className="text-muted-foreground">Email: info@trippio.vn</li>
              <li className="text-muted-foreground">Điện thoại: 1900 1234</li>
              <li className="text-muted-foreground">
                Địa chỉ: 123 Đường ABC, Quận XYZ, TP. Hồ Chí Minh
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-border pt-6 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Trippio. Tất cả các quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  );
}
