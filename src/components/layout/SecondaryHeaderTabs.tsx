'use client';

import { useId, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import { Hotel, Plane, CarTaxiFront, Car, PartyPopper } from 'lucide-react';

// -------------------- Types --------------------
type TabKey = 'hotel' | 'flight' | 'transfer' | 'car' | 'activity';
type Item = { key: TabKey; label: string };

export type SecondaryHeaderTabsProps = {
  items?: Item[];
  value?: TabKey;
  onChange?: (k: TabKey) => void;
  /** đặt true nếu muốn sticky ngay dưới header chính  */
  sticky?: boolean;
  className?: string;
};

const DEFAULT_ITEMS: Item[] = [
  { key: 'hotel', label: 'Khách sạn' },
  { key: 'flight', label: 'Vé máy bay' },
  { key: 'transfer', label: 'Đưa đón sân bay' },
  { key: 'car', label: 'Cho thuê xe' },
  { key: 'activity', label: 'Hoạt động' },
];

// -------------------- Helpers --------------------
const iconOf: Record<TabKey, React.ComponentType<any>> = {
  hotel: Hotel,
  flight: Plane,
  transfer: CarTaxiFront,
  car: Car,
  activity: PartyPopper,
};

// -------------------- Component --------------------
export default function SecondaryHeaderTabs({
  items = DEFAULT_ITEMS,
  value,
  onChange,
  sticky = true,
  className,
}: SecondaryHeaderTabsProps) {
  const rid = useId();
  const [internal, setInternal] = useState<TabKey>(value ?? items[0]?.key);
  const active = value ?? internal;
  const listRef = useRef<HTMLDivElement | null>(null);

  const keys = useMemo(() => items.map((i) => i.key), [items]);
  const activeIndex = Math.max(0, keys.indexOf(active));

  const change = (k: TabKey) => {
    setInternal(k);
    onChange?.(k);
    // Auto-center active item if overflowed
    if (listRef.current) {
      const btn = listRef.current.querySelector<HTMLButtonElement>(`[data-key="${k}"]`);
      if (btn) {
        const parent = listRef.current;
        const left = btn.offsetLeft - parent.clientWidth / 2 + btn.clientWidth / 2;
        parent.scrollTo({ left, behavior: 'smooth' });
      }
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const dir = e.key === 'ArrowRight' ? 1 : -1;
    const next = (activeIndex + dir + keys.length) % keys.length;
    change(keys[next]);
  };

  return (
    <div
      className={clsx(
        'w-full border-b border-teal-200/40',
        // subtle gradient + glassmorphism
        'bg-[radial-gradient(1250px_600px_at_50%_-200px,rgba(45,212,191,0.25),transparent),var(--bg,#f7fbfb)]',
        'backdrop-blur supports-[backdrop-filter]:bg-white/60',
        sticky && 'sticky top-16 z-40',
        className
      )}
      role="tablist"
      aria-label="Secondary navigation"
      aria-labelledby={`${rid}-label`}
    >
      <div className="mx-auto max-w-6xl px-3">
        <div
          ref={listRef}
          className={clsx(
            'relative flex items-center gap-2 sm:gap-4',
            // mobile: scrollable row
            'overflow-x-auto no-scrollbar',
            // paddings
            'py-2 sm:py-3'
          )}
          onKeyDown={onKeyDown}
        >
          {/* Soft container ring */}
          <div className="pointer-events-none absolute inset-x-0 -bottom-px top-0 rounded-xl border border-white/40 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.6)]" />

          {items.map((it) => {
            const isActive = active === it.key;
            const Icon = iconOf[it.key];
            return (
              <button
                key={it.key}
                data-key={it.key}
                role="tab"
                aria-selected={isActive}
                aria-controls={`${rid}-${it.key}`}
                onClick={() => change(it.key)}
                className={clsx(
                  'relative isolate',
                  'group flex shrink-0 items-center gap-2 rounded-full',
                  'px-4 py-2 sm:px-5 sm:py-2.5',
                  // interactive states
                  'transition-all',
                  isActive
                    ? 'text-teal-700'
                    : 'text-slate-600/80 hover:text-teal-700 focus:text-teal-700',
                  // elevated pill background on hover/active
                  'hover:bg-white/80 focus:bg-white/90',
                  isActive && 'bg-white/90 shadow-sm'
                )}
              >
                {/* subtle halo */}
                <span className="absolute -inset-1 -z-10 rounded-full opacity-0 transition-opacity group-hover:opacity-40 group-focus:opacity-50 bg-teal-200/40" />

                <Icon className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden />
                <span className="text-sm font-semibold tracking-wide sm:text-[0.95rem]">
                  {it.label}
                </span>

                {/* Animated underline that morphs between tabs */}
                {isActive && (
                  <motion.span
                    layoutId="tab-underline"
                    className="absolute -bottom-1 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-teal-500"
                    transition={{ type: 'spring', stiffness: 500, damping: 40, mass: 0.8 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// --------------- Notes ---------------
// - Responsive: row scrolls horizontally on small screens, centered in wide view.
// - Accessibility: proper tab roles, roving with ArrowLeft/Right.
// - Motion: framer-motion underline glides between active tabs.
// - Visual: soft gradient, glass blur, pill buttons, subtle halos.
// - API: Backward-compatible props + optional className.
