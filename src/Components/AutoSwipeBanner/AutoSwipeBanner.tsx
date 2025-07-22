// src/components/AutoSwipeBanner.tsx
'use client';

import Slider from 'react-slick';
import Image from 'next/image';
import React from 'react';

const images = [
  '/Home/1.jpg',
  '/Home/2.jpg',
  '/Home/3.jpg',
  '/Home/4.jpg',
  '/Home/5.jpg',
  '/Home/6.jpg',
];

const AutoSwipeBanner = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 800,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: false,
  };

  return (
    <div className="w-full max-w-7xl mx-auto my-8 px-4">
      <Slider {...settings}>
        {images.map((src, index) => (
          <div
            key={index}
            className="relative h-[400px] md:h-[500px] w-full rounded-xl overflow-hidden"
          >
            <Image
              src={src}
              alt={`Slide ${index + 1}`}
              layout="fill"
              objectFit="cover"
              className="rounded-xl"
              priority
            />
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default AutoSwipeBanner;
