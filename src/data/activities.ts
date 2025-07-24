export interface Activity {
  id: string;
  name: string;
  location: string;
  rating: number;
  price: number;
  originalPrice?: number;
  image: string;
  duration: string;
  category: string;
  description: string;
  reviews: number;
  highlights: string[];
  included: string[];
  minAge?: number;
  maxGroupSize?: number;
}

export const activities: Activity[] = [
  {
    id: '1',
    name: 'Tour Vịnh Hạ Long - Hang Sửng Sốt',
    location: 'Hạ Long, Quảng Ninh',
    rating: 4.8,
    price: 1200000,
    originalPrice: 1500000,
    image: '/images/halong.jpg',
    duration: '1 ngày',
    category: 'tours',
    description: 'Khám phá vẻ đẹp kỳ vĩ của Vịnh Hạ Long với hang Sửng Sốt nổi tiếng',
    reviews: 2340,
    highlights: [
      'Tham quan hang Sửng Sốt',
      'Ngắm cảnh Vịnh Hạ Long từ thuyền',
      'Ăn trưa hải sản tươi ngon',
      'Chèo thuyền kayak',
    ],
    included: ['Xe đưa đón', 'Hướng dẫn viên', 'Ăn trưa', 'Vé tham quan'],
    minAge: 5,
    maxGroupSize: 25,
  },
  {
    id: '2',
    name: 'Phiêu lưu Sapa - Trekking Fansipan',
    location: 'Sapa, Lào Cai',
    rating: 4.6,
    price: 2800000,
    originalPrice: 3200000,
    image: '/images/sapa.jpg',
    duration: '2 ngày 1 đêm',
    category: 'adventure',
    description: 'Chinh phục đỉnh Fansipan - nóc nhà Đông Dương',
    reviews: 1890,
    highlights: [
      'Chinh phục đỉnh Fansipan',
      'Ngắm cảnh ruộng bậc thang',
      'Trải nghiệm văn hóa dân tộc',
      'Cáp treo hiện đại',
    ],
    included: [
      'Khách sạn 3 sao',
      'Xe đưa đón',
      'Hướng dẫn viên',
      'Ăn sáng, trưa, tối',
      'Vé cáp treo',
    ],
    minAge: 12,
    maxGroupSize: 15,
  },
  {
    id: '3',
    name: 'Lặn ngắm san hô Phú Quốc',
    location: 'Phú Quốc, Kiên Giang',
    rating: 4.7,
    price: 950000,
    originalPrice: 1200000,
    image: '/images/phuquoc.jpg',
    duration: '4 giờ',
    category: 'water-sports',
    description: 'Khám phá thế giới đại dương với rạn san hô đầy màu sắc',
    reviews: 1560,
    highlights: ['Lặn ngắm san hô', 'Câu cá trên biển', 'Ăn trưa trên đảo', 'Tắm biển tự do'],
    included: ['Thuyền cao tốc', 'Thiết bị lặn', 'Hướng dẫn viên', 'Ăn trưa hải sản', 'Nước uống'],
    minAge: 8,
    maxGroupSize: 20,
  },
  {
    id: '4',
    name: 'Tour ẩm thực Hội An',
    location: 'Hội An, Quảng Nam',
    rating: 4.9,
    price: 650000,
    originalPrice: 800000,
    image: '/images/hoian.jpg',
    duration: '3 giờ',
    category: 'food-culture',
    description: 'Khám phá ẩm thực đặc sắc của phố cổ Hội An',
    reviews: 3200,
    highlights: [
      'Thưởng thức cao lầu, bánh mì',
      'Tham quan chợ đêm',
      'Học làm đèn lồng',
      'Dạo bộ phố cổ',
    ],
    included: [
      'Hướng dẫn viên địa phương',
      'Thưởng thức 5 món đặc sản',
      'Nước uống',
      'Làm đèn lồng',
    ],
    minAge: 3,
    maxGroupSize: 12,
  },
  {
    id: '5',
    name: 'Moto tour Đà Lạt',
    location: 'Đà Lạt, Lâm Đồng',
    rating: 4.5,
    price: 850000,
    originalPrice: 1000000,
    image: '/images/dalat.jpg',
    duration: '6 giờ',
    category: 'adventure',
    description: 'Khám phá Đà Lạt bằng xe máy với những cung đường đẹp',
    reviews: 980,
    highlights: ['Thác Elephant', 'Đồi chè Cầu Đất', 'Làng hoa Vạn Thành', 'Cà phê rang xay'],
    included: ['Xe máy và xăng', 'Hướng dẫn viên', 'Mũ bảo hiểm', 'Ăn trưa', 'Vé tham quan'],
    minAge: 16,
    maxGroupSize: 8,
  },
  {
    id: '6',
    name: 'Chèo thuyền Tràng An',
    location: 'Ninh Bình',
    rating: 4.4,
    price: 450000,
    originalPrice: 550000,
    image: '/images/trang-an.jpg',
    duration: '2 giờ',
    category: 'nature',
    description: 'Khám phá quần thể danh thắng Tràng An bằng thuyền',
    reviews: 1750,
    highlights: [
      'Chèo thuyền qua hang động',
      'Ngắm cảnh núi đá vôi',
      'Tham quan đền cổ',
      'Chụp ảnh check-in',
    ],
    included: ['Thuyền và thuyền công', 'Áo phao', 'Vé tham quan', 'Nước uống'],
    minAge: 5,
    maxGroupSize: 4,
  },
];
