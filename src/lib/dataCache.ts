// lib/dataCache.ts
// Global cache untuk transport, shows, hotels data
// Dipreload setelah user login untuk menghindari lag

export type ApiRoom = {
  id: string;
  hotelId: string;
  roomType: string;
  pricePerNight: number;
  capacity: number;
  availableRooms: number;
  dateCreated: string;
  modifiedDate: string;
  hotel: string;
};

export type ApiTransportTrip = {
  id: string;
  transportId: string;
  departure: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  availableSeats: number;
  dateCreated: string;
  modifiedDate: string | null;
  transport: string | null;
};

export type ApiTransport = {
  id: string;
  transportType: string;
  name: string;
  dateCreated: string;
  modifiedDate: string | null;
  transportTrips?: ApiTransportTrip[];
};

export type ApiShow = {
  description: string;
  id: string;
  name: string;
  location: string;
  city: string;
  startDate: string;
  endDate: string;
  price: number;
  availableTickets: number;
  dateCreated?: string;
  modifiedDate?: string;
};

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
  rooms: ApiRoom[];
};

// Cache store
const cache: {
  transports: ApiTransport[] | null;
  trips: ApiTransportTrip[] | null;
  shows: ApiShow[] | null;
  hotels: ApiHotel[] | null;
  rooms: ApiRoom[] | null;
  loading: boolean;
  error: string | null;
} = {
  transports: null,
  trips: null,
  shows: null,
  hotels: null,
  rooms: null,
  loading: false,
  error: null,
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:7142';

// Fetch all data in parallel
export async function preloadAllData() {
  if (cache.loading) return; // Avoid duplicate requests
  if (cache.transports && cache.trips && cache.shows && cache.hotels && cache.rooms) {
    return; // Already cached
  }

  cache.loading = true;
  cache.error = null;

  try {
    const [resTransports, resTrips, resShows, resHotels, resRooms] = await Promise.all([
      fetch(`${API_BASE}/api/Transport`, { cache: 'no-store' }),
      fetch(`${API_BASE}/api/TransportTrip`, { cache: 'no-store' }),
      fetch(`${API_BASE}/api/Show`, { cache: 'no-store' }),
      fetch(`${API_BASE}/api/Hotel`, { cache: 'no-store' }),
      fetch(`${API_BASE}/api/Room`, { cache: 'no-store' }),
    ]);

    // Check if all requests are OK
    if (!resTransports.ok) throw new Error(`Transport HTTP ${resTransports.status}`);
    if (!resTrips.ok) throw new Error(`TransportTrip HTTP ${resTrips.status}`);
    if (!resShows.ok) throw new Error(`Shows HTTP ${resShows.status}`);
    if (!resHotels.ok) throw new Error(`Hotels HTTP ${resHotels.status}`);
    if (!resRooms.ok) throw new Error(`Rooms HTTP ${resRooms.status}`);

    // Parse JSON
    const [transportsData, tripsData, showsData, hotelsData, roomsData] = await Promise.all([
      resTransports.json(),
      resTrips.json(),
      resShows.json(),
      resHotels.json(),
      resRooms.json(),
    ]);

    // Process rooms data
    const roomsArray: ApiRoom[] = Array.isArray(roomsData) ? roomsData : [];
    const mapRooms = new Map<string, ApiRoom[]>();
    for (const r of roomsArray) {
      if (!r?.hotelId) continue;
      const bucket = mapRooms.get(r.hotelId) ?? [];
      bucket.push(r);
      mapRooms.set(r.hotelId, bucket);
    }
    // Sort rooms by price
    for (const arr of mapRooms.values()) {
      arr.sort((a, b) => (a.pricePerNight ?? 0) - (b.pricePerNight ?? 0));
    }

    // Attach rooms to hotels
    let hotelsArray: ApiHotel[] = Array.isArray(hotelsData) ? hotelsData : [];
    hotelsArray = hotelsArray.map((h) => ({
      ...h,
      rooms: mapRooms.get(h.id) ?? [],
    }));

    // Update cache
    cache.transports = Array.isArray(transportsData) ? transportsData : [];
    cache.trips = Array.isArray(tripsData) ? tripsData : [];
    cache.shows = Array.isArray(showsData) ? showsData : [];
    cache.hotels = hotelsArray;
    cache.rooms = roomsArray;
  } catch (e: unknown) {
    cache.error = e instanceof Error ? e.message : 'Failed to preload data';
    console.error('Data preload error:', cache.error);
  } finally {
    cache.loading = false;
  }
}

// Get cached data
export function getCachedTransports() {
  return cache.transports;
}

export function getCachedTrips() {
  return cache.trips;
}

export function getCachedShows() {
  return cache.shows;
}

export function getCachedHotels() {
  return cache.hotels;
}

export function getCacheStatus() {
  return {
    loading: cache.loading,
    error: cache.error,
    isCached: !!(cache.transports && cache.trips && cache.shows && cache.hotels && cache.rooms),
  };
}

// Clear cache if needed
export function clearCache() {
  cache.transports = null;
  cache.trips = null;
  cache.shows = null;
  cache.hotels = null;
  cache.rooms = null;
  cache.error = null;
}
