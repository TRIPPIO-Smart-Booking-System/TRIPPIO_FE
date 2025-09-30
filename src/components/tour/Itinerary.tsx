'use client';

import { ChevronDown } from './icons';

type Item = { day: number; title: string; description: string };

export default function Itinerary({ items }: { items: Item[] }) {
  return (
    <div className="mt-4 divide-y">
      {items.map((item) => (
        <details key={item.day} className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-sm font-medium">
                {item.day}
              </span>
              <h3 className="text-base font-medium">
                Ngày {item.day}: {item.title}
              </h3>
            </div>
            <ChevronDown className="h-5 w-5 group-open:rotate-180" />
          </summary>
          <p className="pb-4 pl-11 text-muted-foreground">{item.description}</p>
        </details>
      ))}
    </div>
  );
}
