import Link from 'next/link';
import Image from 'next/image';
import Button from '../ui/Button';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <span className="text-primary">Trippio</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium ml-auto">
          <Link href="/" className="transition-colors hover:text-foreground/80">
            Trang chủ
          </Link>
          <Link href="/tours" className="transition-colors hover:text-foreground/80">
            Tours
          </Link>
          <Link href="/about" className="transition-colors hover:text-foreground/80">
            Giới thiệu
          </Link>
          <Link href="/contact" className="transition-colors hover:text-foreground/80">
            Liên hệ
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Link href="/login">
            <Button variant="outline" size="sm">
              Đăng nhập
            </Button>
          </Link>
          <Link href="/register">
            <Button size="sm">Đăng ký</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
