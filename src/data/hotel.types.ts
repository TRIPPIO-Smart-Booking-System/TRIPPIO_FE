// types.ts
export type ApiRoom = {
  id: string;
  hotelId: string;
  roomType: string;
  pricePerNight: number;
  capacity: number; // tổng khách tối đa / phòng
  availableRooms: number; // số phòng còn trống
  dateCreated: string;
  modifiedDate: string;
  hotel: string; // không dùng cũng được
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

/** Tính số đêm từ YYYY-MM-DD (DST-safe bằng UTC) */
export function nightsBetween(checkIn: string, checkOut: string) {
  const [y1, m1, d1] = checkIn.split('-').map(Number);
  const [y2, m2, d2] = checkOut.split('-').map(Number);
  const a = Date.UTC(y1, (m1 ?? 1) - 1, d1 ?? 1);
  const b = Date.UTC(y2, (m2 ?? 1) - 1, d2 ?? 1);
  return Math.max(1, Math.round((b - a) / 86_400_000));
}

/** Lọc theo city (case-insensitive) */
export function filterByCity(hotels: ApiHotel[], city: string) {
  if (!city) return hotels;
  const wanted = city.trim().toLowerCase();
  return hotels.filter((h) => (h.city ?? '').trim().toLowerCase() === wanted);
}

/** Giá min/đêm theo nhu cầu (tổng khách + số phòng cần) */
export function getMinNightlyPriceByNeed(
  hotel: ApiHotel,
  totalGuests: number,
  roomsNeeded: number
): number | null {
  // Phòng hợp lệ: còn >= roomsNeeded & tổng sức chứa đủ
  const ok = hotel.rooms.filter(
    (r) => r.availableRooms >= roomsNeeded && r.capacity * roomsNeeded >= totalGuests
  );
  return ok.length ? Math.min(...ok.map((r) => r.pricePerNight)) : null;
}
