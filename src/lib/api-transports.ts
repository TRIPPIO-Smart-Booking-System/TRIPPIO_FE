// src/lib/api-transports.ts
export const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://trippio.azurewebsites.net';

/**
 * Transport & Trip API types - matches backend
 */
export type ApiTransport = {
  id: string;
  transportType: string; // 'bus', 'train', 'flight', etc.
  name: string;
  dateCreated: string;
  modifiedDate: string | null;
};

export type ApiTransportTrip = {
  id: string;
  transportId: string;
  departure: string;
  destination: string;
  departureTime: string; // ISO datetime
  arrivalTime: string; // ISO datetime
  price: number;
  availableSeats: number;
  dateCreated: string;
  modifiedDate: string | null;
  transport?: ApiTransport | null;
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
 * Get all transports
 */
export async function apiListTransports(): Promise<ApiTransport[]> {
  try {
    const res = await fetch(`${API_BASE}/api/Transport`, {
      method: 'GET',
      credentials: 'include',
      headers: buildHeaders(false),
      cache: 'no-store',
    });

    if (!res.ok) {
      console.error(`[apiListTransports] HTTP ${res.status}:`, await res.text());
      return [];
    }

    const data = await res.json();
    return Array.isArray(data) ? (data as ApiTransport[]) : [];
  } catch (error) {
    console.error('[apiListTransports] Error:', error);
    return [];
  }
}

/**
 * Get all transport trips
 */
export async function apiListTransportTrips(): Promise<ApiTransportTrip[]> {
  try {
    const res = await fetch(`${API_BASE}/api/TransportTrip`, {
      method: 'GET',
      credentials: 'include',
      headers: buildHeaders(false),
      cache: 'no-store',
    });

    if (!res.ok) {
      console.error(`[apiListTransportTrips] HTTP ${res.status}:`, await res.text());
      return [];
    }

    const data = await res.json();
    return Array.isArray(data) ? (data as ApiTransportTrip[]) : [];
  } catch (error) {
    console.error('[apiListTransportTrips] Error:', error);
    return [];
  }
}

/**
 * Get featured trips (available, sorted by price/popularity)
 */
export async function apiFeaturedTransportTrips(limit = 6): Promise<ApiTransportTrip[]> {
  try {
    const trips = await apiListTransportTrips();
    // Filter available, sort by availableSeats descending (more available = featured)
    return trips
      .filter((t) => t.availableSeats > 0)
      .sort((a, b) => b.availableSeats - a.availableSeats || a.price - b.price)
      .slice(0, limit);
  } catch (error) {
    console.error('[apiFeaturedTransportTrips] Error:', error);
    return [];
  }
}

/**
 * Get single transport
 */
export async function apiGetTransport(id: string): Promise<ApiTransport | null> {
  try {
    const res = await fetch(`${API_BASE}/api/Transport/${id}`, {
      method: 'GET',
      credentials: 'include',
      headers: buildHeaders(false),
      cache: 'no-store',
    });

    if (!res.ok) {
      console.error(`[apiGetTransport] HTTP ${res.status}`);
      return null;
    }

    return (await res.json()) as ApiTransport;
  } catch (error) {
    console.error('[apiGetTransport] Error:', error);
    return null;
  }
}

/**
 * Get single trip
 */
export async function apiGetTransportTrip(id: string): Promise<ApiTransportTrip | null> {
  try {
    const res = await fetch(`${API_BASE}/api/TransportTrip/${id}`, {
      method: 'GET',
      credentials: 'include',
      headers: buildHeaders(false),
      cache: 'no-store',
    });

    if (!res.ok) {
      console.error(`[apiGetTransportTrip] HTTP ${res.status}`);
      return null;
    }

    return (await res.json()) as ApiTransportTrip;
  } catch (error) {
    console.error('[apiGetTransportTrip] Error:', error);
    return null;
  }
}
