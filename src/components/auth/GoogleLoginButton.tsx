'use client';

import React, { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { showError, showInfo, showSuccess } from '@/lib/toast';
import { useRouter } from 'next/navigation';

export default function GoogleLoginButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSuccess = async (authCode: string | undefined) => {
    if (!authCode) {
      showError('Google login thất bại');
      return;
    }

    setIsLoading(true);
    try {
      console.log('[GoogleLoginButton] Starting login with authorization code');
      showInfo('Đang xác thực với Google...');

      // Send authorization code to our backend API
      // Backend will exchange code for tokens with Google
      console.log('[GoogleLoginButton] Sending authorization code to /api/auth/google-verify');
      const response = await fetch('/api/auth/google-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: authCode }),
      });

      console.log('[GoogleLoginButton] Backend response status:', response.status);
      const data = await response.json();
      console.log('[GoogleLoginButton] Backend response:', {
        isSuccess: data?.isSuccess,
        userEmail: data?.user?.email,
        hasAccessToken: !!data?.accessToken,
      });

      if (!response.ok) {
        showError(data?.message || 'Xác thực Google thất bại');
        return;
      }

      // Nếu BE trả về accessToken, lưu vào localStorage
      if (data?.accessToken) {
        try {
          localStorage.setItem('accessToken', data.accessToken);
          localStorage.setItem('authToken', data.accessToken);
          if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
          if (data.user?.id) localStorage.setItem('userId', data.user.id);
          if (data.user?.email) localStorage.setItem('userEmail', data.user.email);
          if (data.user?.roles)
            localStorage.setItem(
              'roles',
              JSON.stringify(Array.isArray(data.user.roles) ? data.user.roles : [data.user.roles])
            );
        } catch {
          // ignore
        }

        showSuccess('Đăng nhập Google thành công!');

        // Dispatch auth:changed event for layout to detect login
        window.dispatchEvent(new Event('auth:changed'));

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
        window.dispatchEvent(new Event('auth:changed'));
        const redirectParam = new URLSearchParams(window.location.search).get('redirect');
        router.replace(redirectParam || '/homepage');
        router.refresh();
      } else {
        showError('Không thể hoàn thành đăng nhập');
      }
    } catch (error: unknown) {
      console.error('[GoogleLoginButton] Catch block - error:', error);
      console.error('[GoogleLoginButton] Error type:', typeof error);
      console.error(
        '[GoogleLoginButton] Error keys:',
        error instanceof Error ? Object.keys(error) : 'N/A'
      );

      let errorMsg = 'Đăng nhập Google thất bại. Vui lòng thử lại.';

      if (error instanceof Error) {
        errorMsg = error.message;
        console.error('[GoogleLoginButton] Error message:', errorMsg);
      } else if (typeof error === 'object' && error !== null && 'message' in error) {
        errorMsg = String((error as any).message);
      }

      console.error('[GoogleLoginButton] Final error message:', errorMsg);
      showError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const login = useGoogleLogin({
    onSuccess: async (response) => {
      console.log('[GoogleLoginButton] Google response:', response);

      // auth-code flow returns code (authorization code)
      const code = (response as any).code;

      if (!code) {
        console.error('[GoogleLoginButton] No authorization code in response');
        showError('Không nhận được code từ Google');
        return;
      }

      console.log('[GoogleLoginButton] Got authorization code, sending to backend...');
      // Send code to backend, backend will exchange for tokens
      handleGoogleSuccess(code);
    },
    onError: (errorResp: any) => {
      console.error('[GoogleLoginButton] Google OAuth error:', errorResp);
      showError('Đăng nhập Google thất bại. Vui lòng thử lại.');
    },
    flow: 'auth-code',
    scope: 'openid email profile',
  });

  return (
    <div className="flex justify-center w-full">
      <button
        type="button"
        onClick={() => login()}
        disabled={isLoading}
        className="inline-flex items-center gap-3 rounded-full bg-white px-5 py-2 shadow-lg ring-1 ring-neutral-200 hover:shadow-xl hover:scale-105 transition-transform duration-150 focus:outline-none focus:ring-2 focus:ring-sky-400 disabled:opacity-60"
      >
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm">
          {/* Google G Icon */}
          <svg className="h-5 w-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path
              fill="#4285F4"
              d="M22.5 12.24c0-.82-.07-1.61-.21-2.37H12v4.48h5.86c-.25 1.37-1 2.53-2.13 3.31v2.75h3.44c2.02-1.86 3.18-4.6 3.18-7.97z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.47-.98 7.29-2.66l-3.44-2.75c-.96.64-2.2 1.02-3.85 1.02-2.96 0-5.47-2-6.36-4.66H2.06v2.92C3.84 20.8 7.66 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.64 14.95a7.54 7.54 0 010-4.9V7.13H2.06a11 11 0 000 9.74l3.58-1.92z"
            />
            <path
              fill="#EA4335"
              d="M12 4.5c1.6 0 3.03.55 4.16 1.62l3.11-3.11C17.46 1.37 14.97 0 12 0 7.66 0 3.84 2.2 2.06 5.13l3.58 2.92C6.53 6.5 9.04 4.5 12 4.5z"
            />
          </svg>
        </span>
        <span className="text-sm font-medium text-neutral-700">Đăng nhập với Google</span>
        {isLoading && (
          <svg className="ml-2 h-4 w-4 animate-spin text-neutral-600" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
        )}
      </button>
    </div>
  );
}
