'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import './Header.css';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    const checkLoginStatus = () => {
      const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
      const name = localStorage.getItem('profileName') || 'Người dùng';
      setIsLoggedIn(loggedIn);
      setUserName(name);
    };

    checkLoginStatus();
    window.addEventListener('storage', checkLoginStatus);

    return () => {
      window.removeEventListener('storage', checkLoginStatus);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('profileName');
    localStorage.removeItem('userProfile');
    setIsLoggedIn(false);
    setUserName('');
    window.location.href = '/';
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-content">
          {/* Logo - Bên trái với ảnh */}
          <Link href="/" className="logo">
            <Image
              src="/images/logo.png"
              alt="Trippio Logo"
              width={120}
              height={40}
              className="logo-image"
              priority
            />
          </Link>

          {/* Tất cả phần tử bên phải */}
          <div className="header-right">
            {/* Desktop Navigation */}
            <nav className="nav-menu desktop-nav">
              <a href="#support" className="nav-link">
                Hỗ trợ
              </a>
              <a href="#promotions" className="nav-link">
                Khuyến mãi
              </a>
              <a href="#other" className="nav-link">
                Khác
              </a>
            </nav>

            {/* Auth Buttons */}
            <div className="auth-section desktop-auth">
              <div className="auth-buttons">
                {isLoggedIn ? (
                  <div className="user-menu">
                    <span className="welcome-text">Xin chào, {userName}!</span>
                    <Link href="/profile" className="profile-link">
                      Hồ sơ
                    </Link>
                    <button onClick={handleLogout} className="logout-btn">
                      Đăng xuất
                    </button>
                  </div>
                ) : (
                  <>
                    <Link href="/login" className="login-btn">
                      Đăng nhập
                    </Link>
                    <Link href="/register" className="register-btn">
                      Đăng ký
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button className="mobile-menu-btn" onClick={toggleMenu}>
            <span className={`hamburger ${isMenuOpen ? 'active' : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="mobile-menu">
            <nav className="mobile-nav">
              <a href="#support" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
                Hỗ trợ
              </a>
              <a
                href="#promotions"
                className="mobile-nav-link"
                onClick={() => setIsMenuOpen(false)}
              >
                Khuyến mãi
              </a>
              <a href="#other" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
                Khác
              </a>
            </nav>
            <div className="mobile-auth">
              <div className="mobile-auth-buttons">
                {isLoggedIn ? (
                  <div className="mobile-user-menu">
                    <span className="mobile-welcome-text">Xin chào, {userName}!</span>
                    <Link href="/profile" className="mobile-profile-link">
                      Hồ sơ
                    </Link>
                    <button onClick={handleLogout} className="mobile-logout-btn">
                      Đăng xuất
                    </button>
                  </div>
                ) : (
                  <>
                    <Link href="/login" className="mobile-login-btn">
                      Đăng nhập
                    </Link>
                    <Link href="/register" className="mobile-register-btn">
                      Đăng ký
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
