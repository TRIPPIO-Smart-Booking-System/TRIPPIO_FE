import { SearchData } from '@/types';
import { DEFAULT_SEARCH_VALUES, ROUTES } from '@/constants';

export const handleSearch = (searchData: SearchData): void => {
  console.log('Tìm kiếm:', searchData);

  switch (searchData.type) {
    case 'hotels':
      navigateToHotelSearch(searchData);
      break;
    case 'flights':
      navigateToFlightSearch(searchData);
      break;
    case 'car-rental':
      navigateToCarSearch(searchData);
      break;
    case 'airport-transfer':
      console.log('Tìm kiếm đưa đón sân bay:', searchData);
      // TODO: Implement airport transfer search
      break;
    case 'activities':
      navigateToActivitySearch(searchData);
      break;
    default:
      console.warn('Unknown search type:', searchData.type);
  }
};

const navigateToHotelSearch = (searchData: SearchData): void => {
  const params = new URLSearchParams({
    destination: searchData.destination || '',
    checkin: searchData.checkin || '',
    checkout: searchData.checkout || '',
    guests: (searchData.guests || DEFAULT_SEARCH_VALUES.guests).toString(),
    rooms: (searchData.rooms || DEFAULT_SEARCH_VALUES.rooms).toString(),
  });
  window.location.href = `${ROUTES.HOTELS_SEARCH}?${params.toString()}`;
};

const navigateToFlightSearch = (searchData: SearchData): void => {
  const params = new URLSearchParams({
    departure: searchData.departure || '',
    arrival: searchData.arrival || '',
    departureDate: searchData.departureDate || '',
    returnDate: searchData.returnDate || '',
    passengers: (searchData.passengers || DEFAULT_SEARCH_VALUES.passengers).toString(),
    tripType: searchData.tripType || DEFAULT_SEARCH_VALUES.tripType,
  });
  window.location.href = `${ROUTES.FLIGHTS_SEARCH}?${params.toString()}`;
};

const navigateToCarSearch = (searchData: SearchData): void => {
  const params = new URLSearchParams({
    pickupLocation: searchData.pickupLocation || '',
    dropoffLocation: searchData.dropoffLocation || '',
    pickupDate: searchData.pickupDate || '',
    dropoffDate: searchData.dropoffDate || '',
    pickupTime: searchData.pickupTime || '',
    dropoffTime: searchData.dropoffTime || '',
  });
  window.location.href = `${ROUTES.CARS_SEARCH}?${params.toString()}`;
};

const navigateToActivitySearch = (searchData: SearchData): void => {
  const params = new URLSearchParams({
    location: searchData.activityLocation || '',
    startDate: searchData.startDate || '',
    activityType: searchData.activityType || '',
    participants: (searchData.participants || DEFAULT_SEARCH_VALUES.participants).toString(),
  });
  window.location.href = `${ROUTES.ACTIVITIES_SEARCH}?${params.toString()}`;
};

export const handleBookNow = (tourId: string): void => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

  if (!isLoggedIn) {
    alert('Vui lòng đăng nhập để đặt tour!');
    window.location.href = ROUTES.LOGIN;
    return;
  }

  console.log('Đặt tour:', tourId);
  // TODO: Implement booking logic
};

export const searchTabs = [
  { id: 'hotels', label: 'Khách sạn', icon: '🏨' },
  { id: 'flights', label: 'Vé máy bay', icon: '✈️' },
  { id: 'airport-transfer', label: 'Đưa đón sân bay', icon: '🚗' },
  { id: 'car-rental', label: 'Cho thuê xe', icon: '🚙' },
  { id: 'activities', label: 'Hoạt động', icon: '🎯' },
];
