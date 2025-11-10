// components/Footer.tsx
'use client';

import Image from 'next/image';
import { Mail, Phone, MapPin, Facebook, Instagram, Youtube } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative mt-16 border-t border-zinc-200 dark:border-zinc-800 bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-950 dark:to-zinc-900">
      {/* Glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-8 h-24 bg-gradient-to-b from-blue-500/20 to-transparent blur-2xl"
      />

      <div className="mx-auto max-w-6xl px-4 py-10 md:py-14">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-[1.2fr,1fr,1fr]">
          {/* Brand + slogan */}
          <div>
            <div className="text-2xl font-extrabold tracking-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                Trippio
              </span>
            </div>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Đặt phòng – săn vé – trải nghiệm địa phương. Tất cả trong một ứng dụng.
            </p>

            {/* Socials */}
            <div className="mt-4 flex items-center gap-3 text-zinc-600 dark:text-zinc-400">
              <a
                href="#"
                aria-label="Facebook"
                className="rounded-lg p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="rounded-lg p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                aria-label="YouTube"
                className="rounded-lg p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Liên hệ */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Liên hệ</h3>
            <ul className="mt-3 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <a href="mailto:support@trippio.app" className="hover:underline">
                  support@trippio.app
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <a href="tel:+84900000000" className="hover:underline">
                  +84 900 000 000
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4" />
                <span>Ho Chi Minh City, Viet Nam</span>
              </li>
            </ul>
          </div>

          {/* QR Card */}
          <div>
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 shadow-sm hover:shadow-md transition-shadow">
              <div className="rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-3">
                <div className="aspect-square overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950">
                  {/* IMPORTANT: image path is from /public */}
                  <Image
                    src="/images/qrTripio.jpg"
                    alt="QR tải ứng dụng Trippio"
                    width={480}
                    height={480}
                    className="h-full w-full object-contain"
                    priority
                  />
                </div>
              </div>

              <div className="mt-3 text-center">
                <div className="text-sm font-semibold">Quét mã để tải app</div>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  Trải nghiệm đặt dịch vụ du lịch nhanh chóng cùng Trippio.
                </p>

                {/* Optional store buttons (placeholder links) */}
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <a
                    href="#"
                    className="inline-flex items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-700 px-3 py-2 text-xs font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800"
                  >
                    Tải trên App Store
                  </a>
                  <a
                    href="#"
                    className="inline-flex items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-700 px-3 py-2 text-xs font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800"
                  >
                    Tải trên Google Play
                  </a>
                </div>
              </div>
            </div>

            {/* Mini note */}
            <p className="mt-2 text-center text-[11px] text-zinc-500 dark:text-zinc-400">
              Hoặc vào <span className="font-medium">trippio.app/download</span>
            </p>
          </div>
        </div>

        {/* bottom line */}
        <div className="mt-10 border-t border-zinc-200 dark:border-zinc-800 pt-4 text-center text-xs text-zinc-500 dark:text-zinc-400">
          © {new Date().getFullYear()} Trippio. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
