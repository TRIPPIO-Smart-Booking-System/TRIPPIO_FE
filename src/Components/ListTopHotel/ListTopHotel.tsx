'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/autoplay';
import HotelCard from '../Card/HotelCard';

const hotels = [
  {
    image: '/Home/1.jpg',
    name: 'Hotel Đà Nẵng',
    duration: '2 ngày 3 đêm',
    guests: '4-6 người',
    price: 'VND 1.000.000',
    rating: 4.96,
    reviews: 672,
  },
  {
    image: '/Home/2.jpg',
    name: 'Hotel Nha Trang',
    duration: '2 ngày 3 đêm',
    guests: '4-6 người',
    price: 'VND 6.000.000',
    rating: 4.96,
    reviews: 672,
  },
  {
    image: '/Home/3.jpg',
    name: 'Hotel Phú Quốc',
    duration: '2 ngày 3 đêm',
    guests: '4-6 người',
    price: 'VND 4.000.000',
    rating: 5,
    reviews: 800,
  },
  {
    image: '/Home/4.jpg',
    name: 'Hotel Hà Nội',
    duration: '2 ngày 3 đêm',
    guests: '4-6 người',
    price: 'VND 2.000.000',
    rating: 4.85,
    reviews: 450,
  },
  {
    image: '/Home/5.jpg',
    name: 'Hotel Sapa',
    duration: '3 ngày 2 đêm',
    guests: '2-4 người',
    price: 'VND 1.500.000',
    rating: 4.7,
    reviews: 380,
  },
  {
    image: '/Home/6.jpg',
    name: 'Hotel Vũng Tàu',
    duration: '2 ngày 2 đêm',
    guests: '3-5 người',
    price: 'VND 1.200.000',
    rating: 4.5,
    reviews: 320,
  },
  {
    image: '/Home/1.jpg',
    name: 'Hotel Huế',
    duration: '2 ngày 3 đêm',
    guests: '4-6 người',
    price: 'VND 1.800.000',
    rating: 4.8,
    reviews: 410,
  },
  {
    image: '/Home/2.jpg',
    name: 'Hotel Ninh Bình',
    duration: '2 ngày 2 đêm',
    guests: '2-4 người',
    price: 'VND 900.000',
    rating: 4.6,
    reviews: 290,
  },
  {
    image: '/Home/3.jpg',
    name: 'Hotel Hội An',
    duration: '3 ngày 2 đêm',
    guests: '2-5 người',
    price: 'VND 2.300.000',
    rating: 4.9,
    reviews: 510,
  },
  {
    image: '/Home/4.jpg',
    name: 'Hotel Bà Rịa',
    duration: '2 ngày 2 đêm',
    guests: '4-6 người',
    price: 'VND 1.100.000',
    rating: 4.4,
    reviews: 260,
  },
];

export default function ListTopHotel() {
  return (
    <section className="bg-[#e7f6f5] py-10 px-6">
      <div className="w-full px-6 mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Khách sạn hàng đầu</h2>
            <p className="text-gray-500 text-sm">Chất lượng đánh giá của khách hàng!</p>
          </div>
          <button className="bg-black text-white px-4 py-2 rounded-full text-sm hover:opacity-90 transition flex items-center gap-1">
            Xem thêm →
          </button>
        </div>

        <Swiper
          modules={[Autoplay]}
          slidesPerView={1.2}
          spaceBetween={16}
          breakpoints={{
            640: { slidesPerView: 2, spaceBetween: 16 },
            1024: { slidesPerView: 3, spaceBetween: 24 },
            1280: { slidesPerView: 4, spaceBetween: 24 },
          }}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
          }}
        >
          {hotels.map((hotel, index) => (
            <SwiperSlide key={index}>
              <HotelCard {...hotel} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
