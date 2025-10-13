'use client';

import Image from 'next/image';

export default function DreamDestinations() {
  return (
    // rộng hơn: max-w-7xl (có thể đổi 8xl nếu bạn muốn to nữa)
    <section className="mx-auto max-w-7xl px-4 md:px-6">
      {/* khung lớn hơn + cao hơn */}
      <div className="relative overflow-hidden rounded-3xl border border-zinc-300/60 shadow-sm">
        {/* nền dịu */}
        <div className="absolute inset-0 bg-[#F3F8F7]" />

        {/* BG map: to & rộng hơn nhờ bg-[length] */}
        <div
          className="
            absolute inset-0
            bg-[url('/BG.jpg')] bg-no-repeat bg-center
            md:bg-[length:1600px_auto] bg-[length:1200px_auto]
            opacity-60
          "
          aria-hidden="true"
        />

        {/* nội dung – đẩy xuống dưới */}
        <div className="relative z-10 grid gap-6 px-6 pb-10 pt-16 md:grid-cols-12 md:px-12 md:pb-16 md:pt-24">
          {/* trái: chip + heading (nhỏ lại + tụt xuống) */}
          <div className="md:col-span-4">
            <span className="inline-block rounded-full border border-zinc-300 bg-white/80 px-4 py-2 text-xs font-medium shadow-sm backdrop-blur">
              Thanh toán dễ dàng
            </span>

            <h2 className="mt-5 text-2xl font-extrabold leading-snug tracking-tight text-zinc-900 md:mt-6 md:text-3xl">
              Khám phá những
              <br />
              điểm đến trong mơ
              <br />
              một cách dễ dàng
            </h2>
          </div>

          {/* giữa: ảnh lớn */}
          <div className="md:col-span-5">
            <div className="mx-auto h-56 w-full max-w-[520px] overflow-hidden rounded-[28px] md:h-64 lg:h-72">
              <Image
                src="/images/halong.jpg"
                alt="Main destination"
                width={1040}
                height={720}
                className="h-full w-full object-cover"
                priority
              />
            </div>
          </div>

          {/* phải: 2 ảnh + 2 block trống */}
          <div className="md:col-span-3 flex flex-col items-center gap-5">
            <div className="flex w-full items-start gap-5">
              <div className="h-36 w-28 overflow-hidden rounded-[28px] md:h-40 md:w-32">
                <Image
                  src="/images/halong.jpg"
                  alt="Traveler"
                  width={320}
                  height={320}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="h-36 w-28 rounded-[28px] bg-zinc-300/50 md:h-40 md:w-32" />
            </div>

            <div className="flex w-full items-start gap-5">
              <div className="h-24 w-28 rounded-[28px] bg-rose-100 md:h-28 md:w-32" />
              <div className="h-40 w-28 overflow-hidden rounded-[28px] md:h-44 md:w-32">
                <Image
                  src="/images/halong.jpg"
                  alt="Happy tourist"
                  width={320}
                  height={360}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        {/* viền trong tinh tế */}
        <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-black/5" />
      </div>
    </section>
  );
}
