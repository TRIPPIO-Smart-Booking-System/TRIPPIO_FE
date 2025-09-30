'use client';

import { SparkleIcon } from './icons';

export default function Highlights({ items }: { items: string[] }) {
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {items.map((h, i) => (
        <span
          key={i}
          className="inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1.5 text-sm shadow-sm"
        >
          <SparkleIcon /> {h}
        </span>
      ))}
    </div>
  );
}
