import Container from '@/components/layout/Container';

const items = [
  {
    title: 'Đặt vé dễ dàng',
    desc: 'Quy trình đặt vé đơn giản, nhanh chóng và an toàn',
    icon: (
      <>
        <path d="m7 11 2-2-2-2" />
        <path d="M11 13h4" />
        <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
      </>
    ),
  },
  {
    title: 'Giá cả hợp lý',
    desc: 'Chúng tôi cam kết mang đến mức giá tốt nhất cho bạn',
    icon: (
      <>
        <path d="M12 2v20" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </>
    ),
  },
  {
    title: 'Dịch vụ chất lượng',
    desc: 'Đội ngũ nhân viên chuyên nghiệp, tận tâm phục vụ',
    icon: (
      <>
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      </>
    ),
  },
  {
    title: 'Hỗ trợ 24/7',
    desc: 'Luôn sẵn sàng hỗ trợ bạn mọi lúc, mọi nơi',
    icon: (
      <>
        <path d="M2 12h10" />
        <path d="M9 4v16" />
        <path d="M14 9h8" />
        <path d="M18 5v8" />
      </>
    ),
  },
];

export default function WhyChooseUs() {
  return (
    <section className="bg-card py-16">
      <Container>
        <div className="flex flex-col items-center text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">Tại sao chọn Trippio?</h2>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            Chúng tôi cam kết mang đến cho bạn những trải nghiệm du lịch tuyệt vời nhất
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((it) => (
            <div key={it.title} className="flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {it.icon}
                </svg>
              </div>
              <h3 className="mt-4 text-xl font-semibold">{it.title}</h3>
              <p className="mt-2 text-muted-foreground">{it.desc}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
