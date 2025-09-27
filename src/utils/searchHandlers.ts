export const handleSearch = (searchData: any) => {
  console.log('Tìm kiếm:', searchData);
  // Xử lý tìm kiếm theo từng loại dịch vụ
  switch (searchData.type) {
    case 'hotels':
      // Chuyển hướng đến trang tìm kiếm khách sạn với query params
      const hotelParams = new URLSearchParams({
        destination: searchData.destination || '',
        checkin: searchData.checkin || '',
        checkout: searchData.checkout || '',
        guests: searchData.guests?.toString() || '2',
        rooms: searchData.rooms?.toString() || '1',
      });
      window.location.href = `/hotels/search?${hotelParams.toString()}`;
      break;
    case 'flights':
      // Chuyển hướng đến trang tìm kiếm vé máy bay với query params
      const flightParams = new URLSearchParams({
        departure: searchData.departure || '',
        arrival: searchData.arrival || '',
        departureDate: searchData.departureDate || '',
        returnDate: searchData.returnDate || '',
        passengers: searchData.passengers?.toString() || '1',
        tripType: searchData.tripType || 'roundtrip',
      });
      window.location.href = `/flights/search?${flightParams.toString()}`;
      break;
    case 'car-rental':
      // Chuyển hướng đến trang tìm kiếm xe cho thuê với query params
      const carParams = new URLSearchParams({
        pickupLocation: searchData.pickupLocation || '',
        dropoffLocation: searchData.dropoffLocation || '',
        pickupDate: searchData.pickupDate || '',
        dropoffDate: searchData.dropoffDate || '',
        pickupTime: searchData.pickupTime || '',
        dropoffTime: searchData.dropoffTime || '',
      });
      window.location.href = `/cars/search?${carParams.toString()}`;
      break;
    case 'airport-transfer':
      console.log('Tìm kiếm đưa đón sân bay:', searchData);
      // TODO: Tạo trang tìm kiếm đưa đón sân bay
      break;
    case 'activities':
      // Chuyển hướng đến trang tìm kiếm hoạt động với query params
      const activityParams = new URLSearchParams({
        location: searchData.activityLocation || '',
        startDate: searchData.startDate || '',
        activityType: searchData.activityType || '',
        participants: searchData.participants?.toString() || '2',
      });
      window.location.href = `/activities/search?${activityParams.toString()}`;
      break;
  }
};

export const handleBookNow = (tourId: string) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  if (!isLoggedIn) {
    alert('Vui lòng đăng nhập để đặt tour!');
    window.location.href = '/login';
  } else {
    console.log('Đặt tour:', tourId);
  }
};

export const searchTabs = [
  { id: 'hotels', label: 'Khách sạn', icon: '🏨' },
  { id: 'flights', label: 'Vé máy bay', icon: '✈️' },
  { id: 'airport-transfer', label: 'Đưa đón sân bay', icon: '🚗' },
  { id: 'car-rental', label: 'Cho thuê xe', icon: '🚙' },
  { id: 'activities', label: 'Hoạt động', icon: '🎯' },
];
