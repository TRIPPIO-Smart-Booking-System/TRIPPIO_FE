'use client';

type Props = {
  description: string;
  checkin_time?: string;
  checkout_time?: string;
};

export default function HotelDescription({ description, checkin_time, checkout_time }: Props) {
  return (
    <section className="rounded-2xl border p-6">
      <h2 className="text-xl font-semibold">Giới thiệu</h2>
      <p className="mt-2 leading-7 text-zinc-700">{description}</p>

      {(checkin_time || checkout_time) && (
        <div className="mt-4 grid gap-2 text-sm text-zinc-600 sm:grid-cols-2">
          {checkin_time && (
            <div>
              Nhận phòng: <b className="text-zinc-900">{checkin_time}</b>
            </div>
          )}
          {checkout_time && (
            <div>
              Trả phòng: <b className="text-zinc-900">{checkout_time}</b>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
