'use client';

import RegisterForm from '@/components/auth/RegisterForm';
import Link from 'next/link';
import '../auth.css';

export default function RegisterPage() {
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

        <RegisterForm />
      </div>
    </div>
  );
}
