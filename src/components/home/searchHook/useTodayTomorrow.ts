'use client';
import { useMemo } from 'react';

export function useTodayTomorrow() {
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const tomorrow = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  }, []);
  return { today, tomorrow };
}
