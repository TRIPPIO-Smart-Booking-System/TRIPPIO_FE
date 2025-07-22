'use client';

import WhyChooseUsCard from '../Card/WhyChooseUsCard';

const reasons = [
  {
    icon: '/Icons/khien.png',
    title: 'Đảm bảo an ninh',
    description:
      'Thể hiện cam kết bảo mật dữ liệu người dùng thông qua mã hóa và các biện pháp thanh toán an toàn',
    bgColor: 'bg-[#F0F2EA]',
  },
  {
    icon: '/Icons/tongdai.png',
    title: 'Đảm bảo an ninh',
    description:
      'Thể hiện cam kết bảo mật dữ liệu người dùng thông qua mã hóa và các biện pháp thanh toán an toàn',
    bgColor: 'bg-[#DDEACF]',
  },
  {
    icon: '/Icons/battay.png',
    title: 'Đảm bảo an ninh',
    description:
      'Thể hiện cam kết bảo mật dữ liệu người dùng thông qua mã hóa và các biện pháp thanh toán an toàn',
    bgColor: 'bg-[#F0F2EA]',
  },
  {
    icon: '/Icons/paper.png',
    title: 'Đảm bảo an ninh',
    description:
      'Thể hiện cam kết bảo mật dữ liệu người dùng thông qua mã hóa và các biện pháp thanh toán an toàn',
    bgColor: 'bg-[#DDEACF]',
  },
];

export default function WhyChooseUsSection() {
  return (
    <section className="px-4 md:px-8 xl:px-16 py-16 bg-white">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold">Tại sao nên đi du lịch cùng chúng tôi?</h2>
        <p className="text-gray-500 mt-2">Nền tảng đặt phòng tốt nhất mà bạn có thể tin tưởng</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {reasons.map((item, index) => (
          <WhyChooseUsCard key={index} {...item} />
        ))}
      </div>
    </section>
  );
}
