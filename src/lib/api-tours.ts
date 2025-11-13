// src/lib/api-tours.ts
export const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://trippio.azurewebsites.net';

/**
 * Tour API types - matches backend
 */
export type ApiTour = {
  id: string;
  title: string;
  destination: string;
  description: string;
  price: number;
  duration: string; // e.g. "3 days 2 nights"
  imageUrl?: string;
  rating?: number;
  reviews?: number;
  highlights?: string[];
  included?: string[];
  itinerary?: {
    day: number;
    title: string;
    description: string;
  }[];
  dateCreated?: string;
  modifiedDate?: string | null;
};

function buildHeaders(withJson = true): Headers {
  const h = new Headers();
  if (withJson) h.set('Content-Type', 'application/json');

  try {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('authToken') || '';
      if (token) h.set('Authorization', `Bearer ${token}`);
    }
  } catch {
    // ignore
  }
  return h;
}

/**
 * Get all tours
 */
export async function apiListTours(): Promise<ApiTour[]> {
  try {
    const res = await fetch(`${API_BASE}/api/Tour`, {
      method: 'GET',
      credentials: 'include',
      headers: buildHeaders(false),
      cache: 'no-store',
    });

    if (!res.ok) {
      console.error(`[apiListTours] HTTP ${res.status}:`, await res.text());
      return [];
    }

    const data = await res.json();
    return Array.isArray(data) ? (data as ApiTour[]) : [];
  } catch (error) {
    console.error('[apiListTours] Error:', error);
    return [];
  }
}

/**
 * Get featured tours (top rated, sorted by rating/reviews)
 */
export async function apiFeaturedTours(limit = 6): Promise<ApiTour[]> {
  try {
    const tours = await apiListTours();
    // Sort by rating descending, then by reviews descending
    return tours
      .sort((a, b) => (b.rating || 0) - (a.rating || 0) || (b.reviews || 0) - (a.reviews || 0))
      .slice(0, limit);
  } catch (error) {
    console.error('[apiFeaturedTours] Error:', error);
    return [];
  }
}

/**
 * Get single tour
 */
export async function apiGetTour(id: string): Promise<ApiTour | null> {
  try {
    const res = await fetch(`${API_BASE}/api/Tour/${id}`, {
      method: 'GET',
      credentials: 'include',
      headers: buildHeaders(false),
      cache: 'no-store',
    });

    if (!res.ok) {
      console.error(`[apiGetTour] HTTP ${res.status}`);
      return null;
    }

    return (await res.json()) as ApiTour;
  } catch (error) {
    console.error('[apiGetTour] Error:', error);
    return null;
  }
}
