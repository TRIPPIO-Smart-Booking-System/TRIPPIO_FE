'use client';

import { CheckIcon } from './icons';

export default function IncludedList({ items }: { items: string[] }) {
  return (
    <ul className="mt-3 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
      {items.map((x, i) => (
        <li key={i} className="flex items-center gap-2">
          <CheckIcon /> {x}
        </li>
      ))}
    </ul>
  );
}
