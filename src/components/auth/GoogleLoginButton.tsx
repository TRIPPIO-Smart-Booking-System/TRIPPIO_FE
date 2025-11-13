'use client';

import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { showError, showSuccess } from '@/lib/toast';
import { useRouter } from 'next/navigation';

export default function GoogleLoginButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSuccess = async (idToken: string | undefined) => {
    if (!idToken) {
      console.error('[GoogleLoginButton] No id_token provided');
      showError('Google login thất bại');
      return;
    }

    setIsLoading(true);
    try {
      console.log('[GoogleLoginButton] Got id_token from Google');

      // Send id_token to our backend API
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'https://trippiowebapp.azurewebsites.net'}/api/auth/google-verify`;
      console.log('[GoogleLoginButton] Sending id_token to backend:', apiUrl);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: idToken }),
      });

      console.log('[GoogleLoginButton] Backend response status:', response.status);
      const data = await response.json();
      console.log('[GoogleLoginButton] Backend response data:', {
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

  return (
    <div className="flex justify-center w-full">
      <div className="w-full max-w-sm">
        <GoogleLogin
          onSuccess={(credentialResponse) => {
            console.log('[GoogleLoginButton] GoogleLogin onSuccess called');
            console.log(
              '[GoogleLoginButton] Credential response keys:',
              Object.keys(credentialResponse)
            );

            const idToken = credentialResponse?.credential;
            if (!idToken) {
              console.error('[GoogleLoginButton] No credential (id_token) in response');
              showError('Không nhận được token từ Google');
              return;
            }

            console.log('[GoogleLoginButton] Got credential, calling handleGoogleSuccess');
            handleGoogleSuccess(idToken);
          }}
          onError={() => {
            console.error('[GoogleLoginButton] Google Login onError called');
            showError('Đăng nhập Google thất bại. Vui lòng thử lại.');
          }}
          text="signin"
          width="100%"
        />
      </div>
    </div>
  );
}
