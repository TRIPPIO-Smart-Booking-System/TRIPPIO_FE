'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { JSX, useState } from 'react';
import { FaFacebook, FaGoogle, FaApple } from 'react-icons/fa';

export default function ForgotPasswordRequest() {
  const router = useRouter();
  const [email, setEmail] = useState('');

  const handleSendRequest = () => {
    // Call API here...
    // On success:
    router.push('/forgot-password/ForgotPasswordVerifyCode');
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
        >
          <span style={{ marginRight: '5px' }}>&lt;</span> Quay lại đăng nhập
        </Link>

        <h2
          style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            marginBottom: '8px',
            color: '#333',
          }}
        >
          Quên mật khẩu?
        </h2>
        <p
          style={{
            fontSize: '0.95rem',
            color: '#666',
            marginBottom: '30px',
          }}
        >
          Đừng lo lắng, điều này xảy ra với tất cả chúng ta. Nhập email của bạn bên dưới để khôi
          phục mật khẩu
        </p>

        <div style={{ marginBottom: '20px' }}>
          <label
            style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: 500,
              marginBottom: '5px',
              color: '#333',
            }}
          >
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="TRIPPO@gmail.com"
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #d0d0d0',
              borderRadius: '6px',
              fontSize: '1rem',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <button
          onClick={handleSendRequest}
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
            marginBottom: '25px',
          }}
          onMouseEnter={(e) => ((e.target as HTMLButtonElement).style.backgroundColor = '#4a5de0')}
          onMouseLeave={(e) => ((e.target as HTMLButtonElement).style.backgroundColor = '#586ffb')}
        >
          Gửi
        </button>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '30px',
          }}
        >
          <hr style={{ flexGrow: 1, borderTop: '1px solid #eee' }} />
          <span
            style={{
              margin: '0 15px',
              color: '#888',
              fontSize: '0.875rem',
            }}
          >
            Hoặc
          </span>
          <hr style={{ flexGrow: 1, borderTop: '1px solid #eee' }} />
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: '15px',
          }}
        >
          <SocialIconButton icon={<FaFacebook />} color="#3b82f6" hoverColor="#f0f8ff" />
          <SocialIconButton icon={<FaGoogle />} color="#ea4335" hoverColor="#fff8f8" />
          <SocialIconButton icon={<FaApple />} color="#000000" hoverColor="#f5f5f5" />
        </div>
      </div>
    </div>
  );
}

function SocialIconButton({
  icon,
  color,
  hoverColor,
}: {
  icon: JSX.Element;
  color: string;
  hoverColor: string;
}) {
  return (
    <button
      style={{
        flex: '1',
        border: '1px solid #dae8ff',
        padding: '12px 0',
        borderRadius: '8px',
        backgroundColor: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        fontSize: '1.5rem',
        color,
        transition: 'background-color 0.2s ease-in-out',
      }}
      onMouseEnter={(e) => ((e.target as HTMLButtonElement).style.backgroundColor = hoverColor)}
      onMouseLeave={(e) => ((e.target as HTMLButtonElement).style.backgroundColor = '#fff')}
    >
      {icon}
    </button>
  );
}
