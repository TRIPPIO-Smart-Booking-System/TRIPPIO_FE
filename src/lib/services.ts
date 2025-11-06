export type ServiceKind = 'Transport' | 'TransporTrip' | 'HotelRoom';

export type BaseService = {
  id: string;
  kind: ServiceKind;
  name: string;
  createdAt: string; // ISO
};

export type Transport = BaseService & {
  kind: 'Transport';
  origin: string;
  destination: string;
  pricePerSeat: number;
  seatsTotal: number;
  seatsBooked: number;
  date: string; // ISO
};

export type TransporTrip = BaseService & {
  kind: 'TransporTrip';
  route: string;
  startDate: string; // ISO
  endDate: string; // ISO
  pax: number;
  pricePerPax: number;
};

export type HotelRoom = BaseService & {
  kind: 'HotelRoom';
  hotelName: string;
  city: string;
  roomType: string;
  pricePerNight: number;
  nightsBooked: number;
};

export type ServiceItem = Transport | TransporTrip | HotelRoom;

const KEY = 'TRIPPIO_SERVICES';

export function loadLocalServices(): ServiceItem[] {
  try {
    const s = localStorage.getItem(KEY);
    if (!s) return seedLocalServices();
    return JSON.parse(s) as ServiceItem[];
  } catch {
    return seedLocalServices();
  }
}
export function saveLocalServices(rows: ServiceItem[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(rows));
  } catch {}
}
export function addLocalService(item: ServiceItem) {
  const rows = loadLocalServices();
  rows.unshift(item);
  saveLocalServices(rows);
}

function rand(arr: string[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function r(min: number, max: number) {
  return Math.floor(min + Math.random() * (max - min + 1));
}
function nowIso(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString();
}
function seedLocalServices(): ServiceItem[] {
  const cities = ['Hanoi', 'Saigon', 'Danang', 'Nha Trang', 'Hue'];
  const routes = ['HN–HP', 'HN–QN', 'HCM–VT', 'HCM–DL', 'DN–NT'];
  const roomTypes = ['Superior', 'Deluxe', 'Suite', 'Family', 'Twin'];

  const out: ServiceItem[] = [];

  // Transports (chuyến lẻ)
  for (let i = 0; i < 8; i++) {
    out.push({
      id: `TRS${Date.now()}${i}`,
      kind: 'Transport',
      name: `Transport ${i + 1}`,
      createdAt: nowIso(-r(1, 60)),
      origin: rand(cities),
      destination: rand(cities.filter((c) => c !== cities[i % cities.length])),
      pricePerSeat: r(120_000, 450_000),
      seatsTotal: r(20, 48),
      seatsBooked: r(5, 45),
      date: nowIso(-r(1, 30)),
    });
  }

  // TransporTrips (tour)
  for (let i = 0; i < 6; i++) {
    const start = new Date();
    start.setDate(start.getDate() - r(5, 80));
    const end = new Date(start);
    end.setDate(start.getDate() + r(2, 6));
    out.push({
      id: `TTP${Date.now()}${i}`,
      kind: 'TransporTrip',
      name: `Trip ${i + 1}`,
      createdAt: nowIso(-r(1, 80)),
      route: rand(routes),
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      pax: r(8, 36),
      pricePerPax: r(700_000, 2_400_000),
    });
  }

  // Hotel rooms
  for (let i = 0; i < 10; i++) {
    out.push({
      id: `HRM${Date.now()}${i}`,
      kind: 'HotelRoom',
      name: `Room ${i + 1}`,
      createdAt: nowIso(-r(1, 90)),
      hotelName: `Hotel ${rand(['Aurora', 'Vista', 'Lumen', 'Bamboo', 'Ocean'])}`,
      city: rand(cities),
      roomType: rand(roomTypes),
      pricePerNight: r(350_000, 2_100_000),
      nightsBooked: r(1, 14),
    });
  }

  saveLocalServices(out);
  return out;
}

// helpers
export const moneyVND = (n: number) =>
  n.toLocaleString('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 });
