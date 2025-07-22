'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { FaFacebook, FaGoogle, FaApple, FaEye, FaEyeSlash } from 'react-icons/fa';
import styles from './Login.module.css';
import SocialButton from '@/Components/Button/SocialButton';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = () => {
    console.log('Login with', email, password);
    // TODO: Add login logic here (API call, etc.)
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>Đăng nhập</h2>
        <p className={styles.subtitle}>Đăng nhập để truy cập tài khoản TRIPPO của bạn</p>

        <div className={styles.field}>
          <label className={styles.label}>Email</label>
          <input
            type="email"
            className={styles.input}
            placeholder="TRIPPO@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className={styles.field} style={{ position: 'relative' }}>
          <label className={styles.label}>Password</label>
          <input
            type={showPassword ? 'text' : 'password'}
            className={`${styles.input} ${styles.inputPassword}`}
            placeholder="•••••••••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <span className={styles.eyeIcon} onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        <div className={styles.checkboxRow}>
          <label className={styles.rememberLabel}>
            <input type="checkbox" style={{ marginRight: '8px' }} />
            Ghi Nhớ
          </label>
          <button
            className={styles.forgotBtn}
            onClick={() => router.push('/forgot-password/ForgotPasswordRequest')}
          >
            Quên mật khẩu
          </button>
        </div>

        <button className={styles.loginBtn} onClick={handleLogin}>
          Đăng nhập
        </button>

        <p className={styles.linkText}>
          Bạn không có tài khoản?{' '}
          <Link href="/register" className={styles.registerLink}>
            Đăng ký
          </Link>
        </p>

        <div className={styles.divider}>
          <hr className={styles.hr} />
          <span className={styles.or}>Hoặc</span>
          <hr className={styles.hr} />
        </div>

        <div className={styles.socialRow}>
          <SocialButton icon={<FaFacebook />} color="#3b82f6" />
          <SocialButton icon={<FaGoogle />} color="#ea4335" />
          <SocialButton icon={<FaApple />} color="#000000" />
        </div>
      </div>
    </div>
  );
}
