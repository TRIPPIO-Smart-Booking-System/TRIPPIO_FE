// src/lib/api-hotels.ts
export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'https://trippiowebapp.azurewebsites.net';

export type ApiHotel = {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  description: string;
  stars: number;
  dateCreated: string;
  modifiedDate: string | null;
  rooms?: ApiRoom[];
};

export type ApiRoom = {
  id: string;
  hotelId: string;
  roomType: string;
  pricePerNight: number;
  capacity: number;
  availableRooms: number;
  dateCreated: string;
  modifiedDate: string;
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
 * Get all hotels or filter by city
 */
export async function apiListHotels(city?: string): Promise<ApiHotel[]> {
  const url = new URL(`${API_BASE}/api/Hotel`);
  if (city) url.searchParams.set('city', city);

  const res = await fetch(url.toString(), {
    method: 'GET',
    credentials: 'include',
    headers: buildHeaders(false),
    cache: 'no-store',
  });

  if (!res.ok) {
    console.error(`[apiListHotels] HTTP ${res.status}:`, await res.text());
    return [];
  }

  const data = await res.json();
  return Array.isArray(data) ? (data as ApiHotel[]) : [];
}

/**
 * Get featured hotels (top rated, sorted by stars/reviews)
 */
export async function apiFeaturedHotels(limit = 6): Promise<ApiHotel[]> {
  try {
    const hotels = await apiListHotels();
    // Sort by stars descending, then by name
    return hotels.sort((a, b) => (b.stars || 0) - (a.stars || 0)).slice(0, limit);
  } catch (error) {
    console.error('[apiFeaturedHotels] Error:', error);
    return [];
  }
}

/**
 * Get single hotel with rooms
 */
export async function apiGetHotel(id: string): Promise<ApiHotel | null> {
  const res = await fetch(`${API_BASE}/api/Hotel/${id}`, {
    method: 'GET',
    credentials: 'include',
    headers: buildHeaders(false),
    cache: 'no-store',
  });

  if (!res.ok) {
    console.error(`[apiGetHotel] HTTP ${res.status}`);
    return null;
  }

  return (await res.json()) as ApiHotel;
}
