'use client';

// Tối giản: dùng iframe Google Maps. Bạn có thể thay bằng Leaflet sau.
export default function HotelMap({ lat, lng, title }: { lat: number; lng: number; title: string }) {
  const src = `https://www.google.com/maps?q=${lat},${lng}&hl=vi&z=14&output=embed`;
  return (
    <section className="rounded-2xl border p-4">
      <h2 className="mb-3 text-xl font-semibold">Vị trí</h2>
      <div className="overflow-hidden rounded-xl">
        <iframe title={title} src={src} width="100%" height="320" loading="lazy" />
      </div>
    </section>
  );
}
