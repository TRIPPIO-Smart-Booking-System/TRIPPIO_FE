'use client';

type AmenityGroup = { name: string; items: string[] };

export default function AmenityList({ groups }: { groups: AmenityGroup[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {groups.map((g, i) => (
        <div key={i} className="rounded-2xl border p-4">
          <div className="mb-2 font-semibold">{g.name}</div>
          <ul className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
            {g.items.map((x, j) => (
              <li key={j} className="flex items-center gap-2">
                <CheckIcon /> {x}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" className="text-emerald-600">
      <path d="M20 6 9 17l-5-5" stroke="currentColor" strokeWidth="2" fill="none" />
    </svg>
  );
}
