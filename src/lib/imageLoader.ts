// Image loader - strictly follows /public/images structure
// No CSV or random data - only sequential image files

export type ImageData = {
  src: string;
  name: string;
};

/**
 * HOTEL IMAGES (hotel1-8)
 * Sequential order: hotel1 → hotel2 → ... → hotel8 → repeat
 * Each hotel card gets one image in sequence
 */
const HOTEL_IMAGES = [
  { ext: 'jpg', num: 1 },
  { ext: 'jpg', num: 2 },
  { ext: 'webp', num: 3 },
  { ext: 'webp', num: 4 },
  { ext: 'webp', num: 5 },
  { ext: 'webp', num: 6 },
  { ext: 'webp', num: 7 },
  { ext: 'jpg', num: 8 },
];

export function getHotelImageByIndex(index: number): string {
  const cycledIndex = index % HOTEL_IMAGES.length;
  const img = HOTEL_IMAGES[cycledIndex];
  return `/images/hotel/hotel${img.num}.${img.ext}`;
}

/**
 * ROOM IMAGES (room1-7)
 * Each room gets 3 consecutive images from the list
 * Room 1: room1, room2, room3
 * Room 2: room4, room5, room6
 * Room 3: room7, room1, room2 (wrap around)
 * etc.
 */
const ROOM_IMAGES = [
  { name: 'room1', ext: 'jpg' },
  { name: 'room2', ext: 'jpg' },
  { name: 'room3', ext: 'jpg' },
  { name: 'room4', ext: 'jpg' },
  { name: 'room5', ext: 'webp' },
  { name: 'room6', ext: 'webp' },
  { name: 'room7', ext: 'jpg' },
];

export function getRoomImages(roomIndex: number): string[] {
  const startIndex = (roomIndex * 3) % ROOM_IMAGES.length;
  const images: string[] = [];

  for (let i = 0; i < 3; i++) {
    const cycledIndex = (startIndex + i) % ROOM_IMAGES.length;
    const room = ROOM_IMAGES[cycledIndex];
    images.push(`/images/roomhotel/${room.name}.${room.ext}`);
  }

  return images;
}

/**
 * SHOW IMAGES (show1-6)
 * Sequential order: show1 → show2 → ... → show6 → repeat
 */
const SHOW_IMAGES = [
  { name: 'show1', ext: 'webp' },
  { name: 'show2', ext: 'jpg' },
  { name: 'show3', ext: 'webp' },
  { name: 'show4', ext: 'webp' },
  { name: 'show5', ext: 'webp' },
  { name: 'show6', ext: 'jpg' },
];

export function getShowImageByIndex(index: number): string {
  const cycledIndex = index % SHOW_IMAGES.length;
  const img = SHOW_IMAGES[cycledIndex];
  return `/images/show/${img.name}.${img.ext}`;
}

/**
 * TRANSPORT IMAGES
 * transport-header.webp: main banner
 * train.webp: for train transport type
 * flight.webp: for flight/airline transport type
 * bus.webp: for bus transport type
 */
export function getTransportHeaderImage(): string {
  return '/images/transport/transport-header.webp';
}

export function getTransportImageByType(type: string): string {
  const normalized = type.toLowerCase().trim();

  if (normalized.includes('train')) {
    return '/images/transport/train.webp';
  }
  if (
    normalized.includes('flight') ||
    normalized.includes('airline') ||
    normalized.includes('air')
  ) {
    return '/images/transport/flight.webp';
  }
  if (normalized.includes('bus')) {
    return '/images/transport/bus.webp';
  }

  // Default to header
  return '/images/transport/transport-header.webp';
}

/**
 * DESTINATION IMAGES (static)
 * Used for destination pages like Đà Lạt, Hạ Long, Hội An
 */
export function getDestinationImage(destination: string): string {
  const normalized = destination.toLowerCase().trim();

  if (normalized.includes('đà lạt') || normalized.includes('dalat')) {
    return '/images/dalat.jpg';
  }
  if (normalized.includes('hạ long') || normalized.includes('halong')) {
    return '/images/halong.jpg';
  }
  if (normalized.includes('hội an') || normalized.includes('hoian')) {
    return '/images/hoian.jpg';
  }

  return '/images/halong.jpg'; // default
}
