'use client';

// Optional: nếu bạn đã bỏ review, có thể không dùng component này.
type Props = {
  average: number; // 0-10
  distribution?: { score: number; count: number }[]; // ví dụ [{score:10,count:20},...]
  total?: number;
};

export default function ReviewsSummary({ average, distribution = [], total }: Props) {
  const max = Math.max(1, ...distribution.map((d) => d.count));
  return (
    <section className="rounded-2xl border p-6">
      <h2 className="text-xl font-semibold">Đánh giá</h2>
      <div className="mt-2 flex items-center gap-6">
        <div className="rounded-2xl bg-emerald-600 px-4 py-3 text-white">
          <div className="text-3xl font-bold">{average.toFixed(1)}</div>
          <div className="text-xs opacity-80">{total ?? 0} đánh giá</div>
        </div>
        <div className="flex-1 space-y-2">
          {distribution
            .sort((a, b) => b.score - a.score)
            .map((d) => (
              <div key={d.score} className="flex items-center gap-2 text-sm">
                <span className="w-8">{d.score}</span>
                <div className="h-2 flex-1 rounded bg-zinc-100">
                  <div
                    className="h-2 rounded bg-emerald-500"
                    style={{ width: `${(d.count / max) * 100}%` }}
                  />
                </div>
                <span className="w-10 text-right text-zinc-500">{d.count}</span>
              </div>
            ))}
        </div>
      </div>
    </section>
  );
}
