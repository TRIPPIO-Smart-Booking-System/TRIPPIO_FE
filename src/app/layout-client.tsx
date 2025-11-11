'use client';

import { useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { preloadAllData } from '@/lib/dataCache';

export default function RootLayoutClient({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Preload all data after component mounts (user is authenticated)
    preloadAllData();
  }, []);

  return (
    <>
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
    </>
  );
}
