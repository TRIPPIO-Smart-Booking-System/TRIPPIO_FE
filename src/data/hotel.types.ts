export type ApiRoom = {
  id: string;
  hotelId: string;
  roomType: string;
  pricePerNight: number;
  capacity: number; // tổng số người (adults + children) ngủ tối đa
  availableRooms: number; // số phòng còn trống
  dateCreated: string;
  modifiedDate: string;
  hotel: string; // theo schema (có thể là name), không dùng cũng được
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
  modifiedDate: string;
  rooms: ApiRoom[];
};

/** Tính số đêm từ YYYY-MM-DD */
export function nightsBetween(checkIn: string, checkOut: string) {
  const a = new Date(checkIn);
  const b = new Date(checkOut);
  const ms = b.setHours(0, 0, 0, 0) - a.setHours(0, 0, 0, 0);
  return Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

/** Chọn phòng hợp lệ theo nhu cầu & trả về giá min/đêm của các phòng đủ điều kiện */
export function getMinNightlyPrice(hotel: ApiHotel, totalGuests: number, roomsNeeded: number) {
  // Điều kiện tối thiểu: còn phòng & sức chứa phòng >= tổng khách / số phòng (đơn giản) hoặc >= totalGuests nếu đặt 1 phòng
  // Ở đây làm đơn giản: nhận bất kỳ phòng capacity >= 1, còn phòng > 0; để chặt chẽ hơn có thể tính tổ hợp.
  const eligible = hotel.rooms.filter((r) => r.availableRooms > 0 && r.capacity >= 1);
  if (!eligible.length) return null;
  return Math.min(...eligible.map((r) => r.pricePerNight));
}

/** Lọc theo city (nếu có) */
export function filterByCity(hotels: ApiHotel[], city: string) {
  if (!city) return hotels;
  return hotels.filter((h) => h.city?.toLowerCase() === city.toLowerCase());
}
