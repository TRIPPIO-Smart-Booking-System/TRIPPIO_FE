'use client';

import LoginForm from '@/components/auth/LoginForm';
import Link from 'next/link';
import '../auth.css';

export default function LoginPage() {
  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <Link href="/" className="back-home">
            ← Về trang chủ
          </Link>
          <Link href="/" className="logo">
            <span className="logo-text">Trippio</span>
          </Link>
        </div>

        <LoginForm />
      </div>
    </div>
  );
}
