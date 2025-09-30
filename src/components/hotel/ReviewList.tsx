'use client';

type Review = {
  id: string;
  name: string;
  score: number; // 1-10
  date: string; // ISO
  room_type?: string;
  text?: string;
  photos?: string[];
};

export default function ReviewList({
  items,
  page,
  pageSize,
  total,
  onPageChange,
}: {
  items: Review[];
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (p: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <section className="rounded-2xl border p-6">
      <h2 className="text-xl font-semibold">Nhận xét của khách</h2>

      <ul className="mt-4 space-y-4">
        {items.map((r) => (
          <li key={r.id} className="rounded-xl border p-4">
            <div className="flex items-center justify-between">
              <div className="font-medium">{r.name}</div>
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-sm font-semibold text-emerald-700">
                {r.score}/10
              </span>
            </div>
            <div className="mt-1 text-xs text-zinc-500">
              {r.room_type ? `${r.room_type} • ` : ''}
              {new Date(r.date).toLocaleDateString('vi-VN')}
            </div>
            {r.text && <p className="mt-2 text-sm text-zinc-700">{r.text}</p>}
            {r.photos && r.photos.length > 0 && (
              <div className="mt-3 grid grid-cols-3 gap-2">
                {r.photos.map((p, i) => (
                  <img key={i} src={p} alt="" className="h-24 w-full rounded object-cover" />
                ))}
              </div>
            )}
          </li>
        ))}
      </ul>

      <div className="mt-4 flex items-center justify-center gap-2">
        <button
          className="rounded border px-3 py-1 text-sm disabled:opacity-50"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page <= 1}
        >
          Trước
        </button>
        <span className="text-sm text-zinc-600">
          {page}/{totalPages}
        </span>
        <button
          className="rounded border px-3 py-1 text-sm disabled:opacity-50"
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
        >
          Sau
        </button>
      </div>
    </section>
  );
}
