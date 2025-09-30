'use client';

type RoomType = {
  id: string;
  name: string;
  size_m2: number;
  bed: string;
  max_guests: number;
  smoking: boolean;
  images: string[];
  amenities: string[];
};
type RoomOffer = {
  room_type_id: string;
  breakfast: boolean;
  free_cancel_until?: string;
  pay_at_hotel?: boolean;
  price_per_night: number;
  nights: number;
  total: number;
};

export default function RoomTable({
  roomTypes,
  offers,
  onSelect,
}: {
  roomTypes: RoomType[];
  offers: RoomOffer[];
  onSelect: (roomTypeId: string) => void;
}) {
  const byId = Object.fromEntries(roomTypes.map((r) => [r.id, r]));

  return (
    <div className="divide-y rounded-2xl border">
      {offers.map((o) => {
        const rt = byId[o.room_type_id];
        if (!rt) return null;
        return (
          <div key={o.room_type_id} className="grid gap-4 p-4 md:grid-cols-[220px_1fr_auto]">
            {/* Image */}
            <div className="overflow-hidden rounded-xl">
              <img
                src={rt.images?.[0] || '/placeholder.jpg'}
                alt={rt.name}
                className="h-36 w-full object-cover"
              />
            </div>

            {/* Info */}
            <div className="space-y-1 text-sm">
              <div className="text-base font-semibold">{rt.name}</div>
              <div className="text-zinc-600">
                {rt.size_m2} m² • Giường {rt.bed} • Tối đa {rt.max_guests} khách{' '}
                {rt.smoking ? '• Phòng hút thuốc' : '• Không hút thuốc'}
              </div>
              <div className="flex flex-wrap gap-2">
                {o.breakfast && <Badge text="Bao gồm bữa sáng" />}
                {o.pay_at_hotel && <Badge text="Thanh toán tại khách sạn" />}
                {o.free_cancel_until && (
                  <Badge text={`Miễn phí hủy trước ${o.free_cancel_until}`} />
                )}
              </div>
              <div className="text-zinc-600">Tiện nghi: {rt.amenities.slice(0, 3).join(', ')}…</div>
            </div>

            {/* Price & CTA */}
            <div className="flex flex-col items-end justify-between">
              <div className="text-right">
                <div className="text-xs text-zinc-500">Giá/đêm</div>
                <div className="text-lg font-bold">
                  {o.price_per_night.toLocaleString('vi-VN')} ₫
                </div>
                <div className="text-xs text-zinc-500">{o.nights} đêm • Tổng</div>
                <div className="text-xl font-extrabold text-blue-600">
                  {o.total.toLocaleString('vi-VN')} ₫
                </div>
              </div>
              <button
                onClick={() => onSelect(rt.id)}
                className="mt-3 h-10 rounded-lg bg-blue-600 px-4 font-semibold text-white hover:bg-blue-700"
              >
                Chọn phòng
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Badge({ text }: { text: string }) {
  return <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs">{text}</span>;
}
