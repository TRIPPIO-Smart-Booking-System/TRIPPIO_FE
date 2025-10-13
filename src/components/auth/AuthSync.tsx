// src/components/auth/AuthSync.tsx
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthSync() {
  const router = useRouter();
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'auth:logout') {
        router.replace('/login');
        router.refresh();
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [router]);
  return null;
}
