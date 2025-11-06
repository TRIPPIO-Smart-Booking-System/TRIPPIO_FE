import { mockHotel } from './hotel.mock';

const nightsBetween = (checkIn: string, checkOut: string) => {
  const a = new Date(checkIn);
  const b = new Date(checkOut);
  return Math.max(1, Math.round((b.getTime() - a.getTime()) / 86400000));
};

export function getAvailability(params: {
  checkIn: string;
  checkOut: string;
  adults: number;
  children?: number;
}): RoomOffer[] {
  const nights = nightsBetween(params.checkIn, params.checkOut);

  const weekdayMultiplier = (() => {
    const ci = new Date(params.checkIn).getDay(); // 0..6
    const co = new Date(params.checkOut).getDay();
    const hasWeekend = [5, 6].some((d) => d === ci || d === co); // Fri/Sat
    return hasWeekend ? 1.1 : 1.0;
  })();

  return mockHotel.room_types.map((rt) => {
    const base =
      rt.id === 'rt-deluxe-seaview'
        ? 1_600_000
        : rt.id === 'rt-family-suite'
          ? 2_400_000
          : 1_100_000;

    const price_per_night = Math.round(base * weekdayMultiplier);
    const total = price_per_night * nights;

    const offer: RoomOffer = {
      room_type_id: rt.id,
      breakfast: rt.id !== 'rt-superior-garden',
      free_cancel_until: new Date(new Date(params.checkIn).getTime() - 3 * 86400000)
        .toISOString()
        .slice(0, 10),
      pay_at_hotel: rt.id === 'rt-superior-garden',
      price_per_night,
      nights,
      total,
    };
    return offer;
  });
}
