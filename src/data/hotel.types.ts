export type AmenityGroup = { name: string; items: string[] };

export type Policy = {
  checkin_time: string;
  checkout_time: string;
  cancel_rules: string[];
  child_policy?: string;
  pet_policy?: string;
  tax_fees?: { label: string; amount: number }[];
};

export type RoomType = {
  id: string;
  name: string;
  size_m2: number;
  bed: 'Double' | 'Twin' | 'Queen' | 'King' | 'Mixed';
  max_guests: number;
  smoking: boolean;
  images: string[];
  amenities: string[];
};

export type Hotel = {
  id: string;
  name: string;
  stars: 3 | 4 | 5;
  rating?: number;
  address: string;
  city: string;
  lat: number;
  lng: number;
  description: string;
  images: string[];
  amenity_groups: AmenityGroup[];
  policy: Policy;
  room_types: RoomType[];
};

export type RoomOffer = {
  room_type_id: string;
  breakfast: boolean;
  free_cancel_until?: string;
  pay_at_hotel?: boolean;
  price_per_night: number;
  nights: number;
  total: number;
};

export type NearbyHotel = {
  id: string;
  name: string;
  image: string;
  price_from: number;
  stars: number;
  distance_km?: number;
};
