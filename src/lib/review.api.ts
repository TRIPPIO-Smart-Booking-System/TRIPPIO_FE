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
  console.log(
    '[apiCreateReview] accessToken from getAuth():',
    accessToken ? '✓ Found' : '✗ Not found'
  );

  const headers = {
    'Content-Type': 'application/json',
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };

  console.log('[apiCreateReview] Headers:', {
    ...headers,
    Authorization: headers['Authorization']
      ? `Bearer ${headers['Authorization'].substring(7, 27)}...`
      : 'None',
  });
  console.log('[apiCreateReview] Request body:', body);

  const r = await fetch(`${API_BASE}/api/review`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
    credentials: 'include',
  });

  if (!r.ok) {
    const msg = await r.text().catch(() => '');
    console.error('[apiCreateReview] HTTP Error:', {
      status: r.status,
      message: msg,
    });
    throw new Error(`Review HTTP ${r.status} ${msg}`);
  }

  const result = await r.json();
  console.log('[apiCreateReview] Success:', result);
  return result;
}

export async function apiUpdateReview(
  reviewId: number | string,
  body: { rating: number; comment?: string }
) {
  console.log('[apiUpdateReview] Starting update for reviewId:', reviewId);
  const { accessToken } = getAuth();
  console.log('[apiUpdateReview] Token available:', accessToken ? '✓' : '✗');
  console.log('[apiUpdateReview] Request body:', body);

  const r = await fetch(`${API_BASE}/api/review/${reviewId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: JSON.stringify(body),
    credentials: 'include',
  });

  console.log('[apiUpdateReview] Response status:', r.status, r.statusText);

  if (!r.ok) {
    const msg = await r.text().catch(() => '');
    console.error('[apiUpdateReview] Error response:', msg);
    throw new Error(`Update review HTTP ${r.status} ${msg}`);
  }

  const result = await r.json();
  console.log('[apiUpdateReview] Success:', result);
  return result;
}

export async function apiDeleteReview(reviewId: number | string) {
  console.log('[apiDeleteReview] Starting delete for reviewId:', reviewId);
  const { accessToken } = getAuth();
  console.log('[apiDeleteReview] Token available:', accessToken ? '✓' : '✗');

  const r = await fetch(`${API_BASE}/api/review/${reviewId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    credentials: 'include',
  });

  console.log('[apiDeleteReview] Response status:', r.status, r.statusText);

  if (!r.ok) {
    const msg = await r.text().catch(() => '');
    console.error('[apiDeleteReview] Error response:', msg);
    throw new Error(`Delete review HTTP ${r.status} ${msg}`);
  }

  const result = await r.json();
  console.log('[apiDeleteReview] Success:', result);
  return result;
}

export async function apiGetReviewsByOrderId(orderId: number | string) {
  console.log('[apiGetReviewsByOrderId] Fetching reviews for orderId:', orderId);
  console.log('[apiGetReviewsByOrderId] API endpoint:', `${API_BASE}/api/review/order/${orderId}`);

  const r = await fetch(`${API_BASE}/api/review/order/${orderId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });

  console.log('[apiGetReviewsByOrderId] Response status:', r.status, r.statusText);

  if (!r.ok) {
    const msg = await r.text().catch(() => '');
    console.error('[apiGetReviewsByOrderId] Error response:', msg);
    throw new Error(`Get reviews HTTP ${r.status} ${msg}`);
  }
  return r.json();
}
