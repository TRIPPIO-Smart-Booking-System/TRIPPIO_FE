import Hero from '@/components/home/Hero';
import FeaturedTours from '@/components/home/FeaturedTours';
import WhyChooseUs from '@/components/home/WhyChooseUs';
import Newsletter from '@/components/home/Newsletter';
import DreamDestinations from '@/components/home/DreamDestinations';
import PopularDestinations from '@/components/home/PopularDestinations';
import FeaturedTopTours from '@/components/home/FeaturedTopTours';

export default function Home() {
  return (
    <div className="relative min-h-[100dvh] overflow-x-clip">
      <FullBleedBG />

      {/* CONTENT */}
      <main className="relative z-10 flex flex-col gap-16">
        <Hero />

        <FeaturedTours />
        <DreamDestinations />
        <PopularDestinations />
        <FeaturedTopTours />
        <WhyChooseUs />
        <Newsletter />
      </main>

      {/* optional: floating blobs để nền sống động hơn */}
      <Blob className="left-[-6%] top-[18%]" delay="0s" />
      <Blob className="right-[-8%] top-[38%]" delay="1s" />
      <Blob className="left-[50%] top-[78%] -translate-x-1/2" delay="2s" />
    </div>
  );
}

/* =================== BACKGROUND =================== */
function FullBleedBG() {
  return (
    <>
      {/* sky → ocean gradient + ánh nắng */}
      <div className="fixed inset-0 -z-30 bg-[radial-gradient(1400px_700px_at_70%_-10%,#ffb2c8_0%,transparent_60%),radial-gradient(900px_500px_at_20%_0%,#fde68a_0%,transparent_50%),linear-gradient(180deg,#0ea5e9_0%,#06b6d4_35%,#14b8a6_60%,#0ea5e9_100%)] opacity-90 dark:opacity-80" />
      {/* subtle grid + noise */}
      <div className="fixed inset-0 -z-20 [background:linear-gradient(transparent_23px,rgba(255,255,255,.07)_24px),linear-gradient(90deg,transparent_23px,rgba(255,255,255,.07)_24px)] [background-size:24px_24px] mix-blend-overlay" />
      <div className="fixed inset-0 -z-20 opacity-40 mix-blend-overlay [background-image:url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 opacity=%220.03%22><filter id=%22n%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%222%22/></filter><rect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/></svg>')]" />

      {/* plane bay ngang */}
      <Plane />

      {/* sóng dưới chân trang */}
      <svg
        className="fixed inset-x-0 bottom-0 -z-20 h-36 w-full"
        viewBox="0 0 1440 200"
        preserveAspectRatio="none"
      >
        <path
          d="M0,160 C240,140 320,200 480,180 C640,160 720,120 900,150 C1080,180 1200,120 1440,150 L1440,220 L0,220 Z"
          fill="url(#ocean)"
          opacity="0.9"
        />
        <defs>
          <linearGradient id="ocean" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#0891b2" />
            <stop offset="100%" stopColor="#0ea5e9" />
          </linearGradient>
        </defs>
      </svg>
    </>
  );
}

/* =================== DECOR =================== */
function Plane() {
  return (
    <svg
      className="fixed left-[-15%] top-16 -z-10 h-10 w-10 animate-[fly_18s_linear_infinite]"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path
        d="M2 12l20-8-6 8 6 8-20-8 6 0-6-8z"
        className="text-white/80 drop-shadow-[0_4px_12px_rgba(14,165,233,0.6)]"
      />
      <style>{`
        @keyframes fly {
          0% { transform: translateX(0) translateY(0) rotate(8deg); opacity:.85 }
          50% { transform: translateX(130vw) translateY(15px) rotate(8deg); opacity:1 }
          100% { transform: translateX(130vw) translateY(15px) rotate(8deg); opacity:0 }
        }
      `}</style>
    </svg>
  );
}

function Blob({ className = '', delay = '0s' }: { className?: string; delay?: string }) {
  return (
    <div
      className={`pointer-events-none absolute -z-10 h-64 w-64 rounded-full opacity-30 blur-3xl ${className}`}
      style={{
        background:
          'radial-gradient(circle at 30% 30%, rgba(244,114,182,.8), transparent 60%), radial-gradient(circle at 70% 70%, rgba(34,211,238,.7), transparent 55%)',
        animation: `float 12s ease-in-out infinite`,
        animationDelay: delay,
      }}
    />
  );
}
