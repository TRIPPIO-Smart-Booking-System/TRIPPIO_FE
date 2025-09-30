import { SearchTab } from '@/types';

export const SEARCH_TABS: SearchTab[] = [
  { id: 'hotels', label: 'Khách sạn', icon: '🏨' },
  { id: 'flights', label: 'Vé máy bay', icon: '✈️' },
  { id: 'airport-transfer', label: 'Đưa đón sân bay', icon: '🚗' },
  { id: 'car-rental', label: 'Cho thuê xe', icon: '🚙' },
  { id: 'activities', label: 'Hoạt động', icon: '🎯' },
];

export const DEFAULT_SEARCH_VALUES = {
  guests: 2,
  rooms: 1,
  passengers: 1,
  participants: 2,
  tripType: 'roundtrip' as const,
};

export const ROUTES = {
  HOTELS_SEARCH: '/hotels/search',
  FLIGHTS_SEARCH: '/flights/search',
  CARS_SEARCH: '/cars/search',
  ACTIVITIES_SEARCH: '/activities/search',
  LOGIN: '/login',
} as const;

export const CURRENCY = {
  VND: 'VND',
  USD: 'USD',
} as const;
