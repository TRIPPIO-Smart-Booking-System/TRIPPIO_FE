'use client';

import Link from 'next/link';
import { FaGlobeAsia } from 'react-icons/fa';

export default function Header() {
  return (
    <header className="bg-[#6ab1ad] px-6 py-3 flex justify-between items-center">
      {/* Logo */}
      <div className="bg-white rounded-md px-3 py-1">
        <img src="/TripIoLogo.png" alt="TripIo Logo" className="h-8" />
      </div>

      {/* Navigation */}
      <nav className="flex items-center gap-6 text-white font-semibold text-sm">
        <Link href="#" className="hover:underline">
          Hỗ trợ
        </Link>
        <Link href="#" className="hover:underline">
          Khuyến mãi
        </Link>
        <Link href="#" className="hover:underline">
          Khác
        </Link>

        {/* Language Selector */}
        <div className="flex items-center gap-1">
          <FaGlobeAsia className="text-white" />
          <span>VN</span>
        </div>

        {/* Auth Buttons */}
        <Link
          href="/login"
          className="bg-white text-black px-4 py-1 rounded font-medium hover:bg-gray-100 transition"
        >
          Đăng nhập
        </Link>
        <Link
          href="/register"
          className="bg-white text-black px-4 py-1 rounded font-medium hover:bg-gray-100 transition"
        >
          Đăng Ký
        </Link>
      </nav>
    </header>
  );
}
