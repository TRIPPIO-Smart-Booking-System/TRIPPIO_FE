// src/lib/review.api.ts
import { getAuth } from '@/lib/auth';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'https://trippio.azurewebsites.net';

export type CreateReviewReq = {
  orderId: number | string;
  rating: number; // 1..5
  comment?: string;
};

export async function apiCreateReview(body: CreateReviewReq) {
  const { accessToken } = getAuth();
  const r = await fetch(`${API_BASE}/api/review`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: JSON.stringify(body),
    credentials: 'include',
  });
  if (!r.ok) {
    const msg = await r.text().catch(() => '');
    throw new Error(`Review HTTP ${r.status} ${msg}`);
  }
  return r.json();
}
