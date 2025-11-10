import { getAuth } from './auth';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:7142';

function authHeaders(): HeadersInit {
  const { accessToken } = getAuth();
  return {
    'Content-Type': 'application/json',
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };
}

export type Hotel = {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  description: string;
  stars: number;
};

export type Room = {
  id: string;
  hotelId: string;
  roomType: string;
  capacity: number;
  pricePerNight: number;
  availableRooms: number;
};

export type Show = {
  id: string;
  name: string;
  location: string;
  city: string;
  startDate: string;
  endDate: string;
  price: number;
  availableTickets: number;
};

export type Transport = {
  id: string;
  name: string;
  type: string;
};

export type TransportTrip = {
  id: string;
  transportId: string;
  departureCity: string;
  arrivalCity: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  availableSeats: number;
};

/**
 * Fetch all hotels from Trippio API
 */
export async function getHotels(): Promise<Hotel[]> {
  try {
    const res = await fetch(`${API_BASE}/api/Hotel`, {
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as Hotel[];
  } catch (e) {
    console.error('Failed to fetch hotels:', e);
    return [];
  }
}

/**
 * Fetch all rooms from Trippio API
 */
export async function getRooms(): Promise<Room[]> {
  try {
    const res = await fetch(`${API_BASE}/api/Room`, {
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as Room[];
  } catch (e) {
    console.error('Failed to fetch rooms:', e);
    return [];
  }
}

/**
 * Fetch all shows/attractions from Trippio API
 */
export async function getShows(): Promise<Show[]> {
  try {
    const res = await fetch(`${API_BASE}/api/Show`, {
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as Show[];
  } catch (e) {
    console.error('Failed to fetch shows:', e);
    return [];
  }
}

/**
 * Fetch all transport types from Trippio API
 */
export async function getTransports(): Promise<Transport[]> {
  try {
    const res = await fetch(`${API_BASE}/api/Transport`, {
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as Transport[];
  } catch (e) {
    console.error('Failed to fetch transports:', e);
    return [];
  }
}

/**
 * Fetch all available transport trips from Trippio API
 */
export async function getTransportTrips(): Promise<TransportTrip[]> {
  try {
    const res = await fetch(`${API_BASE}/api/TransportTrip/available`, {
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as TransportTrip[];
  } catch (e) {
    console.error('Failed to fetch transport trips:', e);
    return [];
  }
}

/**
 * Build recommendations based on travel data
 */
export function buildTravelRecommendations(
  hotels: Hotel[],
  shows: Show[],
  transportTrips: TransportTrip[],
  keyword: string
): string {
  let recommendations = '';

  // Filter hotels by keyword
  const matchingHotels = hotels.filter(
    (h) =>
      h.name.toLowerCase().includes(keyword.toLowerCase()) ||
      h.city.toLowerCase().includes(keyword.toLowerCase()) ||
      h.description?.toLowerCase().includes(keyword.toLowerCase())
  );

  if (matchingHotels.length > 0) {
    recommendations += '🏨 **Khách sạn gợi ý:**\n';
    matchingHotels.slice(0, 3).forEach((h) => {
      recommendations += `- **${h.name}** (${h.stars}⭐) - ${h.city}\n  💰 Từ ${h.address}\n`;
    });
    recommendations += '\n';
  }

  // Filter shows by keyword
  const matchingShows = shows.filter(
    (s) =>
      s.name.toLowerCase().includes(keyword.toLowerCase()) ||
      s.location.toLowerCase().includes(keyword.toLowerCase()) ||
      s.city.toLowerCase().includes(keyword.toLowerCase())
  );

  if (matchingShows.length > 0) {
    recommendations += '🎭 **Khu vui chơi & Sự kiện:**\n';
    matchingShows.slice(0, 3).forEach((s) => {
      recommendations += `- **${s.name}** - ${s.location}, ${s.city}\n  📅 ${new Date(s.startDate).toLocaleDateString('vi-VN')} - ${new Date(s.endDate).toLocaleDateString('vi-VN')}\n  💵 Vé: ${s.price.toLocaleString('vi-VN')} VND\n`;
    });
    recommendations += '\n';
  }

  // Filter transport trips by keyword
  const matchingTrips = transportTrips.filter(
    (t) =>
      t.departureCity.toLowerCase().includes(keyword.toLowerCase()) ||
      t.arrivalCity.toLowerCase().includes(keyword.toLowerCase())
  );

  if (matchingTrips.length > 0) {
    recommendations += '✈️ **Chuyến di chuyển:**\n';
    matchingTrips.slice(0, 3).forEach((t) => {
      recommendations += `- ${t.departureCity} → ${t.arrivalCity}\n  🕐 ${new Date(t.departureTime).toLocaleTimeString('vi-VN')} - ${new Date(t.arrivalTime).toLocaleTimeString('vi-VN')}\n  💵 ${t.price.toLocaleString('vi-VN')} VND\n`;
    });
  }

  return recommendations || 'Không tìm thấy dữ liệu phù hợp. Hãy thử từ khóa khác nhé! 😊';
}
