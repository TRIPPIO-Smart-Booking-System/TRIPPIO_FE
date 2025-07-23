'use client';

import Link from 'next/link';
import Image from 'next/image';
import Button from '../ui/Button';
import { useEffect, useState } from 'react';

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    // Kiểm tra trạng thái đăng nhập
    const checkLoginStatus = () => {
      const loginStatus = localStorage.getItem('isLoggedIn');
      // Lấy tên người dùng từ localStorage (được cập nhật từ trang profile)
      const profileName = localStorage.getItem('profileName') || '';
      setIsLoggedIn(loginStatus === 'true');
      setUserName(profileName);
    };

    checkLoginStatus();
    // Lắng nghe sự kiện storage change để cập nhật UI khi đăng nhập/đăng xuất
    window.addEventListener('storage', checkLoginStatus);
    return () => window.removeEventListener('storage', checkLoginStatus);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('profileName');
    setIsLoggedIn(false);
    setUserName('');
    window.location.href = '/';
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-sm">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/images/logo.png" alt="Trippio Logo" width={32} height={32} />
          <span className="text-xl font-bold text-teal-500">Trippio</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link href="/" className="text-gray-800 transition-colors hover:text-teal-500">
            Trang chủ
          </Link>
          <Link href="/tours" className="text-gray-800 transition-colors hover:text-teal-500">
            Tours
          </Link>
          <Link href="/about" className="text-gray-800 transition-colors hover:text-teal-500">
            Giới thiệu
          </Link>
          <Link href="/contact" className="text-gray-800 transition-colors hover:text-teal-500">
            Liên hệ
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <button className="md:hidden text-gray-800" onClick={toggleMenu}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {isMenuOpen ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </>
            ) : (
              <>
                <line x1="4" y1="12" x2="20" y2="12"></line>
                <line x1="4" y1="6" x2="20" y2="6"></line>
                <line x1="4" y1="18" x2="20" y2="18"></line>
              </>
            )}
          </svg>
        </button>

        {/* User Actions */}
        <div className="hidden md:flex items-center gap-2">
          {isLoggedIn ? (
            <>
              {userName && <span className="text-sm font-medium mr-2">Xin chào, {userName}</span>}
              <Link href="/profile">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-teal-500 text-teal-500 hover:bg-teal-50"
                >
                  Tài khoản
                </Button>
              </Link>
              <Button
                size="sm"
                className="bg-teal-500 text-white hover:bg-teal-600"
                onClick={handleLogout}
              >
                Đăng xuất
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-teal-500 text-teal-500 hover:bg-teal-50"
                >
                  Đăng nhập
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="bg-teal-500 text-white hover:bg-teal-600">
                  Đăng ký
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 py-4 px-4">
          <nav className="flex flex-col space-y-4">
            <Link href="/" className="text-gray-800 transition-colors hover:text-teal-500">
              Trang chủ
            </Link>
            <Link href="/tours" className="text-gray-800 transition-colors hover:text-teal-500">
              Tours
            </Link>
            <Link href="/about" className="text-gray-800 transition-colors hover:text-teal-500">
              Giới thiệu
            </Link>
            <Link href="/contact" className="text-gray-800 transition-colors hover:text-teal-500">
              Liên hệ
            </Link>
            <div className="pt-4 border-t border-gray-100 flex flex-col space-y-2">
              {isLoggedIn ? (
                <>
                  {userName && <span className="text-sm font-medium">Xin chào, {userName}</span>}
                  <Link href="/profile" className="w-full">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-teal-500 text-teal-500 hover:bg-teal-50"
                    >
                      Tài khoản
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    className="w-full bg-teal-500 text-white hover:bg-teal-600"
                    onClick={handleLogout}
                  >
                    Đăng xuất
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login" className="w-full">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-teal-500 text-teal-500 hover:bg-teal-50"
                    >
                      Đăng nhập
                    </Button>
                  </Link>
                  <Link href="/register" className="w-full">
                    <Button size="sm" className="w-full bg-teal-500 text-white hover:bg-teal-600">
                      Đăng ký
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
