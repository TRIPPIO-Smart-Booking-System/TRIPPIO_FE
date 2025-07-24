export interface Flight {
  id: string;
  airline: string;
  flightNumber: string;
  departure: {
    airport: string;
    city: string;
    time: string;
    date: string;
  };
  arrival: {
    airport: string;
    city: string;
    time: string;
    date: string;
  };
  duration: string;
  price: number;
  originalPrice?: number;
  aircraft: string;
  stops: number;
  baggage: string;
  class: 'Economy' | 'Business' | 'First';
  availableSeats: number;
}

export const flights: Flight[] = [
  {
    id: '1',
    airline: 'Vietnam Airlines',
    flightNumber: 'VN210',
    departure: {
      airport: 'SGN',
      city: 'TP. Hồ Chí Minh',
      time: '08:30',
      date: '2024-01-15',
    },
    arrival: {
      airport: 'HAN',
      city: 'Hà Nội',
      time: '10:45',
      date: '2024-01-15',
    },
    duration: '2h 15m',
    price: 2500000,
    originalPrice: 3000000,
    aircraft: 'Airbus A321',
    stops: 0,
    baggage: '23kg',
    class: 'Economy',
    availableSeats: 45,
  },
  {
    id: '2',
    airline: 'Jetstar Pacific',
    flightNumber: 'BL560',
    departure: {
      airport: 'SGN',
      city: 'TP. Hồ Chí Minh',
      time: '14:20',
      date: '2024-01-15',
    },
    arrival: {
      airport: 'HAN',
      city: 'Hà Nội',
      time: '16:35',
      date: '2024-01-15',
    },
    duration: '2h 15m',
    price: 1800000,
    originalPrice: 2200000,
    aircraft: 'Airbus A320',
    stops: 0,
    baggage: '20kg',
    class: 'Economy',
    availableSeats: 32,
  },
  {
    id: '3',
    airline: 'VietJet Air',
    flightNumber: 'VJ150',
    departure: {
      airport: 'SGN',
      city: 'TP. Hồ Chí Minh',
      time: '19:45',
      date: '2024-01-15',
    },
    arrival: {
      airport: 'HAN',
      city: 'Hà Nội',
      time: '22:00',
      date: '2024-01-15',
    },
    duration: '2h 15m',
    price: 1650000,
    originalPrice: 2000000,
    aircraft: 'Airbus A321',
    stops: 0,
    baggage: '20kg',
    class: 'Economy',
    availableSeats: 28,
  },
  {
    id: '4',
    airline: 'Vietnam Airlines',
    flightNumber: 'VN1543',
    departure: {
      airport: 'SGN',
      city: 'TP. Hồ Chí Minh',
      time: '06:00',
      date: '2024-01-15',
    },
    arrival: {
      airport: 'PQC',
      city: 'Phú Quốc',
      time: '07:10',
      date: '2024-01-15',
    },
    duration: '1h 10m',
    price: 2200000,
    originalPrice: 2600000,
    aircraft: 'ATR 72',
    stops: 0,
    baggage: '23kg',
    class: 'Economy',
    availableSeats: 18,
  },
  {
    id: '5',
    airline: 'Bamboo Airways',
    flightNumber: 'QH1043',
    departure: {
      airport: 'HAN',
      city: 'Hà Nội',
      time: '12:30',
      date: '2024-01-15',
    },
    arrival: {
      airport: 'DAD',
      city: 'Đà Nẵng',
      time: '14:00',
      date: '2024-01-15',
    },
    duration: '1h 30m',
    price: 1900000,
    originalPrice: 2300000,
    aircraft: 'Embraer E190',
    stops: 0,
    baggage: '23kg',
    class: 'Economy',
    availableSeats: 22,
  },
  {
    id: '6',
    airline: 'VietJet Air',
    flightNumber: 'VJ331',
    departure: {
      airport: 'HAN',
      city: 'Hà Nội',
      time: '16:15',
      date: '2024-01-15',
    },
    arrival: {
      airport: 'CXR',
      city: 'Nha Trang',
      time: '18:20',
      date: '2024-01-15',
    },
    duration: '2h 05m',
    price: 2100000,
    originalPrice: 2500000,
    aircraft: 'Airbus A320',
    stops: 0,
    baggage: '20kg',
    class: 'Economy',
    availableSeats: 35,
  },
];
