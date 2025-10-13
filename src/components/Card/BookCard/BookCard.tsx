'use client';

import { useMemo } from 'react';
import Button from '@/components/ui/Button';
import { VND } from '@/utils/currency';
import { CheckIcon } from '@/components/tour/icons';

type Props = {
  rating: number;
  reviews: number;
  duration: string;
  destination: string;
  price: number;
  included: string[];
  date: string;
  guests: number;
  onDateChange: (v: string) => void;
  onGuestsChange: (n: number) => void;
};

export default function BookCard({
  rating,
  reviews,
  duration,
  destination,
  price,
  included,
  date,
  guests,
  onDateChange,
  onGuestsChange,
}: Props) {
  const total = useMemo(() => price * guests, [price, guests]);

  return (
    <div className="sticky top-24 rounded-2xl border bg-white p-6 shadow-sm">
      <div className="flex items-baseline justify-between">
        <h3 className="text-xl font-semibold">Đặt tour</h3>
        <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
          {rating}★ ({reviews})
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <Field label="Thời lượng" value={duration} />
        <Field label="Điểm đến" value={destination} />
        <div className="col-span-2">
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            Ngày khởi hành
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => onDateChange(e.target.value)}
            className="h-10 w-full rounded-lg border px-3 text-sm outline-none focus:ring-2 focus:ring-black/10"
          />
        </div>
        <div className="col-span-2">
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Số khách</label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-lg border hover:bg-zinc-50"
              onClick={() => onGuestsChange(Math.max(1, guests - 1))}
            >
              −
            </button>
            <div className="flex-1 rounded-lg border px-3 py-2 text-center text-sm">
              {guests} người
            </div>
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-lg border hover:bg-zinc-50"
              onClick={() => onGuestsChange(guests + 1)}
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Price box */}
      <div className="mt-5 rounded-xl bg-zinc-50 p-4">
        <Row label="Giá / người" value={VND(price)} />
        <Row label="Số khách" value={String(guests)} />
        <div className="mt-3 border-t pt-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Tổng tạm tính</span>
            <span className="text-lg font-bold">{VND(total)}</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Chưa bao gồm thuế & phí</p>
        </div>
      </div>

      <Button className="mt-4 h-11 w-full text-base">Đặt ngay</Button>

      {/* Included quick list */}
      <div className="mt-5">
        <p className="text-xs font-medium text-muted-foreground">Dịch vụ bao gồm</p>
        <ul className="mt-2 space-y-2 text-sm">
          {included.slice(0, 4).map((item, i) => (
            <li key={i} className="flex items-center gap-2">
              <CheckIcon /> {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-muted-foreground">{label}</label>
      <div className="truncate rounded-lg border px-3 py-2 text-sm">{value}</div>
    </div>
  );
}
function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span>{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
