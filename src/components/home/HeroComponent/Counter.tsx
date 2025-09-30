'use client';

type Props = {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  step?: number;
};

export default function Counter({ value, onChange, min = 0, max = 999, step = 1 }: Props) {
  const dec = () => onChange(Math.max(min, value - step));
  const inc = () => onChange(Math.min(max, value + step));

  return (
    <div className="inline-flex items-center gap-2 text-inherit">
      <button
        type="button"
        onClick={dec}
        className="h-8 w-8 rounded border leading-none text-inherit"
        aria-label="Decrease"
      >
        −
      </button>
      <span className="min-w-6 text-center tabular-nums text-inherit">{value}</span>
      <button
        type="button"
        onClick={inc}
        className="h-8 w-8 rounded border leading-none text-inherit"
        aria-label="Increase"
      >
        +
      </button>
    </div>
  );
}
