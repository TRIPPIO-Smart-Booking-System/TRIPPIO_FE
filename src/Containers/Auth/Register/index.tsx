'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { JSX } from 'react';
import { FaFacebook, FaGoogle, FaApple, FaEye, FaEyeSlash } from 'react-icons/fa';
import SocialButton from '../../../Components/Button/SocialButton';

export default function Register() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Đăng ký</h2>
        <p style={styles.subtitle}>
          Chúng tôi sẽ thiết lập tất cả để bạn có thể truy cập vào tài khoản cá nhân của mình
        </p>

        <div style={styles.grid}>
          <FormGroup label="Tên" placeholder="TRIPPO" />
          <FormGroup label="Họ" placeholder="TRIPPO" />
          <FormGroup label="Email" type="email" placeholder="trippo@gmail.com" />
          <FormGroup label="Số Điện Thoại" type="tel" placeholder="0123456789" />
          <FormGroup
            label="Mật khẩu"
            type={showPassword ? 'text' : 'password'}
            placeholder="•••••••••"
            icon={showPassword ? <FaEyeSlash /> : <FaEye />}
            onIconClick={() => setShowPassword(!showPassword)}
          />
          <FormGroup
            label="Xác nhận mật khẩu"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="•••••••••"
            icon={showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            onIconClick={() => setShowConfirmPassword(!showConfirmPassword)}
          />
        </div>

        {/* Terms Checkbox */}
        <div style={{ marginBottom: '30px' }}>
          <label style={styles.checkboxLabel}>
            <input type="checkbox" style={styles.checkbox} />
            <span>
              Khi đăng nhập, tôi đồng ý với các{' '}
              <a href="#" style={styles.linkHover}>
                Điều khoản sử dụng
              </a>{' '}
              và{' '}
              <a href="#" style={styles.linkHover}>
                Chính sách bảo mật
              </a>{' '}
              của Trippo
            </span>
          </label>
        </div>

        <button
          style={styles.registerBtn}
          onMouseEnter={(e) => ((e.target as HTMLButtonElement).style.backgroundColor = '#4a5de0')}
          onMouseLeave={(e) => ((e.target as HTMLButtonElement).style.backgroundColor = '#586ffb')}
        >
          Tạo tài khoản
        </button>

        <p style={styles.bottomText}>
          Đã có tài khoản?{' '}
          <Link href="/login" style={{ color: '#333', fontWeight: 500 }}>
            Đăng nhập
          </Link>
        </p>

        <div style={styles.divider}>
          <hr style={styles.hr} />
          <span style={styles.or}>Hoặc</span>
          <hr style={styles.hr} />
        </div>

        <div style={styles.socialRow}>
          <SocialButton icon={<FaFacebook />} color="#3b82f6" />
          <SocialButton icon={<FaGoogle />} color="#ea4335" />
          <SocialButton icon={<FaApple />} color="#000000" />
        </div>
      </div>
    </div>
  );
}

function FormGroup({
  label,
  type = 'text',
  placeholder,
  icon,
  onIconClick,
}: {
  label: string;
  type?: string;
  placeholder?: string;
  icon?: JSX.Element;
  onIconClick?: () => void;
}) {
  return (
    <div style={{ position: 'relative' as const }}>
      <label style={styles.label}>{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        style={{ ...styles.input, paddingRight: icon ? '40px' : undefined }}
      />
      {icon && (
        <span style={styles.eyeIcon} onClick={onIconClick}>
          {icon}
        </span>
      )}
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#fff',
  },
  card: {
    maxWidth: '600px',
    width: '100%',
    backgroundColor: '#e6f7f8',
    padding: '40px',
    borderRadius: '8px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
    textAlign: 'left' as const,
  },
  title: {
    fontSize: '2rem',
    fontWeight: 'bold',
    marginBottom: '8px',
    color: '#333',
  },
  subtitle: {
    fontSize: '0.95rem',
    color: '#666',
    marginBottom: '30px',
  },
  label: {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: 500,
    marginBottom: '5px',
    color: '#333',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #d0d0d0',
    borderRadius: '6px',
    boxSizing: 'border-box' as const,
    fontSize: '1rem',
    marginBottom: '20px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
    marginBottom: '20px',
  },
  eyeIcon: {
    position: 'absolute' as const,
    right: '12px',
    top: '50%',
    transform: 'translateY(5px)',
    color: '#888',
    cursor: 'pointer',
    fontSize: '1.2rem',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '0.875rem',
    gap: '10px',
  },
  checkbox: {
    width: '16px',
    height: '16px',
    accentColor: '#586ffb',
    borderRadius: '3px',
  },
  linkHover: {
    color: '#586ffb',
    textDecoration: 'none',
  },
  registerBtn: {
    width: '100%',
    backgroundColor: '#586ffb',
    color: '#fff',
    padding: '12px',
    border: 'none',
    borderRadius: '6px',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    marginBottom: '25px',
  },
  bottomText: {
    fontSize: '0.9rem',
    color: '#666',
    marginBottom: '30px',
    textAlign: 'center' as const,
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '30px',
  },
  hr: {
    flexGrow: 1,
    borderTop: '1px solid #eee',
  },
  or: {
    margin: '0 15px',
    color: '#888',
    fontSize: '0.875rem',
  },
  socialRow: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '15px',
  },
} as const;
