'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef } from 'react';
import PromoCard from '../Card/PromoCard';

const promoData = [
  {
    tag: 'Khuyến mại có hạn',
    title: 'Mua 1, Tặng 1',
    description: 'Điểm tham quan',
  },
  {
    tag: 'Ưu đãi đặc biệt',
    title: 'Giảm 30%',
    description: 'Tour du lịch hè',
  },
  {
    tag: 'Sắp hết hạn!',
    title: 'Miễn phí đưa đón',
    description: 'Sân bay',
  },
  {
    tag: 'Ưu đãi cuối tuần',
    title: 'Giảm 10%',
    description: 'Vé tham quan bảo tàng',
  },
  {
    tag: 'Hè rực rỡ',
    title: 'Mua vé máy bay',
    description: 'Tặng vali du lịch',
  },
  {
    tag: 'Độc quyền',
    title: 'Voucher 500K',
    description: 'Khi đặt combo nghỉ dưỡng',
  },
  {
    tag: 'Chỉ hôm nay!',
    title: 'Miễn phí vé vào cổng',
    description: 'Safari World',
  },
];

export default function PromoSection() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (offset: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <section className="bg-[#f4fafa] py-16">
      <div className="px-4 md:px-8 xl:px-16">
        <h2 className="text-2xl md:text-3xl font-bold mb-8">Chương trình khuyến mãi</h2>
      </div>

      <div className="relative w-full flex items-center">
        {/* Left navigation */}
        <button
          onClick={() => scroll(-400)}
          className="bg-gray-200 p-2 rounded-full absolute left-2 z-10"
        >
          <ChevronLeft />
        </button>

        {/* Scrollable promo card list */}
        <div ref={scrollRef} className="w-full overflow-x-auto hide-scrollbar px-12">
          <div className="flex gap-6 w-max">
            {promoData.map((promo, idx) => (
              <PromoCard
                key={idx}
                tag={promo.tag}
                title={promo.title}
                description={promo.description}
              />
            ))}
          </div>
        </div>

        {/* Right navigation */}
        <button
          onClick={() => scroll(400)}
          className="bg-gray-200 p-2 rounded-full absolute right-2 z-10"
        >
          <ChevronRight />
        </button>
      </div>
    </section>
  );
}
