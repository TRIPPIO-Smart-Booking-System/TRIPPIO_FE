'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  ChevronDown,
  Percent,
  LifeBuoy,
  Users,
  Bookmark,
  CalendarCheck2,
  CircleUserRound,
  Coins,
} from 'lucide-react';
import Button from '../ui/Button';

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const active = pathname === href;
  return (
    <Link
      href={href}
      className={`relative inline-flex items-center px-1 py-1 text-sm transition-colors
        ${active ? 'text-foreground' : 'text-foreground/70 hover:text-foreground'}
        after:absolute after:inset-x-0 after:-bottom-1 after:h-[2px] after:rounded-full
        ${active ? 'after:bg-primary' : 'after:bg-transparent group-hover:after:bg-foreground/20'}
      `}
    >
      {children}
    </Link>
  );
}

function UtilityItem({
  icon,
  children,
  badge,
}: {
  icon?: React.ReactNode;
  children: React.ReactNode;
  badge?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      className="group inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs text-white/90 hover:bg-white/10 hover:text-white"
    >
      {icon}
      <span className="hidden sm:inline">{children}</span>
      {badge}
      <ChevronDown className="ml-1 hidden h-3.5 w-3.5 opacity-60 sm:block" />
    </button>
  );
}

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-shadow
        ${scrolled ? 'shadow-[0_1px_12px_rgba(0,0,0,0.12)]' : ''}
      `}
    >
      {/* Blue textured/gradient bar like Traveloka */}
      <div className="relative isolate overflow-hidden bg-[radial-gradient(1200px_400px_at_-100px_-200px,rgba(59,130,246,0.25),transparent_60%),linear-gradient(180deg,#0b2749,#0e315c)]">
        {/* subtle stars/noise */}
        <div className="pointer-events-none absolute inset-0 opacity-30 [background:radial-gradient(2px_2px_at_20px_30px,rgba(255,255,255,.25)_1px,transparent_1px)] [background-size:40px_40px]" />

        {/* Top utility bar */}
        <div className="container relative z-10 mx-auto max-w-screen-2xl px-4">
          <div className="flex h-12 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 text-white">
              <div className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-white/15 text-white">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l7 19H5L12 2z" />
                </svg>
              </div>
              <span className="text-lg font-extrabold tracking-tight">Trippio</span>
            </Link>

            {/* Utility nav (desktop) */}
            <div className="hidden items-center gap-1 md:flex">
              <UtilityItem icon={<span className="text-base">🇻🇳</span>}>VND | VI</UtilityItem>

              <UtilityItem icon={<Percent className="h-4 w-4" />}>Khuyến mãi</UtilityItem>

              <UtilityItem icon={<LifeBuoy className="h-4 w-4" />}>Hỗ trợ</UtilityItem>

              <UtilityItem icon={<Users className="h-4 w-4" />}>Hợp tác với chúng tôi</UtilityItem>

              <UtilityItem icon={<Bookmark className="h-4 w-4" />}>Đã lưu</UtilityItem>

              <UtilityItem icon={<CalendarCheck2 className="h-4 w-4" />}>
                Đặt chỗ của tôi
              </UtilityItem>

              {/* Account pill with points */}
              <Link
                href="/account"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-3 py-2 text-xs text-white hover:bg-white/15"
              >
                <CircleUserRound className="h-4 w-4" />
                <span className="max-w-[120px] truncate">Hoàng Tr&igrave; I</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-yellow-400/90 px-2 py-0.5 text-[10px] font-semibold text-black">
                  <Coins className="h-3 w-3" /> 0 Điểm
                </span>
                <ChevronDown className="h-3.5 w-3.5 opacity-70" />
              </Link>
            </div>

            {/* Mobile hamburger (on blue bar) */}
            <button
              aria-label="Toggle menu"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/20 text-white md:hidden"
            >
              <svg
                className={`transition-transform ${open ? 'rotate-90' : ''}`}
                width="18"
                height="18"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
              >
                {open ? (
                  <path d="M6 6l12 12M18 6L6 18" />
                ) : (
                  <>
                    <path d="M3 6h18" />
                    <path d="M3 12h18" />
                    <path d="M3 18h18" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Secondary nav row (white text over blue) */}
        <div className="container relative z-10 mx-auto max-w-screen-2xl px-4">
          <div className="flex h-14 items-center justify-between">
            <nav className="hidden items-center gap-6 text-white md:flex">
              <NavLink href="/">Trang chủ</NavLink>
              <NavLink href="/tours">Tours</NavLink>
              <NavLink href="/about">Giới thiệu</NavLink>
              <NavLink href="/contact">Liên hệ</NavLink>
            </nav>

            <div className="hidden items-center gap-2 md:flex">
              <Link href="/login">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 rounded-full border-white/30 bg-white/0 px-4 text-white hover:bg-white/10"
                >
                  Đăng nhập
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  size="sm"
                  className="h-9 rounded-full bg-white px-4 text-[#0e315c] hover:bg-white/90"
                >
                  Đăng ký
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile dropdown (white background) */}
      <div
        className={`md:hidden overflow-hidden bg-white transition-[max-height,opacity] duration-300
          ${open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
        `}
      >
        <div className="mx-auto max-w-screen-2xl px-4 pb-4 pt-2">
          {/* Utility items compact */}
          <div className="mb-2 grid grid-cols-2 gap-2 text-sm">
            <button className="rounded-xl border px-3 py-2">🇻🇳 VND | VI</button>
            <button className="rounded-xl border px-3 py-2">Khuyến mãi</button>
            <button className="rounded-xl border px-3 py-2">Hỗ trợ</button>
            <button className="rounded-xl border px-3 py-2">Hợp tác</button>
            <button className="rounded-xl border px-3 py-2">Đã lưu</button>
            <button className="rounded-xl border px-3 py-2">Đặt chỗ của tôi</button>
          </div>

          <div className="flex flex-col gap-1">
            {[
              ['/', 'Trang chủ'],
              ['/tours', 'Tours'],
              ['/about', 'Giới thiệu'],
              ['/contact', 'Liên hệ'],
            ].map(([href, label]) => (
              <Link
                key={href}
                href={href}
                className={`rounded-xl px-3 py-2 text-sm ${
                  pathname === href ? 'bg-primary/10 text-primary' : 'hover:bg-foreground/[0.05]'
                }`}
              >
                {label}
              </Link>
            ))}
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <Link href="/login">
              <Button variant="outline" className="h-10 w-full rounded-xl">
                Đăng nhập
              </Button>
            </Link>
            <Link href="/register">
              <Button className="h-10 w-full rounded-xl">Đăng ký</Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
