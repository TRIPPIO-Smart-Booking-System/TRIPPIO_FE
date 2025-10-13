'use client';

type Nearby = {
  id: string;
  name: string;
  image: string;
  price_from: number;
  stars?: number;
  distance_km?: number;
};

export default function NearbySuggestions({
  items,
  onOpen,
}: {
  items: Nearby[];
  onOpen: (id: string) => void;
}) {
  return (
    <section className="rounded-2xl border p-6">
      <h2 className="text-xl font-semibold">Gợi ý gần đây</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((h) => (
          <button key={h.id} onClick={() => onOpen(h.id)} className="text-left">
            <div className="overflow-hidden rounded-xl">
              <img src={h.image} alt={h.name} className="h-40 w-full object-cover" />
            </div>
            <div className="mt-2">
              <div className="font-medium">{h.name}</div>
              <div className="text-sm text-zinc-600">
                {h.stars ? `${'★'.repeat(h.stars)} • ` : ''} từ{' '}
                {h.price_from.toLocaleString('vi-VN')} ₫/đêm
                {h.distance_km ? ` • ${h.distance_km} km` : ''}
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
