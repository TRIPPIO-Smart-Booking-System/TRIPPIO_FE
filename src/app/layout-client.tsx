'use client';

import { useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { preloadAllData } from '@/lib/dataCache';

export default function RootLayoutClient({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Suppress hydration mismatch warnings for browser extension attributes
    const originalError = console.error;
    console.error = (...args: any[]) => {
      // Suppress hydration mismatch warnings
      if (
        args[0]?.includes?.('hydrated but some attributes') ||
        args[0]?.includes?.('cz-shortcut-listen') ||
        args[0]?.includes?.('A tree hydrated')
      ) {
        return;
      }
      originalError(...args);
    };

    // Preload all data after component mounts
    preloadAllData();

    return () => {
      console.error = originalError;
    };
  }, []);

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''}>
      {children}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </GoogleOAuthProvider>
  );
}
