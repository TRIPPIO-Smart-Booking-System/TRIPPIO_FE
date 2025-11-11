// /src/components/layout/Header.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { User, ShoppingCart, LogOut, Clock } from 'lucide-react';
import { apiGetMe, type UserResponse } from '@/lib/api';

/* ---------- helpers (dùng callback ref, không dùng RefObject) ---------- */
function useOnClickOutsideEl<T extends HTMLElement>(el: T | null, cb: () => void) {
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (el && !el.contains(e.target as Node | null)) cb();
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && cb();
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [el, cb]);
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
          className={`absolute -bottom-1 left-0 h-0.5 w-full origin-left scale-x-0 rounded-full bg-white/90 transition-transform duration-300 group-hover:scale-x-100 ${active ? 'scale-x-100' : ''}`}
        />
      </span>
    </Link>
  );
}

/* -------- chuẩn hoá URL avatar (BE trả path tương đối) -------- */
const API_BASE = (process.env.NEXT_PUBLIC_API_BASE ?? 'https://trippio.azurewebsites.net').replace(
  /\/+$/,
  ''
);
function toAbsolute(src?: string | null) {
  if (!src) return '';
  if (/^https?:\/\//i.test(src)) return src;
  if (src.startsWith('/')) return `${API_BASE}${src}`;
  return `${API_BASE}/${src.replace(/^\/+/, '')}`;
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

  // user state để lấy avatar
  const [me, setMe] = useState<UserResponse | null>(null);

  // dùng callback ref thay vì RefObject để tránh TS2345
  const [ddEl, setDdEl] = useState<HTMLDivElement | null>(null);
  useOnClickOutsideEl(ddEl, () => setDropdownOpen(false));

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

  // 📥 tải /api/user/me khi đã login
  useEffect(() => {
    let mounted = true;
    async function loadMe() {
      if (!isLoggedIn) {
        if (mounted) setMe(null);
        return;
      }
      try {
        const u = await apiGetMe();
        if (mounted) setMe(u);
      } catch {
        if (mounted) setMe(null);
      }
    }
    loadMe();

    // refetch khi có auth:changed
    const onAuthChanged = () => loadMe();
    window.addEventListener('auth:changed', onAuthChanged as EventListener);
    return () => {
      mounted = false;
      window.removeEventListener('auth:changed', onAuthChanged as EventListener);
    };
  }, [isLoggedIn]);

  const handleLogout = () => {
    try {
      localStorage.removeItem('userId');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('authToken');
      localStorage.removeItem('trippio_token');
    } catch {}
    window.dispatchEvent(new Event('auth:changed'));
    window.location.href = '/login';
  };

  // avatar hiển thị (ưu tiên avatar hợp lệ)
  const avatarSrc = toAbsolute(me?.avatar);

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
          <div className="pointer-events-none absolute inset-0 opacity-30 [background:radial-gradient(2px_2px_at_20px_30px,rgba(255,255,255,.25)_1px,transparent_1px)] bg-size-[40px_40px]" />
        </div>

        {/* row 1 — rút gọn padding/height */}
        <div className="container relative z-10 mx-auto max-w-screen-2xl px-4 py-1.5">
          <div className="flex h-12 items-center justify-between">
            {/* logo */}
            <Link
              href="/homepage"
              className="group inline-flex items-center gap-2 text-white hover:opacity-90 transition-opacity"
            >
              <div className="relative h-8 w-auto">
                <svg
                  width="120"
                  height="32"
                  viewBox="0 0 200 120"
                  className="h-8 w-auto fill-none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Left curved swash */}
                  <path
                    d="M 5 30 Q 30 10 50 40"
                    stroke="currentColor"
                    strokeWidth="12"
                    strokeLinecap="round"
                  />

                  {/* Globe */}
                  <circle cx="70" cy="60" r="35" stroke="currentColor" strokeWidth="3" />
                  <circle
                    cx="70"
                    cy="60"
                    r="32"
                    stroke="currentColor"
                    strokeWidth="2"
                    opacity="0.5"
                  />
                  <ellipse
                    cx="70"
                    cy="60"
                    rx="32"
                    ry="10"
                    stroke="currentColor"
                    strokeWidth="2"
                    opacity="0.5"
                  />
                  <path
                    d="M 38 60 Q 70 75 102 60"
                    stroke="currentColor"
                    strokeWidth="2"
                    opacity="0.5"
                  />

                  {/* Small plane on globe */}
                  <circle cx="85" cy="45" r="3" fill="currentColor" />

                  {/* Right curved swash */}
                  <path
                    d="M 195 90 Q 170 110 150 80"
                    stroke="currentColor"
                    strokeWidth="12"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
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
              <NavLink href="/hotel">Khách sạn</NavLink>
              <NavLink href="/show">Vui chơi</NavLink>
              <NavLink href="/transport">Chuyến bay</NavLink>
              <NavLink href="/contact">Liên hệ</NavLink>
              {isLoggedIn && (
                <Link
                  href="/travel-assistant"
                  className="inline-flex items-center gap-2 ml-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-[14px] font-semibold shadow-lg transition-all hover:shadow-xl hover:scale-105"
                >
                  🤖 AI Tư Vấn
                </Link>
              )}
            </nav>

            {/* profile dropdown */}
            <div className="relative" ref={setDdEl}>
              <button
                className="flex items-center gap-2 rounded-full px-2.5 py-1 text-white hover:bg-white/10"
                onClick={() => setDropdownOpen((p) => !p)}
              >
                {/* === Avatar khi login, fallback icon khi chưa có === */}
                {isLoggedIn && avatarSrc ? (
                  <div className="relative h-7 w-7 flex-shrink-0 group">
                    <Image
                      src={avatarSrc}
                      alt={me?.fullName || 'Avatar'}
                      width={28}
                      height={28}
                      className="h-7 w-7 rounded-full object-cover ring-1 ring-white/30 group-[.img-error]:hidden"
                      unoptimized
                      onError={(e) => {
                        // Show fallback on load error
                        const container = (e.target as HTMLImageElement).parentElement;
                        if (container) {
                          container.classList.add('img-error');
                        }
                      }}
                    />
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 items-center justify-center text-white text-xs font-bold ring-1 ring-white/30 hidden group-[.img-error]:flex">
                      {me?.firstName?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  </div>
                ) : (
                  <User className="h-5 w-5" />
                )}

                <span className="hidden text-[13px] font-semibold sm:inline">
                  {isLoggedIn ? me?.fullName || 'Tài khoản' : 'Đăng nhập'}
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
                        href="/travel-assistant"
                        className="block px-4 py-2 text-sm text-purple-700 hover:bg-purple-50 font-semibold border-t border-b border-gray-200"
                        onClick={() => setDropdownOpen(false)}
                      >
                        🤖 AI Tư Vấn Du Lịch
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
                        href="/payment"
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
          ${openMobile ? 'max-h-72 opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="mx-auto max-w-screen-2xl px-4 pb-3 pt-2">
          <div className="flex flex-col gap-1">
            {[
              ['/homepage', 'Trang chủ'],
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
                    : 'hover:bg-foreground/5'
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
