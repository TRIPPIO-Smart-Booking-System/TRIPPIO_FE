'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

export default function ForgotPasswordReset() {
  const router = useRouter();
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleResetPassword = () => {
    if (newPassword !== confirmPassword) {
      alert('Mật khẩu không khớp. Vui lòng thử lại!');
      return;
    }

    // Thực hiện gọi API reset mật khẩu tại đây

    alert('Mật khẩu của bạn đã được đặt lại thành công!');
    router.push('/login');
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
        <h2
          style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            marginBottom: '8px',
            color: '#333',
          }}
        >
          Đặt mật khẩu
        </h2>
        <p
          style={{
            fontSize: '0.95rem',
            color: '#666',
            marginBottom: '30px',
          }}
        >
          Mật khẩu trước đó của bạn đã được đặt lại. Vui lòng đặt mật khẩu mới cho tài khoản của
          bạn.
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
            Tạo mật khẩu
          </label>
          <input
            type={showNewPassword ? 'text' : 'password'}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="7789BM6X@#$&_"
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
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#888',
              cursor: 'pointer',
              fontSize: '1.2rem',
            }}
            onClick={() => setShowNewPassword(!showNewPassword)}
            aria-label="Toggle new password visibility"
          >
            {showNewPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        <div style={{ marginBottom: '30px', position: 'relative' }}>
          <label
            style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: 500,
              marginBottom: '5px',
              color: '#333',
            }}
          >
            Nhập lại mật khẩu
          </label>
          <input
            type={showConfirmNewPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="7789BM6X@#$&_"
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
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#888',
              cursor: 'pointer',
              fontSize: '1.2rem',
            }}
            onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
            aria-label="Toggle confirm new password visibility"
          >
            {showConfirmNewPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        <button
          onClick={handleResetPassword}
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
          onMouseEnter={(e) => ((e.target as HTMLButtonElement).style.backgroundColor = '#4a5de0')}
          onMouseLeave={(e) => ((e.target as HTMLButtonElement).style.backgroundColor = '#586ffb')}
        >
          Đặt mật khẩu
        </button>
      </div>
    </div>
  );
}
