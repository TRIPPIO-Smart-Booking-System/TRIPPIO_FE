// src/data/transport.api.ts
export type ApiTransport = {
  id: string;
  transportType: string;
  name: string;
  dateCreated: string;
  modifiedDate: string | null;
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
  transport?: ApiTransport | null;
};

export type CreateTransportTripDto = {
  departure: string;
  destination: string;
  departureTime: string; // ISO
  arrivalTime: string; // ISO
  price: number;
  availableSeats: number;
};

// src/data/transport.api.ts
const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:7142';

export async function apiCreateTransportTrip(
  transportId: string,
  dto: CreateTransportTripDto,
  token?: string
): Promise<ApiTransportTrip> {
  const res = await fetch(`${API_BASE}/api/TransportTrip`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      transportId,
      transport: { id: transportId }, // 🔴 BẮT BUỘC cho BE của bạn
      ...dto,
    }),
    credentials: 'include',
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json();
}
