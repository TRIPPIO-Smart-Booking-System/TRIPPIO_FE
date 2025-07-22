'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

export default function ForgotPasswordVerifyCode() {
  const router = useRouter();
  const [showCode, setShowCode] = useState(false);
  const [code, setCode] = useState('');

  const applyHoverStyle = (e: React.MouseEvent<HTMLElement>, underline: boolean) => {
    (e.target as HTMLElement).style.textDecoration = underline ? 'underline' : 'none';
  };

  const applyButtonHoverStyle = (e: React.MouseEvent<HTMLButtonElement>, isHovering: boolean) => {
    (e.target as HTMLButtonElement).style.backgroundColor = isHovering ? '#4a5de0' : '#586ffb';
  };

  const handleVerifyCode = () => {
    if (!code) {
      alert('Vui lòng nhập mã xác minh!');
      return;
    }

    // TODO: Gọi API xác minh mã
    alert('Xác minh thành công!');
    router.push('/forgot-password/ForgotPasswordReset');
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#e6f7f8',
      }}
    >
      <div
        style={{
          maxWidth: '400px',
          width: '100%',
          backgroundColor: '#ffffff',
          padding: '40px',
          borderRadius: '8px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
          textAlign: 'left',
        }}
      >
        <Link
          href="/login"
          style={{
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
            color: '#666',
            fontSize: '0.95rem',
            marginBottom: '20px',
          }}
          onMouseEnter={(e) => applyHoverStyle(e, true)}
          onMouseLeave={(e) => applyHoverStyle(e, false)}
        >
          <span style={{ marginRight: '5px' }}>&lt;</span> Quay lại đăng nhập
        </Link>

        <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '8px', color: '#333' }}>
          Xác minh mã
        </h2>
        <p style={{ fontSize: '0.95rem', color: '#666', marginBottom: '30px' }}>
          Mã xác thực đã được gửi tới email của bạn.
        </p>

        <div style={{ marginBottom: '20px', position: 'relative' }}>
          <label
            style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: 500,
              marginBottom: '5px',
              color: '#333',
            }}
          >
            Nhập mã
          </label>
          <input
            type={showCode ? 'text' : 'password'}
            placeholder="7789BM6X"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #d0d0d0',
              borderRadius: '6px',
              boxSizing: 'border-box',
              paddingRight: '40px',
              fontSize: '1rem',
            }}
          />
          <span
            onClick={() => setShowCode(!showCode)}
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#888',
              cursor: 'pointer',
              fontSize: '1.2rem',
            }}
            aria-label="Toggle code visibility"
          >
            {showCode ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '30px' }}>
          Không nhận được mã?{' '}
          <button
            style={{
              background: 'none',
              border: 'none',
              color: '#fa558f',
              cursor: 'pointer',
              fontFamily: 'inherit',
              padding: 0,
            }}
            onMouseEnter={(e) => applyHoverStyle(e, true)}
            onMouseLeave={(e) => applyHoverStyle(e, false)}
            onClick={() => alert('Đã gửi lại mã')}
          >
            Gửi lại
          </button>
        </p>

        <button
          onClick={handleVerifyCode}
          style={{
            width: '100%',
            backgroundColor: '#586ffb',
            color: '#ffffff',
            padding: '12px',
            border: 'none',
            borderRadius: '6px',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background-color 0.2s ease-in-out',
          }}
          onMouseEnter={(e) => applyButtonHoverStyle(e, true)}
          onMouseLeave={(e) => applyButtonHoverStyle(e, false)}
        >
          Xác minh
        </button>
      </div>
    </div>
  );
}
