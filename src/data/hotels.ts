export interface Hotel {
  id: string;
  name: string;
  location: string;
  rating: number;
  price: number;
  originalPrice?: number;
  image: string;
  amenities: string[];
  description: string;
  reviews: number;
}

export const hotels: Hotel[] = [
  {
    id: '1',
    name: 'Khách sạn Majestic Saigon',
    location: 'Quận 1, TP. Hồ Chí Minh',
    rating: 4.5,
    price: 2500000,
    originalPrice: 3000000,
    image: '/images/hotel-1.jpg.webp',
    amenities: ['WiFi miễn phí', 'Hồ bơi', 'Spa', 'Nhà hàng', 'Phòng gym'],
    description: 'Khách sạn sang trọng tại trung tâm Sài Gòn với dịch vụ 5 sao',
    reviews: 1250,
  },
  {
    id: '2',
    name: 'InterContinental Hanoi Westlake',
    location: 'Tây Hồ, Hà Nội',
    rating: 4.8,
    price: 3200000,
    originalPrice: 3800000,
    image: '/images/hotel-2.jpg',
    amenities: ['WiFi miễn phí', 'Hồ bơi', 'Spa', 'Nhà hàng', 'Bar'],
    description: 'Resort sang trọng bên hồ Tây với view tuyệt đẹp',
    reviews: 980,
  },
  {
    id: '3',
    name: 'JW Marriott Phu Quoc Emerald Bay',
    location: 'Phú Quốc, Kiên Giang',
    rating: 4.7,
    price: 4500000,
    originalPrice: 5200000,
    image: '/images/hotel-3.jpg',
    amenities: ['WiFi miễn phí', 'Bãi biển riêng', 'Spa', 'Nhà hàng', 'Hồ bơi'],
    description: 'Resort biển đẳng cấp quốc tế tại đảo ngọc Phú Quốc',
    reviews: 756,
  },
  {
    id: '4',
    name: 'Anantara Hoi An Resort',
    location: 'Hội An, Quảng Nam',
    rating: 4.6,
    price: 3800000,
    originalPrice: 4300000,
    image: '/images/hotel-4.jpg.avif',
    amenities: ['WiFi miễn phí', 'Hồ bơi', 'Spa', 'Nhà hàng', 'Xe đạp miễn phí'],
    description: 'Resort boutique tại phố cổ Hội An với kiến trúc truyền thống',
    reviews: 892,
  },
  {
    id: '5',
    name: 'Dalat Palace Heritage Hotel',
    location: 'Đà Lạt, Lâm Đồng',
    rating: 4.4,
    price: 2800000,
    originalPrice: 3200000,
    image: '/images/hotel-5.jpg',
    amenities: ['WiFi miễn phí', 'Nhà hàng', 'Bar', 'Sân golf', 'Spa'],
    description: 'Khách sạn lịch sử với kiến trúc Pháp cổ điển tại Đà Lạt',
    reviews: 634,
  },
  {
    id: '6',
    name: 'Vinpearl Resort & Spa Ha Long Bay',
    location: 'Hạ Long, Quảng Ninh',
    rating: 4.3,
    price: 3500000,
    originalPrice: 4000000,
    image: '/images/hotel-6.jpg',
    amenities: ['WiFi miễn phí', 'Hồ bơi', 'Spa', 'Nhà hàng', 'Karaoke'],
    description: 'Resort cao cấp với view vịnh Hạ Long tuyệt đẹp',
    reviews: 1120,
  },
];
