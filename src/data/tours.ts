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
      { day: 3, title: 'Đà Lạt - TP.HCM', description: 'Tham quan làng Cù Lân và quay về TP.HCM.' },
    ],
  },
  {
    id: 'tour-004',
    title: 'Du ngoạn Phú Quốc',
    destination: 'Phú Quốc, Kiên Giang',
    description:
      'Thưởng thức biển xanh cát trắng và tham quan những địa điểm nổi tiếng của đảo ngọc Phú Quốc.',
    price: 3500000,
    duration: '4 ngày 3 đêm',
    imageUrl: '/images/dalat.jpg',
    rating: 4.9,
    reviews: 310,
    highlights: [
      'Tham quan VinWonders',
      'Ngắm hoàng hôn ở Sunset Sanato',
      'Lặn biển ngắm san hô',
      'Thưởng thức hải sản tươi sống',
    ],
    included: ['Vé tham quan', 'Hướng dẫn viên', 'Bữa ăn', 'Khách sạn 4 sao'],
    itinerary: [
      {
        day: 1,
        title: 'TP.HCM - Phú Quốc',
        description: 'Bay đến Phú Quốc, nhận phòng, tham quan chợ đêm.',
      },
      {
        day: 2,
        title: 'Khám phá Nam đảo',
        description: 'Lặn biển, tham quan làng chài, thưởng thức hải sản.',
      },
      { day: 3, title: 'Bắc đảo & VinWonders', description: 'Tham quan VinWonders, Safari.' },
      {
        day: 4,
        title: 'Phú Quốc - TP.HCM',
        description: 'Tự do tắm biển, mua sắm đặc sản, ra sân bay.',
      },
    ],
  },
  {
    id: 'tour-005',
    title: 'Sapa - Núi rừng Tây Bắc',
    destination: 'Sapa, Lào Cai',
    description:
      'Khám phá vẻ đẹp hùng vĩ của núi rừng Tây Bắc, chinh phục Fansipan và trải nghiệm văn hóa dân tộc.',
    price: 2900000,
    duration: '3 ngày 2 đêm',
    imageUrl: '/images/dalat.jpg',
    rating: 4.8,
    reviews: 210,
    highlights: ['Chinh phục Fansipan', 'Bản Cát Cát', 'Chợ tình Sapa', 'Ngắm ruộng bậc thang'],
    included: ['Vé tham quan', 'HDV', 'Bữa ăn', 'Khách sạn'],
    itinerary: [
      { day: 1, title: 'Hà Nội - Sapa', description: 'Khởi hành đến Sapa, tham quan bản Cát Cát.' },
      { day: 2, title: 'Fansipan', description: 'Đi cáp treo lên đỉnh Fansipan.' },
      { day: 3, title: 'Sapa - Hà Nội', description: 'Mua sắm đặc sản, quay về Hà Nội.' },
    ],
  },
  {
    id: 'tour-006',
    title: 'Côn Đảo hoang sơ',
    destination: 'Côn Đảo, Bà Rịa - Vũng Tàu',
    description: 'Trải nghiệm vẻ đẹp hoang sơ và lịch sử hào hùng tại Côn Đảo.',
    price: 4000000,
    duration: '3 ngày 2 đêm',
    imageUrl: '/images/dalat.jpg',
    rating: 4.7,
    reviews: 95,
    highlights: [
      'Bãi biển Đầm Trầu',
      'Nghĩa trang Hàng Dương',
      'Lặn ngắm san hô',
      'Khám phá rừng nguyên sinh',
    ],
    included: ['Vé máy bay khứ hồi', 'HDV', 'Bữa ăn', 'Khách sạn'],
    itinerary: [
      {
        day: 1,
        title: 'TP.HCM - Côn Đảo',
        description: 'Bay đến Côn Đảo, tham quan nghĩa trang Hàng Dương.',
      },
      { day: 2, title: 'Khám phá biển đảo', description: 'Tắm biển, lặn san hô.' },
      { day: 3, title: 'Côn Đảo - TP.HCM', description: 'Mua quà lưu niệm, ra sân bay.' },
    ],
  },
  {
    id: 'tour-007',
    title: 'Huế - Kinh thành cổ kính',
    destination: 'Huế, Thừa Thiên Huế',
    description: 'Khám phá di sản văn hóa thế giới và ẩm thực cố đô Huế.',
    price: 2000000,
    duration: '2 ngày 1 đêm',
    imageUrl: '/images/halong.jpg',
    rating: 4.5,
    reviews: 150,
    highlights: ['Đại Nội', 'Chùa Thiên Mụ', 'Sông Hương', 'Ẩm thực Huế'],
    included: ['Vé tham quan', 'HDV', 'Bữa ăn', 'Khách sạn'],
    itinerary: [
      { day: 1, title: 'Đà Nẵng - Huế', description: 'Di chuyển đến Huế, tham quan Đại Nội.' },
      { day: 2, title: 'Huế - Đà Nẵng', description: 'Chùa Thiên Mụ, du thuyền Sông Hương.' },
    ],
  },
  {
    id: 'tour-008',
    title: 'Nha Trang biển xanh',
    destination: 'Nha Trang, Khánh Hòa',
    description: 'Tắm biển, lặn ngắm san hô và vui chơi ở Vinpearl Land.',
    price: 2700000,
    duration: '3 ngày 2 đêm',
    imageUrl: '/images/halong.jpg',
    rating: 4.6,
    reviews: 220,
    highlights: ['Vinpearl Land', 'Lặn san hô', 'Chợ đêm', 'Hải sản'],
    included: ['Vé tham quan', 'HDV', 'Bữa ăn', 'Khách sạn'],
    itinerary: [
      { day: 1, title: 'TP.HCM - Nha Trang', description: 'Di chuyển đến Nha Trang, nhận phòng.' },
      { day: 2, title: 'Khám phá đảo', description: 'Lặn san hô, vui chơi tại Vinpearl Land.' },
      { day: 3, title: 'Nha Trang - TP.HCM', description: 'Tắm biển buổi sáng, mua sắm.' },
    ],
  },
  {
    id: 'tour-009',
    title: 'Miền Tây sông nước',
    destination: 'Cần Thơ, Đồng Tháp',
    description: 'Khám phá chợ nổi, miệt vườn và văn hóa miền Tây.',
    price: 1500000,
    duration: '2 ngày 1 đêm',
    imageUrl: '/images/halong.jpg',
    rating: 4.4,
    reviews: 80,
    highlights: ['Chợ nổi Cái Răng', 'Vườn trái cây', 'Làng hoa Sa Đéc'],
    included: ['Vé tham quan', 'HDV', 'Bữa ăn', 'Khách sạn'],
    itinerary: [
      { day: 1, title: 'TP.HCM - Cần Thơ', description: 'Tham quan chợ nổi Cái Răng.' },
      {
        day: 2,
        title: 'Cần Thơ - TP.HCM',
        description: 'Tham quan làng hoa Sa Đéc, vườn trái cây.',
      },
    ],
  },
  {
    id: 'tour-010',
    title: 'Thám hiểm hang Sơn Đoòng',
    destination: 'Quảng Bình',
    description:
      'Trải nghiệm một trong những hang động lớn nhất thế giới, với hệ sinh thái và cảnh quan kỳ vĩ chưa từng thấy.',
    price: 6500000,
    duration: '5 ngày 4 đêm',
    imageUrl: '/images/halong.jpg',
    rating: 5.0,
    reviews: 120,
    highlights: [
      'Khám phá hang Sơn Đoòng',
      'Ngủ lều trong hang',
      'Ngắm thác ngầm',
      'Khám phá rừng nguyên sinh',
    ],
    included: ['Vé tham quan', 'HDV chuyên nghiệp', 'Bữa ăn', 'Trang thiết bị bảo hộ'],
    itinerary: [
      { day: 1, title: 'Đồng Hới - Sơn Đoòng', description: 'Di chuyển đến điểm trekking.' },
      { day: 2, title: 'Vào hang', description: 'Bắt đầu hành trình khám phá hang động.' },
      { day: 3, title: 'Khám phá hang', description: 'Tham quan các khối thạch nhũ và hồ ngầm.' },
      { day: 4, title: 'Kết thúc khám phá', description: 'Rời hang và nghỉ ngơi.' },
      { day: 5, title: 'Quay về', description: 'Di chuyển về Đồng Hới.' },
    ],
  },
  {
    id: 'tour-011',
    title: 'Khám phá Bà Nà Hills',
    destination: 'Đà Nẵng',
    description:
      'Tham quan Bà Nà Hills với Cầu Vàng nổi tiếng, công viên Fantasy và khí hậu mát mẻ quanh năm.',
    price: 1200000,
    duration: '1 ngày',
    imageUrl: '/images/dalat.jpg',
    rating: 4.7,
    reviews: 340,
    highlights: ['Cầu Vàng', 'Fantasy Park', 'Vườn hoa Le Jardin', 'Tàu hỏa leo núi'],
    included: ['Vé cáp treo', 'HDV', 'Bữa trưa'],
    itinerary: [
      { day: 1, title: 'Đà Nẵng - Bà Nà Hills', description: 'Tham quan trọn ngày tại Bà Nà.' },
    ],
  },
  {
    id: 'tour-012',
    title: 'Khám phá Côn Minh - Lệ Giang',
    destination: 'Trung Quốc',
    description: 'Hành trình khám phá vùng đất cổ kính và hùng vĩ của tỉnh Vân Nam, Trung Quốc.',
    price: 8900000,
    duration: '6 ngày 5 đêm',
    imageUrl: '/images/halong.jpg',
    rating: 4.9,
    reviews: 220,
    highlights: ['Thành cổ Lệ Giang', 'Núi Tuyết Ngọc Long', 'Hắc Long Đàm', 'Cổ trấn'],
    included: ['Vé máy bay', 'HDV', 'Bữa ăn', 'Khách sạn'],
    itinerary: [
      { day: 1, title: 'Hà Nội - Côn Minh', description: 'Bay sang Trung Quốc.' },
      { day: 2, title: 'Côn Minh', description: 'Tham quan Thạch Lâm.' },
      { day: 3, title: 'Lệ Giang', description: 'Tham quan thành cổ.' },
      { day: 4, title: 'Núi Tuyết', description: 'Khám phá thiên nhiên hùng vĩ.' },
      { day: 5, title: 'Tự do tham quan', description: 'Mua sắm và thưởng thức ẩm thực.' },
      { day: 6, title: 'Về nước', description: 'Kết thúc chuyến đi.' },
    ],
  },
  {
    id: 'tour-013',
    title: 'Hà Giang mùa hoa tam giác mạch',
    destination: 'Hà Giang',
    description:
      'Chiêm ngưỡng mùa hoa tam giác mạch rực rỡ và những con đường đèo hùng vĩ của Hà Giang.',
    price: 2600000,
    duration: '3 ngày 2 đêm',
    imageUrl: '/images/dalat.jpg',
    rating: 4.8,
    reviews: 175,
    highlights: ['Đèo Mã Pí Lèng', 'Phố cổ Đồng Văn', 'Hoa tam giác mạch', 'Cột cờ Lũng Cú'],
    included: ['Vé tham quan', 'HDV', 'Bữa ăn', 'Khách sạn'],
    itinerary: [
      { day: 1, title: 'Hà Nội - Hà Giang', description: 'Di chuyển và nghỉ đêm tại TP Hà Giang.' },
      { day: 2, title: 'Khám phá Đồng Văn', description: 'Tham quan các điểm nổi bật.' },
      { day: 3, title: 'Hà Giang - Hà Nội', description: 'Kết thúc chuyến đi.' },
    ],
  },
  {
    id: 'tour-014',
    title: 'Tham quan Tây Nguyên',
    destination: 'Buôn Ma Thuột, Đắk Lắk',
    description: 'Khám phá văn hóa cồng chiêng và thiên nhiên hoang sơ của Tây Nguyên.',
    price: 3100000,
    duration: '4 ngày 3 đêm',
    imageUrl: '/images/halong.jpg',
    rating: 4.6,
    reviews: 140,
    highlights: ['Thác Dray Nur', 'Buôn Đôn', 'Lễ hội Cồng Chiêng', 'Thưởng thức cà phê'],
    included: ['Vé tham quan', 'HDV', 'Bữa ăn', 'Khách sạn'],
    itinerary: [
      { day: 1, title: 'TP.HCM - Buôn Ma Thuột', description: 'Di chuyển và tham quan thành phố.' },
      { day: 2, title: 'Tham quan thác', description: 'Khám phá thác Dray Nur.' },
      { day: 3, title: 'Buôn Đôn', description: 'Trải nghiệm văn hóa bản địa.' },
      { day: 4, title: 'Về TP.HCM', description: 'Kết thúc chuyến đi.' },
    ],
  },
  {
    id: 'tour-015',
    title: 'Tour du lịch Mộc Châu',
    destination: 'Sơn La',
    description: 'Ngắm hoa mận trắng, hoa cải vàng và thưởng thức đặc sản Mộc Châu.',
    price: 2200000,
    duration: '3 ngày 2 đêm',
    imageUrl: '/images/dalat.jpg',
    rating: 4.5,
    reviews: 95,
    highlights: ['Đồi chè Mộc Châu', 'Thác Dải Yếm', 'Bản Áng', 'Chợ phiên'],
    included: ['Vé tham quan', 'HDV', 'Bữa ăn', 'Khách sạn'],
    itinerary: [
      { day: 1, title: 'Hà Nội - Mộc Châu', description: 'Di chuyển và tham quan đồi chè.' },
      { day: 2, title: 'Khám phá Mộc Châu', description: 'Tham quan thác và bản làng.' },
      { day: 3, title: 'Mộc Châu - Hà Nội', description: 'Kết thúc chuyến đi.' },
    ],
  },
  {
    id: 'tour-016',
    title: 'Khám phá Cần Giờ',
    destination: 'TP.HCM',
    description: 'Tham quan rừng ngập mặn và thưởng thức hải sản tươi sống tại Cần Giờ.',
    price: 900000,
    duration: '1 ngày',
    imageUrl: '/images/halong.jpg',
    rating: 4.3,
    reviews: 60,
    highlights: ['Rừng ngập mặn', 'Đảo Khỉ', 'Chợ hải sản'],
    included: ['Vé tham quan', 'HDV', 'Bữa trưa'],
    itinerary: [
      { day: 1, title: 'TP.HCM - Cần Giờ', description: 'Tham quan rừng ngập mặn và đảo Khỉ.' },
    ],
  },
];
