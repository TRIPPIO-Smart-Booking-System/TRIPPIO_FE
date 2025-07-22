'use client';

import Image from 'next/image';

export default function AdsHeroSection() {
  return (
    <div className="bg-gray-100 pt-[10px]">
      <section className="p-4 md:p-6 rounded-3xl max-w-[1200px] mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-10 bg-gray-200 p-8 md:p-16 rounded-3xl">
          {/* Left Text */}
          <div className="flex-1 max-w-md">
            <span className="inline-block px-4 py-2 text-sm bg-white rounded-full font-medium mb-4 shadow">
              Thanh toán dễ dàng
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-black leading-snug">
              Khám phá những <br /> điểm đến trong mơ <br /> một cách dễ dàng
            </h2>
          </div>

          {/* Right Image Grid */}
          <div className="flex-1 grid grid-cols-3 gap-4 w-full max-w-[600px]">
            {/* Big Image */}
            <div className="col-span-2 row-span-2 rounded-[30px] overflow-hidden">
              <Image
                src="/Home/1.jpg"
                alt="Main Travel"
                width={600}
                height={400}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Top right images */}
            <div className="rounded-[30px] overflow-hidden">
              <Image
                src="/Home/2.jpg"
                alt="Couple Travel"
                width={200}
                height={200}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="rounded-[30px] bg-gray-300 w-full h-full"></div>

            {/* Bottom right images */}
            <div className="rounded-[30px] bg-pink-100 w-full h-full"></div>
            <div className="rounded-[30px] overflow-hidden">
              <Image
                src="/Home/5.jpg"
                alt="Solo Traveler"
                width={200}
                height={200}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
