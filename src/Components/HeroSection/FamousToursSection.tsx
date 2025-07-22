'use client';

import Slider from 'react-slick';
import FamousTourCard, { TourCardProps } from '../Card/FamousTourCard';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { useRef } from 'react';

const tours: TourCardProps[] = [
  {
    title: 'Cầu vàng Đà Nẵng',
    image: '/Home/1.jpg',
    duration: '2 ngày 3 đêm',
    groupSize: '4-6 người',
    price: '7.000.000',
    status: 'top-rated',
  },
  {
    title: 'Thành Phố Đêm Nha Trang',
    image: '/Home/2.jpg',
    duration: '3 ngày 3 đêm',
    groupSize: '4-6 người',
    price: '7.000.000',
    status: 'best-sale',
  },
  {
    title: 'Phú Quốc',
    image: '/Home/3.jpg',
    duration: '7 ngày 6 đêm',
    groupSize: '4-6 người',
    price: '7.000.000',
    status: 'discount',
    discountPercent: 25,
    rating: 52.81,
    reviews: 22,
  },
  {
    title: 'Đà Lạt Mộng Mơ',
    image: '/Home/4.jpg',
    duration: '4 ngày 3 đêm',
    groupSize: '2-4 người',
    price: '5.500.000',
    status: 'top-rated',
  },
  {
    title: 'Hội An - Phố cổ',
    image: '/Home/5.jpg',
    duration: '3 ngày 2 đêm',
    groupSize: '2-6 người',
    price: '6.000.000',
    status: 'discount',
    discountPercent: 15,
    rating: 48.9,
    reviews: 12,
  },
];

export default function FamousToursSection() {
  const sliderRef = useRef<Slider | null>(null);

  const sliderSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    autoplay: true,
    autoplaySpeed: 4000,
    slidesToShow: 3,
    slidesToScroll: 1,
    arrows: false, // disable default arrows
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  return (
    <section className="px-4 md:px-8 xl:px-16 py-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
        <div>
          <h2 className="text-3xl font-bold">Các tour du lịch nổi bật của chúng tôi</h2>
          <p className="text-gray-500 mt-2">Điểm đến yêu thích dựa trên đánh giá của khách hàng</p>
        </div>

        <div className="flex gap-3 flex-wrap">
          <button className="bg-gray-100 px-4 py-2 rounded-full text-sm">Khoảng thời gian ⌄</button>
          <button className="bg-gray-100 px-4 py-2 rounded-full text-sm">
            Đánh giá / Xếp hạng ⌄
          </button>
          <button className="bg-gray-100 px-4 py-2 rounded-full text-sm">Giá ⌄</button>
        </div>
      </div>

      {/* Custom arrows */}
      <div className="relative">
        {/* Prev & Next buttons */}
        <button
          onClick={() => sliderRef.current?.slickPrev()}
          className="absolute z-10 left-[-20px] top-1/2 transform -translate-y-1/2 bg-white shadow-md p-2 rounded-full hover:bg-gray-100"
        >
          <FaArrowLeft />
        </button>
        <button
          onClick={() => sliderRef.current?.slickNext()}
          className="absolute z-10 right-[-20px] top-1/2 transform -translate-y-1/2 bg-white shadow-md p-2 rounded-full hover:bg-gray-100"
        >
          <FaArrowRight />
        </button>

        {/* Slider */}
        <Slider ref={sliderRef} {...sliderSettings}>
          {tours.map((tour, idx) => (
            <div key={idx} className="px-3">
              {' '}
              {/* spacing between cards */}
              <FamousTourCard {...tour} />
            </div>
          ))}
        </Slider>
      </div>
    </section>
  );
}
