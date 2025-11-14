// src/lib/review.api.ts
import { getAuth } from '@/lib/auth';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'https://trippiowebapp.azurewebsites.net';

export type CreateReviewReq = {
  orderId: number | string;
  rating: number; // 1..5
  comment?: string;
};

export async function apiCreateReview(body: CreateReviewReq) {
  const { accessToken } = getAuth();

  const headers = {
    'Content-Type': 'application/json',
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };

  const r = await fetch(`${API_BASE}/api/review`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
    credentials: 'include',
  });

  if (!r.ok) {
    const msg = await r.text().catch(() => '');
    throw new Error(`Review HTTP ${r.status} ${msg}`);
  }

  const result = await r.json();
  return result;
}

export async function apiUpdateReview(
  reviewId: number | string,
  body: { rating: number; comment?: string }
) {
  const { accessToken } = getAuth();

  const r = await fetch(`${API_BASE}/api/review/${reviewId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: JSON.stringify(body),
    credentials: 'include',
  });

  if (!r.ok) {
    const msg = await r.text().catch(() => '');
    throw new Error(`Update review HTTP ${r.status} ${msg}`);
  }

  const result = await r.json();
  return result;
}

export async function apiDeleteReview(reviewId: number | string) {
  const { accessToken } = getAuth();

  const r = await fetch(`${API_BASE}/api/review/${reviewId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    credentials: 'include',
  });

  if (!r.ok) {
    const msg = await r.text().catch(() => '');
    throw new Error(`Delete review HTTP ${r.status} ${msg}`);
  }

  const result = await r.json();
  return result;
}

export async function apiGetReviewsByOrderId(orderId: number | string) {
  const r = await fetch(`${API_BASE}/api/review/order/${orderId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });

  if (!r.ok) {
    const msg = await r.text().catch(() => '');
    throw new Error(`Get reviews HTTP ${r.status} ${msg}`);
  }
  return r.json();
}
