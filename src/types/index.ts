// Search related types
export interface SearchData {
  type: 'hotels' | 'flights' | 'car-rental' | 'airport-transfer' | 'activities';
  destination?: string;
  checkin?: string;
  checkout?: string;
  guests?: number;
  rooms?: number;
  departure?: string;
  arrival?: string;
  departureDate?: string;
  returnDate?: string;
  passengers?: number;
  tripType?: 'roundtrip' | 'oneway';
  pickupLocation?: string;
  dropoffLocation?: string;
  pickupDate?: string;
  dropoffDate?: string;
  pickupTime?: string;
  dropoffTime?: string;
  activityLocation?: string;
  startDate?: string;
  activityType?: string;
  participants?: number;
}

export interface SearchTab {
  id: string;
  label: string;
  icon: string;
}

// Hotel related types
export interface Hotel {
  id: string;
  name: string;
  image: string;
  alt: string;
  rating: number;
  reviewCount: number;
  duration: string;
  capacity: string;
  price: number;
  currency: string;
  priceUnit: string;
  priceNote: string;
}

// Destination types
export interface Destination {
  id: string;
  name: string;
  image: string;
  alt: string;
}

// Tour types
export interface Tour {
  id: string;
  name: string;
  image: string;
  alt: string;
  badge?: {
    type: 'top-rated' | 'best-sale' | 'discount';
    text: string;
  };
  duration: string;
  capacity: string;
  price: number;
  currency: string;
  priceUnit: string;
}

// Benefit types
export interface Benefit {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

// Offer types
export interface Offer {
  id: string;
  title: string;
  description: string;
  badge: string;
  type: 'main-offer' | 'secondary-offer' | 'tertiary-offer';
  discount?: string;
}
