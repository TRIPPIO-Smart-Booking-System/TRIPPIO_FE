'use client';

import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { showError, showSuccess } from '@/lib/toast';
import { useRouter } from 'next/navigation';
import { setAuth, AUTH_EVENT_NAME } from '@/lib/auth';

export default function GoogleLoginButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSuccess = async (idToken: string | undefined) => {
    if (!idToken) {
      console.error('[GoogleLoginButton] ❌ No id_token provided');
      showError('Google login thất bại');
      return;
    }

    setIsLoading(true);
    try {
      console.log('[GoogleLoginButton] ✅ Got id_token from Google, length:', idToken.length);

      // Send id_token to our backend API
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'https://trippiowebapp.azurewebsites.net'}/api/auth/google-verify`;
      console.log('[GoogleLoginButton] 📤 Sending POST to:', apiUrl);
      console.log('[GoogleLoginButton] 📦 Request body:', {
        token: idToken.substring(0, 50) + '...',
      });

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: idToken }),
      });

      console.log('[GoogleLoginButton] 📥 Backend response status:', response.status);
      console.log('[GoogleLoginButton] 📥 Response headers:', {
        contentType: response.headers.get('content-type'),
        cors: response.headers.get('access-control-allow-origin'),
      });

      const data = await response.json();
      console.log('[GoogleLoginButton] 📥 Full response data:', data);
      console.log('[GoogleLoginButton] 📥 Response summary:', {
        isSuccess: data?.isSuccess,
        userEmail: data?.user?.email,
        hasAccessToken: !!data?.accessToken,
        accessTokenLength: data?.accessToken?.length,
        roles: data?.user?.roles,
      });

      if (!response.ok) {
        console.error('[GoogleLoginButton] ❌ Response not OK:', {
          status: response.status,
          message: data?.message,
        });
        showError(data?.message || 'Xác thực Google thất bại');
        return;
      }

      // Nếu BE trả về accessToken, lưu vào auth state
      if (data?.accessToken) {
        console.log('[GoogleLoginButton] ✅ Found accessToken, calling setAuth()...');

        const rolesArray = Array.isArray(data.user?.roles)
          ? data.user.roles
          : [data.user?.roles].filter(Boolean);

        // ✅ Gọi setAuth() thay vì lưu trực tiếp vào localStorage
        setAuth({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          userId: data.user?.id,
          email: data.user?.email,
          userName: data.user?.userName || data.user?.email,
          roles: rolesArray,
        });

        console.log('[GoogleLoginButton] ✅ setAuth() called with:', {
          userId: data.user?.id,
          email: data.user?.email,
          roles: rolesArray,
        });

        showSuccess('Đăng nhập Google thành công!');

        // Fetch full user profile to populate trip_user_map cache
        console.log('[GoogleLoginButton] 📥 Fetching full user profile...');
        try {
          const meUrl = `${process.env.NEXT_PUBLIC_API_URL || 'https://trippiowebapp.azurewebsites.net'}/api/user/me`;
          const meResponse = await fetch(meUrl, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${data.accessToken}`,
            },
          });

          if (meResponse.ok) {
            const userProfile = await meResponse.json();
            console.log('[GoogleLoginButton] ✅ Got full user profile:', userProfile);

            // Cache user profile in trip_user_map
            try {
              const userMapKey = 'trip_user_map';
              const existingMap = JSON.parse(localStorage.getItem(userMapKey) || '{}');
              existingMap[data.user?.id] = userProfile;
              localStorage.setItem(userMapKey, JSON.stringify(existingMap));
              console.log('[GoogleLoginButton] ✅ Cached user profile in trip_user_map');
            } catch (e) {
              console.error('[GoogleLoginButton] ❌ Failed to cache user profile:', e);
            }
          } else {
            console.warn(
              '[GoogleLoginButton] ⚠️ Failed to fetch full user profile:',
              meResponse.status
            );
          }
        } catch (e) {
          console.error('[GoogleLoginButton] ❌ Error fetching user profile:', e);
        }

        const redirectParam = new URLSearchParams(window.location.search).get('redirect');
        let target = '/homepage';
        if (Array.isArray(rolesArray)) {
          const rolesStr = rolesArray.map((r) => String(r).toLowerCase());
          if (rolesStr.includes('admin')) target = '/admin';
          else if (rolesStr.includes('staff')) target = '/staff';
        }

        console.log('[GoogleLoginButton] 🔄 Redirecting to:', target);
        // Use a small delay before redirect to ensure auth state is saved
        setTimeout(() => {
          router.push(redirectParam || target);
        }, 100);
      } else if (data?.isSuccess) {
        console.log('[GoogleLoginButton] ⚠️ isSuccess but no accessToken');
        showSuccess('Đăng nhập Google thành công!');
        const redirectParam = new URLSearchParams(window.location.search).get('redirect');
        setTimeout(() => {
          router.push(redirectParam || '/homepage');
        }, 100);
      } else {
        console.error('[GoogleLoginButton] ❌ No accessToken and isSuccess is false');
        showError('Không thể hoàn thành đăng nhập');
      }
    } catch (error: unknown) {
      console.error('[GoogleLoginButton] ❌ Catch block error:', error);
      console.error('[GoogleLoginButton] ❌ Error type:', typeof error);

      let errorMsg = 'Đăng nhập Google thất bại. Vui lòng thử lại.';

      if (error instanceof Error) {
        errorMsg = error.message;
        console.error('[GoogleLoginButton] ❌ Error message:', errorMsg);
        console.error('[GoogleLoginButton] ❌ Error stack:', error.stack);
      } else if (typeof error === 'object' && error !== null && 'message' in error) {
        errorMsg = String((error as any).message);
      }

      console.error('[GoogleLoginButton] ❌ Final error:', errorMsg);
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
