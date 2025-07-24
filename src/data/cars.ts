export interface Car {
  id: string;
  name: string;
  brand: string;
  model: string;
  year: number;
  type: 'Sedan' | 'SUV' | 'Hatchback' | 'MPV' | 'Pickup' | 'Convertible';
  transmission: 'Tự động' | 'Số sàn';
  fuel: 'Xăng' | 'Dầu' | 'Hybrid' | 'Điện';
  seats: number;
  price: number;
  originalPrice?: number;
  image: string;
  features: string[];
  description: string;
  rating: number;
  reviews: number;
  location: string;
  supplier: string;
  mileage: string;
  deposit: number;
}

export const cars: Car[] = [
  {
    id: '1',
    name: 'Toyota Vios 2023',
    brand: 'Toyota',
    model: 'Vios',
    year: 2023,
    type: 'Sedan',
    transmission: 'Tự động',
    fuel: 'Xăng',
    seats: 5,
    price: 800000,
    originalPrice: 1000000,
    image: '/images/car-vios.jpg',
    features: ['Điều hòa', 'GPS', 'Camera lùi', 'Bluetooth', 'USB'],
    description: 'Xe sedan tiết kiệm nhiên liệu, phù hợp cho gia đình nhỏ và đi phố',
    rating: 4.5,
    reviews: 128,
    location: 'TP. Hồ Chí Minh',
    supplier: 'Trippio Car Rental',
    mileage: 'Không giới hạn',
    deposit: 5000000,
  },
  {
    id: '2',
    name: 'Honda City 2023',
    brand: 'Honda',
    model: 'City',
    year: 2023,
    type: 'Sedan',
    transmission: 'Tự động',
    fuel: 'Xăng',
    seats: 5,
    price: 850000,
    originalPrice: 1100000,
    image: '/images/car-city.jpg',
    features: ['Điều hòa', 'GPS', 'Camera lùi', 'Cảm biến lùi', 'Bluetooth'],
    description: 'Sedan hạng B với thiết kế hiện đại và trang bị tiện nghi',
    rating: 4.6,
    reviews: 95,
    location: 'Hà Nội',
    supplier: 'VietCar Rental',
    mileage: 'Không giới hạn',
    deposit: 5000000,
  },
  {
    id: '3',
    name: 'Toyota Fortuner 2023',
    brand: 'Toyota',
    model: 'Fortuner',
    year: 2023,
    type: 'SUV',
    transmission: 'Tự động',
    fuel: 'Dầu',
    seats: 7,
    price: 1500000,
    originalPrice: 1800000,
    image: '/images/car-fortuner.jpg',
    features: ['Điều hòa', 'GPS', 'Camera 360°', 'Cảm biến', 'Bluetooth', 'Cruise Control'],
    description: 'SUV 7 chỗ mạnh mẽ, phù hợp cho gia đình lớn và đi xa',
    rating: 4.7,
    reviews: 156,
    location: 'Đà Nẵng',
    supplier: 'Premium Car Rental',
    mileage: 'Không giới hạn',
    deposit: 10000000,
  },
  {
    id: '4',
    name: 'Hyundai Tucson 2023',
    brand: 'Hyundai',
    model: 'Tucson',
    year: 2023,
    type: 'SUV',
    transmission: 'Tự động',
    fuel: 'Xăng',
    seats: 5,
    price: 1200000,
    originalPrice: 1400000,
    image: '/images/car-tucson.jpg',
    features: ['Điều hòa', 'GPS', 'Camera lùi', 'Cảm biến', 'Bluetooth', 'Sunroof'],
    description: 'SUV 5 chỗ với thiết kế thể thao và công nghệ hiện đại',
    rating: 4.4,
    reviews: 87,
    location: 'Nha Trang',
    supplier: 'Coastal Car Rental',
    mileage: 'Không giới hạn',
    deposit: 8000000,
  },
  {
    id: '5',
    name: 'Toyota Innova 2023',
    brand: 'Toyota',
    model: 'Innova',
    year: 2023,
    type: 'MPV',
    transmission: 'Tự động',
    fuel: 'Xăng',
    seats: 8,
    price: 1100000,
    originalPrice: 1300000,
    image: '/images/car-innova.png',
    features: ['Điều hòa', 'GPS', 'Camera lùi', 'Bluetooth', 'USB', 'Ghế da'],
    description: 'MPV 8 chỗ rộng rãi, lý tưởng cho nhóm bạn và gia đình đông người',
    rating: 4.5,
    reviews: 203,
    location: 'Đà Lạt',
    supplier: 'Mountain Car Rental',
    mileage: 'Không giới hạn',
    deposit: 7000000,
  },
  {
    id: '6',
    name: 'Mazda CX-5 2023',
    brand: 'Mazda',
    model: 'CX-5',
    year: 2023,
    type: 'SUV',
    transmission: 'Tự động',
    fuel: 'Xăng',
    seats: 5,
    price: 1300000,
    originalPrice: 1500000,
    image: '/images/car-cx5.avif',
    features: ['Điều hòa', 'GPS', 'Camera 360°', 'Cảm biến', 'Bluetooth', 'Bose Audio'],
    description: 'SUV cao cấp với thiết kế sang trọng và âm thanh Bose',
    rating: 4.8,
    reviews: 74,
    location: 'Phú Quốc',
    supplier: 'Island Car Rental',
    mileage: 'Không giới hạn',
    deposit: 9000000,
  },
];
