'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { User, ShoppingCart, LogOut, Clock } from 'lucide-react';

/* ---------- helpers ---------- */
function useOnClickOutside<T extends HTMLElement>(ref: React.RefObject<T>, cb: () => void) {
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) cb();
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && cb();
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [cb, ref]);
}

function hasToken(): boolean {
  try {
    const keys = ['userId', 'accessToken', 'authToken', 'trippio_token'];
    return keys.some((k) => {
      const v = localStorage.getItem(k);
      return typeof v === 'string' && v.length > 0;
    });
  } catch {
    return false;
  }
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(href + '/');
  return (
    <Link
      href={href}
      className={`group relative inline-flex items-center px-3 py-1.5 text-[15px] font-medium tracking-tight transition-colors
        ${active ? 'text-white' : 'text-white/80 hover:text-white'}`}
    >
      <span className="relative">
        {children}
        <span
          className={`absolute -bottom-1 left-0 h-[2px] w-full origin-left scale-x-0 rounded-full bg-white/90 transition-transform duration-300 group-hover:scale-x-100 ${active ? 'scale-x-100' : ''}`}
        />
      </span>
    </Link>
  );
}

/* =============================== HEADER =============================== */
export default function Header() {
  const pathname = usePathname();

  const [openMobile, setOpenMobile] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hiddenByScroll, setHiddenByScroll] = useState(false);
  const lastY = useRef(0);
  const ticking = useRef(false);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const ddRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(ddRef, () => setDropdownOpen(false));

  /* --- scroll listeners --- */
  useEffect(() => {
    lastY.current = window.scrollY;
    const onScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          const y = window.scrollY;
          setScrolled(y > 4);
          const delta = y - lastY.current;
          if (Math.abs(delta) > 8) {
            if (y > 72 && delta > 0) setHiddenByScroll(true);
            else setHiddenByScroll(false);
            lastY.current = y;
          }
          ticking.current = false;
        });
        ticking.current = true;
      }
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // 🔄 cập nhật trạng thái login: khi mount + đổi route
  useEffect(() => {
    setIsLoggedIn(hasToken());
  }, [pathname]);

  // 🔔 lắng nghe thay đổi localStorage (multi-tab) + custom event trong cùng tab
  useEffect(() => {
    const onStorage = () => setIsLoggedIn(hasToken());
    const onAuthChanged = () => setIsLoggedIn(hasToken());
    window.addEventListener('storage', onStorage);
    window.addEventListener('auth:changed', onAuthChanged as EventListener);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('auth:changed', onAuthChanged as EventListener);
    };
  }, []);

  // close menus on route change
  useEffect(() => {
    setOpenMobile(false);
    setDropdownOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    try {
      localStorage.removeItem('userId');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('authToken');
      localStorage.removeItem('trippio_token');
    } catch {}
    // thông báo cho header các nơi khác
    window.dispatchEvent(new Event('auth:changed'));
    // hard redirect để reset toàn bộ state nếu muốn
    window.location.href = '/login';
  };

  return (
    <header
      className={`
        sticky top-0 z-[60] w-full transition-transform duration-300
        ${hiddenByScroll ? '-translate-y-full' : 'translate-y-0'}
      `}
    >
      {/* thanh nền—overflow-visible để dropdown không bị cắt */}
      <div
        className={`relative isolate overflow-visible transition-shadow ${
          scrolled ? 'shadow-[0_6px_24px_-10px_rgba(0,0,0,.35)]' : ''
        }`}
      >
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[linear-gradient(180deg,#0b2749,#0e315c)]" />
          <div className="aurora absolute -inset-24 blur-3xl" />
          <div className="pointer-events-none absolute inset-0 opacity-30 [background:radial-gradient(2px_2px_at_20px_30px,rgba(255,255,255,.25)_1px,transparent_1px)] [background-size:40px_40px]" />
        </div>

        {/* row 1 — rút gọn padding/height */}
        <div className="container relative z-10 mx-auto max-w-screen-2xl px-4 py-1.5">
          <div className="flex h-12 items-center justify-between">
            {/* logo */}
            <Link href="/homepage" className="group inline-flex items-center gap-2 text-white">
              <div className="relative">
                <div className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/20 backdrop-blur">
                  <svg width="16" height="16" viewBox="0 0 24 24" className="text-white">
                    <path d="M12 2l7 19H5L12 2z" fill="currentColor" />
                  </svg>
                </div>
                <span className="absolute -inset-1 -z-10 rounded-lg bg-white/10 opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-100" />
              </div>
              <span className="text-base font-extrabold tracking-tight">Trippio</span>
            </Link>

            {/* hamburger */}
            <button
              aria-label="Toggle menu"
              aria-expanded={openMobile}
              onClick={() => setOpenMobile((v) => !v)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/20 text-white md:hidden"
            >
              <svg
                className={`transition-transform ${openMobile ? 'rotate-90' : ''}`}
                width="16"
                height="16"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
              >
                {openMobile ? (
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

        {/* row 2 — menu và profile */}
        <div className="container relative z-10 mx-auto max-w-screen-2xl px-4 pb-2">
          <div className="flex h-12 items-center justify-between">
            <nav className="hidden items-center gap-3 md:flex">
              <NavLink href="/homepage">Trang chủ</NavLink>
              <NavLink href="/tours">Tours</NavLink>
              <NavLink href="/hotel">Khách sạn</NavLink>
              <NavLink href="/show">Vui chơi</NavLink>
              <NavLink href="/transport">Chuyến bay</NavLink>

              <NavLink href="/contact">Liên hệ</NavLink>
            </nav>

            {/* profile dropdown */}
            <div className="relative" ref={ddRef}>
              <button
                className="flex items-center gap-2 rounded-full px-2.5 py-1 text-white hover:bg-white/10"
                onClick={() => setDropdownOpen((p) => !p)}
              >
                <User className="h-5 w-5" />
                <span className="hidden text-[13px] font-semibold sm:inline">
                  {isLoggedIn ? 'Tài khoản' : 'Đăng nhập'}
                </span>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-xl border border-white/10 bg-white shadow-xl ring-1 ring-black/5">
                  {isLoggedIn ? (
                    <>
                      <Link
                        href="/account"
                        className="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-100"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <User className="mr-2 inline-block h-5 w-5" />
                        Hồ sơ của tôi
                      </Link>
                      <Link
                        href="/cart"
                        className="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-100"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <ShoppingCart className="mr-2 inline-block h-5 w-5" />
                        Giỏ hàng
                      </Link>
                      <Link
                        href="/transaction-history"
                        className="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-100"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <Clock className="mr-2 inline-block h-5 w-5" />
                        Lịch sử giao dịch
                      </Link>
                      <button
                        className="block w-full px-4 py-2 text-left text-sm text-gray-800 hover:bg-gray-100"
                        onClick={handleLogout}
                      >
                        <LogOut className="mr-2 inline-block h-5 w-5" />
                        Đăng xuất
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        className="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-100"
                        onClick={() => setDropdownOpen(false)}
                      >
                        Đăng nhập
                      </Link>
                      <Link
                        href="/register"
                        className="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-100"
                        onClick={() => setDropdownOpen(false)}
                      >
                        Đăng ký
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* mobile menu (gọn) */}
      <div
        className={`md:hidden overflow-hidden bg-white/95 backdrop-blur transition-[max-height,opacity] duration-300 shadow-lg
          ${openMobile ? 'max-h-[18rem] opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="mx-auto max-w-screen-2xl px-4 pb-3 pt-2">
          <div className="flex flex-col gap-1">
            {[
              ['/homepage', 'Trang chủ'],
              ['/tours', 'Tours'],
              ['/hotel', 'Khách sạn'],
              ['/show', 'Vui chơi'],
              ['/about', 'Giới thiệu'],
              ['/contact', 'Liên hệ'],
            ].map(([href, label]) => (
              <Link
                key={href}
                href={href}
                className={`rounded-xl px-3 py-2 text-sm ${
                  pathname === href || pathname.startsWith(href + '/')
                    ? 'bg-sky-100 text-sky-700'
                    : 'hover:bg-foreground/[0.05]'
                }`}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .aurora {
          background:
            radial-gradient(800px 300px at 20% -10%, rgba(14,165,233,0.45), transparent 60%),
            radial-gradient(700px 280px at 90% -20%, rgba(168,85,247,0.45), transparent 60%),
            radial-gradient(600px 260px at 60% 0%, rgba(255,255,255,0.15), transparent 60%);
          animation: aurora 12s ease-in-out infinite alternate;
        }
        @keyframes aurora {
          0% { transform: translateY(-10px) rotate(0.5deg); filter: hue-rotate(0deg); }
          50% { transform: translateY(-6px) rotate(-0.5deg); filter: hue-rotate(20deg); }
          100% { transform: translateY(-8px) rotate(0deg); filter: hue-rotate(-10deg); }
        }
      `}</style>
    </header>
  );
}
