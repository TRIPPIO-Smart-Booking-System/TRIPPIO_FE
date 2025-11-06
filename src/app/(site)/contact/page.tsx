/* app/portal/page.tsx */
import type { ComponentType, ReactNode, SVGProps } from 'react';

type IconType = ComponentType<SVGProps<SVGSVGElement>>;

/* ========================= PAGE ========================= */
export default function ContactPortalLanding() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-sky-50 text-slate-800">
      {/* ====== BACKGROUND LAYERS ====== */}
      <AuroraBackground />
      <Starfield />
      <CloudBelt />
      <RisingSun />

      {/* ====== FLYING BIRDS ====== */}
      <BirdsLayer />

      {/* ====== CONTENT ====== */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 pt-24 pb-24 sm:px-6 lg:px-8">
        {/* HERO */}
        <section className="relative isolate">
          <div className="mx-auto max-w-4xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/80 px-3 py-1 text-xs font-medium tracking-wide text-sky-700 backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              live status: systems nominal
            </span>

            <h1 className="mt-6 bg-gradient-to-br from-sky-700 via-emerald-600 to-sky-600 bg-clip-text text-4xl font-extrabold leading-tight tracking-tight text-transparent sm:text-5xl md:text-6xl">
              Cổng Thông Tin Liên Lạc
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-base/7 text-slate-600/90 sm:text-lg/8">
              Kết nối khách hàng, đội ngũ hỗ trợ và đối tác trên một giao diện duy nhất — nhanh,
              trực quan, và rực rỡ.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <a
                href="#contact"
                className="group relative inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-sky-600 to-emerald-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_-10px_rgba(56,189,248,.5)] transition hover:translate-y-[-1px] hover:shadow-[0_16px_40px_-8px_rgba(56,189,248,.6)]"
              >
                <span className="absolute inset-0 -z-10 rounded-2xl bg-[conic-gradient(from_220deg_at_50%_50%,#22d3ee_0%,#818cf8_25%,#f472b6_50%,#22d3ee_100%)] opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-40" />
                Liên hệ ngay
                <svg width="16" height="16" viewBox="0 0 24 24" className="ml-1">
                  <path fill="currentColor" d="M13 5l7 7-7 7v-4H4v-6h9V5z" />
                </svg>
              </a>

              <a
                href="#features"
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-300/60 bg-white/80 px-5 py-3 text-sm font-semibold text-sky-700 backdrop-blur transition hover:bg-white"
              >
                Tìm hiểu tính năng
              </a>
            </div>
          </div>

          {/* Floating Stats */}
          <div className="pointer-events-none mt-14 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              { k: 'Thời gian phản hồi', v: '< 2 phút' },
              { k: 'Kênh hỗ trợ', v: 'Email · Zalo · Hotline · TikTok' },
              { k: 'Độ hài lòng', v: '98.7%' },
            ].map((it, i) => (
              <div
                key={i}
                className="relative rounded-2xl border border-slate-200/80 bg-white/80 p-4 backdrop-blur"
              >
                <div className="text-xs uppercase tracking-wider text-slate-600/90">{it.k}</div>
                <div className="mt-1 text-xl font-bold text-slate-900">{it.v}</div>
                <div
                  className="absolute -inset-px -z-10 rounded-2xl opacity-60 [mask-image:radial-gradient(190px_90px_at_20%_0%,#000_35%,transparent_65%)]"
                  style={{
                    background:
                      'radial-gradient(60% 60% at 20% 0%, rgba(14,165,233,.18), transparent), radial-gradient(60% 60% at 80% 100%, rgba(99,102,241,.18), transparent)',
                  }}
                />
              </div>
            ))}
          </div>
        </section>

        {/* FEATURES */}
        <section id="features" className="relative mt-24">
          <SectionTitle
            title="Một giao diện, mọi kết nối"
            subtitle="Tập trung tất cả phương thức liên lạc vào một bảng điều khiển sang trọng và siêu mượt."
          />
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <FeatureCard key={i} {...f} />
            ))}
          </div>
        </section>

        {/* ANNOUNCEMENT / MARQUEE */}
        <section className="relative mt-20">
          <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-br from-sky-400/20 via-indigo-400/20 to-fuchsia-400/20 p-0.5">
            <div className="rounded-3xl bg-white/70 p-6 backdrop-blur">
              <h3 className="text-center text-xl font-bold text-slate-900">Bảng tin nội bộ</h3>
              <Marquee>
                <MarqueeItem>🛰️ Hệ thống giám sát uptime 24/7 đã kích hoạt.</MarqueeItem>
                <MarqueeItem>📣 Trợ lý AI mới hỗ trợ soạn phản hồi tự động.</MarqueeItem>
                <MarqueeItem>🔐 Xác thực 2 lớp cho tài khoản quản trị.</MarqueeItem>
                <MarqueeItem>
                  ⚡ Kết nối đa kênh realtime (Web · Email · Zalo · Hotline).
                </MarqueeItem>
              </Marquee>
            </div>
          </div>
        </section>

        {/* CONTACT METHODS */}
        <section id="contact" className="relative mt-24">
          <SectionTitle
            title="Liên hệ nhanh"
            subtitle="Chọn một kênh phù hợp — chúng tôi phản hồi trong tích tắc."
          />
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <ContactCard
              icon={PhoneIcon}
              title="Hotline 24/7"
              desc="Gọi ngay cho tổng đài viên"
              cta="Gọi ngay"
              href="#"
              badge="Ưu tiên"
            />
            <ContactCard
              icon={MailIcon}
              title="Email hỗ trợ"
              desc="Nhận phản hồi chi tiết qua email"
              cta="Soạn thư"
              href="#"
            />
            <ContactCard
              icon={ChatIcon}
              title="Zalo / TikTok"
              desc="Trò chuyện trực tiếp qua mạng xã hội"
              cta="Mở chat"
              href="#"
            />
            <ContactCard
              icon={TicketIcon}
              title="Tạo yêu cầu"
              desc="Theo dõi ticket và SLA minh bạch"
              cta="Tạo ticket"
              href="#"
            />
          </div>
        </section>

        {/* FAQ */}
        <section className="relative mt-24">
          <SectionTitle title="Câu hỏi thường gặp" subtitle="Những điều mọi người hay thắc mắc." />
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {faqs.map((qa, i) => (
              <div key={i} className="rounded-2xl border border-slate-200/80 bg-white/75 p-5">
                <div className="text-base font-semibold text-slate-900">{qa.q}</div>
                <p className="mt-2 text-sm text-slate-600/90">{qa.a}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-slate-200/80 bg-white/70 py-10 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2 text-slate-700">
              <Logo />
              <span className="text-sm">© {new Date().getFullYear()} Trippio Contact Portal</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-600/90">
              <a className="hover:text-slate-900" href="#">
                Điều khoản
              </a>
              <a className="hover:text-slate-900" href="#">
                Bảo mật
              </a>
              <a className="hover:text-slate-900" href="#features">
                Tính năng
              </a>
            </div>
          </div>
        </div>
      </footer>

      <StyleBlock />
    </div>
  );
}

/* ========================= SUB-COMPONENTS ========================= */
function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <h2 className="bg-gradient-to-br from-sky-700 to-emerald-600 bg-clip-text text-2xl font-extrabold tracking-tight text-transparent sm:text-3xl">
        {title}
      </h2>
      {subtitle && <p className="mt-2 text-slate-600/90">{subtitle}</p>}
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc }: { icon: IconType; title: string; desc: string }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/75 p-5 transition hover:bg-white">
      <div className="flex items-start gap-3">
        <div className="relative">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400/25 to-indigo-400/25 ring-1 ring-slate-200/80">
            <Icon className="h-5 w-5 text-sky-600" />
          </div>
          <span
            className="pointer-events-none absolute -inset-3 -z-10 rounded-2xl opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-60"
            style={{
              background:
                'radial-gradient(60% 60% at 40% 30%, rgba(14,165,233,.22), transparent), radial-gradient(60% 60% at 80% 70%, rgba(129,140,248,.22), transparent)',
            }}
          />
        </div>
        <div>
          <div className="text-base font-semibold text-slate-900">{title}</div>
          <p className="mt-1 text-sm text-slate-600/90">{desc}</p>
        </div>
      </div>
    </div>
  );
}

function ContactCard({
  icon: Icon,
  title,
  desc,
  cta,
  href,
  badge,
}: {
  icon: IconType;
  title: string;
  desc: string;
  cta: string;
  href: string;
  badge?: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/75 p-5">
      <div className="flex items-start gap-3">
        <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white/80 ring-1 ring-slate-200/80">
          <Icon className="h-5 w-5 text-sky-600" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-slate-900">{title}</h3>
            {badge && (
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                {badge}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-slate-600/90">{desc}</p>
          <a
            href={href}
            className="mt-3 inline-flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white/80 px-3 py-2 text-xs font-semibold text-sky-700 backdrop-blur transition hover:bg-white"
          >
            {cta}
            <svg width="14" height="14" viewBox="0 0 24 24">
              <path fill="currentColor" d="M13 5l7 7-7 7v-4H4v-6h9V5z" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}

function Marquee({ children }: { children: ReactNode }) {
  return (
    <div className="relative mt-3 overflow-hidden">
      <div className="animate-marquee whitespace-nowrap text-sky-700">
        {children}
        {children}
      </div>
    </div>
  );
}
function MarqueeItem({ children }: { children: ReactNode }) {
  return <span className="mx-6 inline-block py-2 text-sm">{children}</span>;
}

/* ======================== ICONS (inline) ======================== */
function PhoneIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      {...props}
    >
      <path d="M22 16.92V21a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07A19.5 19.5 0 0 1 3.07 12 19.8 19.8 0 0 1 0 3.18 2 2 0 0 1 2 1h4.09A2 2 0 0 1 8 2.72l1.2 2.8a2 2 0 0 1-.45 2.3L7.9 8.68a16 16 0 0 0 7.42 7.42l.86-.85a2 2 0 0 1 2.3-.45l2.8 1.2A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}
function MailIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      {...props}
    >
      <path d="M4 4h16v16H4z" />
      <path d="M22 6l-10 7L2 6" />
    </svg>
  );
}
function ChatIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      {...props}
    >
      <path d="M21 15a4 4 0 0 1-4 4H7l-4 4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
    </svg>
  );
}
function TicketIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      {...props}
    >
      <path d="M2 7h20v10H2z" />
      <path d="M7 7v10M17 7v10M12 9v2M12 13v2" />
    </svg>
  );
}
function Logo() {
  return (
    <div className="inline-flex items-center gap-2">
      <span className="inline-grid h-7 w-7 place-items-center rounded-lg bg-sky-100 ring-1 ring-slate-200/80">
        <svg width="16" height="16" viewBox="0 0 24 24" className="text-sky-600">
          <path d="M12 2l7 19H5L12 2z" fill="currentColor" />
        </svg>
      </span>
      <span className="text-sm font-extrabold tracking-tight text-slate-900">Trippio</span>
    </div>
  );
}

/* ====================== BACKGROUND DECOR ====================== */
function AuroraBackground() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-20 overflow-hidden">
      <div className="absolute -inset-[20%] animate-aurora bg-[radial-gradient(60%_60%_at_20%_0%,rgba(56,189,248,.25),transparent),radial-gradient(60%_60%_at_80%_30%,rgba(99,102,241,.22),transparent),radial-gradient(60%_60%_at_50%_100%,rgba(236,72,153,.18),transparent)] blur-3xl" />
      <div className="absolute inset-0 bg-[radial-gradient(1200px_600px_at_80%_-20%,rgba(56,189,248,.18),transparent_60%),radial-gradient(800px_500px_at_10%_10%,rgba(99,102,241,.18),transparent_60%)]" />
    </div>
  );
}
function Starfield() {
  return (
    <div
      aria-hidden
      className="absolute inset-0 -z-30 opacity-40 [background:radial-gradient(2px_2px_at_20px_30px,rgba(2,6,23,.08)_1px,transparent_1px)] [background-size:40px_40px]"
    />
  );
}
function CloudBelt() {
  return (
    <div
      aria-hidden
      className="absolute inset-x-0 top-[-20vh] -z-10 h-[60vh] animate-clouds bg-[radial-gradient(50%_35%_at_50%_60%,rgba(255,255,255,.3),transparent_70%),radial-gradient(45%_30%_at_20%_80%,rgba(255,255,255,.22),transparent_70%),radial-gradient(45%_30%_at_80%_70%,rgba(255,255,255,.22),transparent_70%)] blur-[2px]"
    />
  );
}
function RisingSun() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 bottom-[-30vh] -z-10 flex justify-center"
    >
      <div className="h-[60vh] w-[60vh] rounded-full bg-gradient-to-t from-amber-200/40 to-amber-400/20 blur-3xl" />
    </div>
  );
}

/* ========================== BIRDS ========================== */
function BirdsLayer() {
  const birds = Array.from({ length: 7 });
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
      {birds.map((_, i) => (
        <Bird key={i} index={i} />
      ))}
    </div>
  );
}
function Bird({ index }: { index: number }) {
  const size = 14 + (index % 4) * 4; // 14..26
  const top = 10 + ((index * 13) % 70); // 10..80vh
  const dur = 14 + (index % 5) * 3; // 14..26s
  const delay = (index * 1.7) % 9; // 0..9s
  const reverse = index % 2 === 0;

  return (
    <svg
      className={`absolute ${reverse ? 'animate-bird-rev' : 'animate-bird'} opacity-[.85] drop-shadow-[0_6px_14px_rgba(14,165,233,.35)]`}
      style={{ top: `${top}vh`, animationDuration: `${dur}s`, animationDelay: `${delay}s` }}
      width={size}
      height={size}
      viewBox="0 0 24 24"
    >
      <path
        d="M2 12c4-4 8-4 10-2 2-2 6-2 10 2"
        fill="none"
        stroke="white"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ============================ DATA ============================ */
const features: Array<{ icon: IconType; title: string; desc: string }> = [
  {
    icon: PhoneIcon,
    title: 'Đa kênh hợp nhất',
    desc: 'Hợp nhất email, hotline, Zalo, TikTok vào một bảng điều khiển duy nhất.',
  },
  {
    icon: ChatIcon,
    title: 'Trí tuệ hỗ trợ',
    desc: 'Gợi ý câu trả lời, tóm tắt hội thoại, tự động phân loại mức độ ưu tiên.',
  },
  {
    icon: MailIcon,
    title: 'Mẫu phản hồi',
    desc: 'Thư viện template động theo ngữ cảnh, cá nhân hoá theo người nhận.',
  },
  {
    icon: TicketIcon,
    title: 'SLA minh bạch',
    desc: 'Theo dõi KPI, thời gian phản hồi, và thoả thuận dịch vụ theo thời gian thực.',
  },
  {
    icon: PhoneIcon,
    title: 'Phân quyền mượt',
    desc: 'Quyền truy cập theo vai trò, nhật ký hoạt động và kiểm toán.',
  },
  {
    icon: ChatIcon,
    title: 'Realtime presence',
    desc: 'Nhìn thấy ai đang gõ, đang xử lý và tránh xử lý trùng lặp.',
  },
];

const faqs: Array<{ q: string; a: string }> = [
  {
    q: 'Tôi có thể tích hợp những kênh nào?',
    a: 'Hiện hỗ trợ Email (IMAP/SMTP), Zalo OA, Hotline SIP/VoIP, TikTok Business và webhook tuỳ chỉnh.',
  },
  {
    q: 'Dữ liệu có an toàn không?',
    a: 'Mọi kết nối đều mã hóa, hỗ trợ SSO, 2FA và phân quyền chi tiết theo phòng ban.',
  },
  {
    q: 'Có thể tuỳ biến giao diện?',
    a: 'Có. Bạn có thể đổi logo, màu sắc, và sắp xếp module theo nhu cầu.',
  },
  {
    q: 'Hỗ trợ tiếng Việt tốt chứ?',
    a: 'Có. Mọi câu chữ, trợ lý AI và bộ gợi ý đều tối ưu cho tiếng Việt.',
  },
];

/* ============================= STYLES ============================= */
function StyleBlock() {
  return (
    <style>{`
      @keyframes aurora {
        0% { transform: translateY(-8px) rotate(0.4deg); filter: hue-rotate(0deg); }
        50% { transform: translateY(-4px) rotate(-0.4deg); filter: hue-rotate(20deg); }
        100% { transform: translateY(-6px) rotate(0deg); filter: hue-rotate(-10deg); }
      }
      .animate-aurora { animation: aurora 12s ease-in-out infinite alternate; }

      @keyframes clouds { from { transform: translateX(-5%);} to { transform: translateX(5%);} }
      .animate-clouds { animation: clouds 26s ease-in-out infinite alternate; }

      @keyframes bird {
        0% { transform: translateX(-10vw) translateY(0) rotate(3deg); }
        50% { transform: translateX(110vw) translateY(-6px) rotate(0deg); }
        100% { transform: translateX(110vw) translateY(-6px) rotate(0deg); }
      }
      @keyframes bird-rev {
        0% { transform: translateX(110vw) translateY(0) rotate(-3deg); }
        50% { transform: translateX(-10vw) translateY(6px) rotate(0deg); }
        100% { transform: translateX(-10vw) translateY(6px) rotate(0deg); }
      }
      .animate-bird { animation: bird 20s linear infinite; }
      .animate-bird-rev { animation: bird-rev 22s linear infinite; }

      @keyframes marquee { 0% { transform: translateX(0);} 100% { transform: translateX(-50%);} }
      .animate-marquee { animation: marquee 22s linear infinite; }
    `}</style>
  );
}
