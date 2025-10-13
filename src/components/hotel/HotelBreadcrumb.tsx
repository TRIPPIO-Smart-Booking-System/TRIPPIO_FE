'use client';

import Breadcrumb from '../comon/Breadcrumb';

export default function HotelBreadcrumb({ city, hotelName }: { city: string; hotelName: string }) {
  const items = [
    { href: '/', label: 'Trang chủ' },
    { href: '/hotel', label: 'Khách sạn' },
    // link city về /hotel?city=... để lọc theo tỉnh/thành
    { href: `/hotel?city=${encodeURIComponent(city)}`, label: city },
    { label: hotelName },
  ];
  return <Breadcrumb items={items} />;
}
