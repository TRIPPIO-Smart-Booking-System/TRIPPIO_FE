export interface Tour {
  id: string;
  title: string;
  destination: string;
  description: string;
  price: number;
  duration: string;
  imageUrl: string;
  rating: number;
  reviews: number;
  highlights: string[];
  included: string[];
  itinerary: {
    day: number;
    title: string;
    description: string;
  }[];
}

export const tours: Tour[] = [
  {
    id: 'tour-001',
    title: 'Khám phá Vịnh Hạ Long',
    destination: 'Hạ Long, Quảng Ninh',
    description:
      'Trải nghiệm vẻ đẹp hùng vĩ của Vịnh Hạ Long - Di sản thiên nhiên thế giới được UNESCO công nhận. Tham quan các hang động kỳ thú và tận hưởng không khí trong lành trên vịnh.',
    price: 2500000,
    duration: '3 ngày 2 đêm',
    imageUrl: '/images/halong.jpg',
    rating: 4.8,
    reviews: 245,
    highlights: [
      'Tham quan hang Sửng Sốt',
      'Chèo thuyền kayak trên vịnh',
      'Tham gia lớp học nấu ăn trên du thuyền',
      'Ngắm bình minh trên vịnh',
    ],
    included: [
      'Vé tham quan',
      'Hướng dẫn viên tiếng Việt',
      'Bữa ăn theo chương trình',
      'Phòng nghỉ trên du thuyền',
    ],
    itinerary: [
      {
        day: 1,
        title: 'Hà Nội - Hạ Long',
        description:
          'Khởi hành từ Hà Nội đi Hạ Long. Check-in du thuyền, ăn trưa và bắt đầu hành trình khám phá vịnh.',
      },
      {
        day: 2,
        title: 'Khám phá Vịnh Hạ Long',
        description: 'Tham quan hang Sửng Sốt, chèo thuyền kayak và tham gia lớp học nấu ăn.',
      },
      {
        day: 3,
        title: 'Hạ Long - Hà Nội',
        description: 'Ngắm bình minh, ăn sáng, trả phòng và quay về Hà Nội.',
      },
    ],
  },
  {
    id: 'tour-002',
    title: 'Phố cổ Hội An thơ mộng',
    destination: 'Hội An, Quảng Nam',
    description:
      'Khám phá vẻ đẹp cổ kính của phố cổ Hội An với những con phố rợp đèn lồng và kiến trúc độc đáo. Tham quan các di tích lịch sử và thưởng thức ẩm thực đặc sắc của miền Trung.',
    price: 1800000,
    duration: '2 ngày 1 đêm',
    imageUrl: '/images/hoian.jpg',
    rating: 4.7,
    reviews: 189,
    highlights: [
      'Tham quan phố cổ Hội An',
      'Trải nghiệm thả đèn hoa đăng',
      'Học làm đèn lồng truyền thống',
      'Thưởng thức ẩm thực địa phương',
    ],
    included: [
      'Vé tham quan phố cổ',
      'Hướng dẫn viên tiếng Việt',
      'Bữa ăn theo chương trình',
      'Khách sạn 3 sao',
    ],
    itinerary: [
      {
        day: 1,
        title: 'Đà Nẵng - Hội An',
        description: 'Di chuyển từ Đà Nẵng đến Hội An, nhận phòng và tham quan phố cổ buổi chiều.',
      },
      {
        day: 2,
        title: 'Hội An - Đà Nẵng',
        description:
          'Tham gia lớp học làm đèn lồng, thưởng thức ẩm thực địa phương và quay về Đà Nẵng.',
      },
    ],
  },
  {
    id: 'tour-003',
    title: 'Khám phá Đà Lạt mộng mơ',
    destination: 'Đà Lạt, Lâm Đồng',
    description:
      'Tận hưởng không khí se lạnh của thành phố ngàn hoa. Tham quan các địa điểm nổi tiếng và trải nghiệm văn hóa độc đáo của vùng cao nguyên.',
    price: 2200000,
    duration: '3 ngày 2 đêm',
    imageUrl: '/images/dalat.jpg',
    rating: 4.6,
    reviews: 156,
    highlights: [
      'Tham quan vườn hoa thành phố',
      'Khám phá thác Datanla',
      'Trải nghiệm cà phê Đà Lạt',
      'Tham quan làng Cù Lần',
    ],
    included: [
      'Vé tham quan',
      'Hướng dẫn viên tiếng Việt',
      'Bữa ăn theo chương trình',
      'Khách sạn 3 sao',
    ],
    itinerary: [
      {
        day: 1,
        title: 'TP.HCM - Đà Lạt',
        description: 'Di chuyển từ TP.HCM đến Đà Lạt, nhận phòng và tham quan thành phố.',
      },
      {
        day: 2,
        title: 'Khám phá Đà Lạt',
        description: 'Tham quan vườn hoa, thác Datanla và trải nghiệm cà phê Đà Lạt.',
      },
      {
        day: 3,
        title: 'Đà Lạt - TP.HCM',
        description: 'Tham quan làng Cù Lần và quay về TP.HCM.',
      },
    ],
  },
];
