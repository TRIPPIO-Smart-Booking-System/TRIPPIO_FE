// Mock data based on images in /public/images
// Replace CSV data with static mock data

export interface MockHotel {
  id: string;
  name: string;
  city: string;
  image: string;
  rating: number;
  reviews: number;
  price: number;
  description: string;
}

export interface MockShow {
  id: string;
  name: string;
  city: string;
  image: string;
  price: number;
  startDate: string;
  endDate: string;
  category: string;
}

export interface MockTransport {
  id: string;
  type: 'flight' | 'train' | 'bus';
  from: string;
  to: string;
  image: string;
  price: number;
  duration: string;
}

// Hotel mock data (using hotel1-8 images)
export const mockHotels: MockHotel[] = [
  {
    id: 'h1',
    name: 'Luxury Hanoi Hotel',
    city: 'Hà Nội',
    image: '/images/hotel/hotel1.jpg',
    rating: 4.8,
    reviews: 256,
    price: 1200000,
    description: 'Khách sạn 5 sao hàng đầu tại Hà Nội',
  },
  {
    id: 'h2',
    name: 'Beachfront Resort Da Nang',
    city: 'Đà Nẵng',
    image: '/images/hotel/hotel2.jpg',
    rating: 4.7,
    reviews: 189,
    price: 950000,
    description: 'Resort sang trọng mặt biển',
  },
  {
    id: 'h3',
    name: 'Ancient Town Hoi An',
    city: 'Hội An',
    image: '/images/hotel/hotel3.webp',
    rating: 4.6,
    reviews: 142,
    price: 680000,
    description: 'Khách sạn boutique tại thành phố cổ',
  },
  {
    id: 'h4',
    name: 'Mountain View Sapa',
    city: 'Sa Pa',
    image: '/images/hotel/hotel4.webp',
    rating: 4.5,
    reviews: 128,
    price: 750000,
    description: 'Resort trên đỉnh núi đẹp',
  },
  {
    id: 'h5',
    name: 'City Center Ho Chi Minh',
    city: 'TP.HCM',
    image: '/images/hotel/hotel5.webp',
    rating: 4.7,
    reviews: 215,
    price: 890000,
    description: 'Khách sạn tại trung tâm thành phố',
  },
  {
    id: 'h6',
    name: 'Palace Garden Hanoi',
    city: 'Hà Nội',
    image: '/images/hotel/hotel6.webp',
    rating: 4.6,
    reviews: 167,
    price: 1100000,
    description: 'Khách sạn 5 sao tiền cổ',
  },
  {
    id: 'h7',
    name: 'Riverside Villa Mekong',
    city: 'Cần Thơ',
    image: '/images/hotel/hotel7.webp',
    rating: 4.4,
    reviews: 95,
    price: 520000,
    description: 'Villa sông Mekong yên tĩnh',
  },
  {
    id: 'h8',
    name: 'Historic Hotel Hue',
    city: 'Huế',
    image: '/images/hotel/hotel8.jpg',
    rating: 4.5,
    reviews: 112,
    price: 620000,
    description: 'Khách sạn lịch sử với tiện nghi hiện đại',
  },
];

// Show mock data (using show1-6 images)
export const mockShows: MockShow[] = [
  {
    id: 's1',
    name: 'AO Show',
    city: 'TP.HCM',
    image: '/images/show/show1.webp',
    price: 22000,
    startDate: '2025-12-14',
    endDate: '2025-12-15',
    category: 'Circus & Acrobatics',
  },
  {
    id: 's2',
    name: 'Teh Dar Show',
    city: 'TP.HCM',
    image: '/images/show/show2.jpg',
    price: 32000,
    startDate: '2025-12-16',
    endDate: '2025-12-17',
    category: 'Water Puppet Show',
  },
  {
    id: 's3',
    name: 'Water Puppet Show',
    city: 'Hà Nội',
    image: '/images/show/show3.webp',
    price: 50000,
    startDate: '2025-12-17',
    endDate: '2025-12-18',
    category: 'Traditional Art',
  },
  {
    id: 's4',
    name: 'Siêu Chuyên Di VIP Pro',
    city: 'Hà Nội',
    image: '/images/show/show4.webp',
    price: 42000,
    startDate: '2025-11-14',
    endDate: '2025-11-15',
    category: 'Comedy Show',
  },
  {
    id: 's5',
    name: 'Chân Bộ Ở Sapa',
    city: 'Sa Pa',
    image: '/images/show/show5.webp',
    price: 32000,
    startDate: '2025-11-19',
    endDate: '2025-11-20',
    category: 'Cultural Performance',
  },
  {
    id: 's6',
    name: 'Tripio Pro Mai Di Đảo Long Cung',
    city: 'Hạ Long',
    image: '/images/show/show6.jpg',
    price: 10000,
    startDate: '2025-11-23',
    endDate: '2025-11-24',
    category: 'Adventure Show',
  },
];

// Transport mock data
export const mockTransports: MockTransport[] = [
  {
    id: 't1',
    type: 'flight',
    from: 'Hà Nội',
    to: 'TP.HCM',
    image: '/images/transport/flight.webp',
    price: 1200000,
    duration: '2h 15m',
  },
  {
    id: 't2',
    type: 'train',
    from: 'Hà Nội',
    to: 'Hải Phòng',
    image: '/images/transport/train.webp',
    price: 250000,
    duration: '2h',
  },
  {
    id: 't3',
    type: 'bus',
    from: 'TP.HCM',
    to: 'Cần Thơ',
    image: '/images/transport/bus.webp',
    price: 150000,
    duration: '3h 30m',
  },
  {
    id: 't4',
    type: 'flight',
    from: 'TP.HCM',
    to: 'Đà Nẵng',
    image: '/images/transport/flight.webp',
    price: 950000,
    duration: '1h 15m',
  },
  {
    id: 't5',
    type: 'train',
    from: 'Hà Nội',
    to: 'Sa Pa',
    image: '/images/transport/train.webp',
    price: 450000,
    duration: '6h 30m',
  },
  {
    id: 't6',
    type: 'bus',
    from: 'Hà Nội',
    to: 'Hạ Long',
    image: '/images/transport/bus.webp',
    price: 200000,
    duration: '3h',
  },
];

// Destination mock data (for destination sections)
export const mockDestinations = [
  {
    id: 'd1',
    name: 'Đà Lạt',
    image: '/images/dalat.jpg',
    description: 'Thành phố ngàn hoa với khí hậu mát mẻ',
    rating: 4.6,
  },
  {
    id: 'd2',
    name: 'Hạ Long',
    image: '/images/halong.jpg',
    description: 'Di sản thiên nhiên thế giới',
    rating: 4.8,
  },
  {
    id: 'd3',
    name: 'Hội An',
    image: '/images/hoian.jpg',
    description: 'Phố cổ xinh đẹp trên bờ sông Thu Bồn',
    rating: 4.7,
  },
];
