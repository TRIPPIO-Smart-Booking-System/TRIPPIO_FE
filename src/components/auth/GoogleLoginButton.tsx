'use client';

import React, { useState } from 'react';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { showError, showInfo, showSuccess } from '@/lib/toast';
import { useRouter } from 'next/navigation';

interface GoogleTokenPayload {
  email: string;
  name: string;
  picture: string;
  sub: string;
  aud: string;
  exp: number;
  iat: number;
  [key: string]: unknown;
}

export default function GoogleLoginButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      showError('Google login thất bại');
      return;
    }

    setIsLoading(true);
    try {
      // Decode JWT để xem thông tin
      const decoded = jwtDecode<GoogleTokenPayload>(credentialResponse.credential);
      console.log('Google user info:', {
        email: decoded.email,
        name: decoded.name,
        picture: decoded.picture,
      });

      showInfo('Đang xác thực với Google...');

      // Gửi token lên backend để xác thực
      const response = await fetch('/api/auth/google-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: credentialResponse.credential,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        showError(data?.message || 'Xác thực Google thất bại');
        return;
      }

      // Nếu BE trả về accessToken, lưu vào localStorage
      if (data?.accessToken) {
        try {
          localStorage.setItem('accessToken', data.accessToken);
          localStorage.setItem('authToken', data.accessToken);
          if (data.refreshToken) {
            localStorage.setItem('refreshToken', data.refreshToken);
          }
          if (data.user?.id) {
            localStorage.setItem('userId', data.user.id);
          }
          if (data.user?.email) {
            localStorage.setItem('userEmail', data.user.email);
          }
          if (data.user?.roles) {
            localStorage.setItem(
              'roles',
              JSON.stringify(Array.isArray(data.user.roles) ? data.user.roles : [data.user.roles])
            );
          }
        } catch {
          // ignore quota / private mode
        }

        showSuccess('Đăng nhập Google thành công!');

        // Phát event auth:changed để component khác cập nhật state
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('auth:changed'));
        }

        // Điều hướng đến trang phù hợp
        const redirectParam = new URLSearchParams(window.location.search).get('redirect');
        const roles = data.user?.roles || [];
        let target = '/homepage';

        if (Array.isArray(roles)) {
          const rolesStr = roles.map((r) => String(r).toLowerCase());
          if (rolesStr.includes('admin')) target = '/admin';
          else if (rolesStr.includes('staff')) target = '/staff';
        }

        router.replace(redirectParam || target);
        router.refresh();
      } else if (data?.isSuccess) {
        showSuccess('Đăng nhập Google thành công!');
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('auth:changed'));
        }
        const redirectParam = new URLSearchParams(window.location.search).get('redirect');
        router.replace(redirectParam || '/homepage');
        router.refresh();
      } else {
        showError('Không thể hoàn thành đăng nhập');
      }
    } catch (error: unknown) {
      console.error('Google login error:', error);
      const errorMsg =
        error instanceof Error ? error.message : 'Đăng nhập Google thất bại. Vui lòng thử lại.';
      showError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    console.log('Google login failed');
    showError('Đăng nhập Google thất bại. Vui lòng thử lại.');
  };

  return (
    <div className="flex justify-center w-full">
      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={handleGoogleError}
        useOneTap={false}
        text="signin_with"
        locale="vi"
        width="100%"
      />
    </div>
  );
}
