'use client';

type Props = {
  name: string;
  stars?: number;
  rating?: number; // có thể bỏ nếu bạn không dùng review
  reviewCount?: number;
  address: string;
};

export default function HotelHeader({ name, stars = 0, rating, reviewCount, address }: Props) {
  return (
    <header className="mb-4">
      <h1 className="text-2xl font-bold sm:text-3xl">{name}</h1>
      <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-zinc-600">
        <StarRow stars={stars} />
        {rating !== undefined && (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700">
            {rating} / 10 {reviewCount ? `• ${reviewCount} đánh giá` : ''}
          </span>
        )}
        <span className="inline-flex items-center gap-2">
          <MapPinIcon />
          <span>{address}</span>
        </span>
      </div>
    </header>
  );
}

function StarRow({ stars = 0 }: { stars: number }) {
  return (
    <span className="inline-flex items-center">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          className={i < stars ? 'text-amber-500' : 'text-zinc-300'}
          fill="currentColor"
        >
          <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        </svg>
      ))}
    </span>
  );
}
function MapPinIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" fill="none">
      <path d="M12 21s-7-5.33-7-11a7 7 0 0 1 14 0c0 5.67-7 11-7 11Z" strokeWidth="2" />
      <circle cx="12" cy="10" r="3" strokeWidth="2" />
    </svg>
  );
}
