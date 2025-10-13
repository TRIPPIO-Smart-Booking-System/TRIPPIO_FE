'use client';

export type BedOption = 'Double' | 'Twin' | 'Queen' | 'King' | 'Mixed' | 'Any';

export type RoomFilterState = {
  bed?: BedOption;
  breakfast?: boolean;
  freeCancel?: boolean;
  payAtHotel?: boolean;
  nonSmoking?: boolean;
};

const BED_OPTIONS = ['Any', 'Double', 'Twin', 'Queen', 'King', 'Mixed'] as const;
// type của phần tử trong BED_OPTIONS
type BedOptionFromConst = (typeof BED_OPTIONS)[number];

// type guard để convert string -> BedOption an toàn
function isBedOption(v: string): v is BedOptionFromConst {
  return (BED_OPTIONS as readonly string[]).includes(v);
}

export default function RoomFilters({
  value,
  onChange,
}: {
  value: RoomFilterState;
  onChange: (v: RoomFilterState) => void;
}) {
  const toggle = (k: keyof RoomFilterState) => onChange({ ...value, [k]: !value[k] });

  return (
    <div className="mb-3 flex flex-wrap items-center gap-2">
      <select
        className="h-10 rounded-lg border px-3 text-sm"
        value={value.bed ?? 'Any'}
        onChange={(e) => {
          const v = e.target.value;
          // chỉ set nếu hợp lệ, fallback 'Any'
          onChange({ ...value, bed: isBedOption(v) ? v : 'Any' });
        }}
      >
        {BED_OPTIONS.map((o) => (
          <option key={o} value={o}>
            {o === 'Any' ? 'Mọi loại giường' : `Giường ${o}`}
          </option>
        ))}
      </select>

      <Check label="Bữa sáng" checked={!!value.breakfast} onChange={() => toggle('breakfast')} />
      <Check
        label="Miễn phí hủy"
        checked={!!value.freeCancel}
        onChange={() => toggle('freeCancel')}
      />
      <Check
        label="Thanh toán tại KS"
        checked={!!value.payAtHotel}
        onChange={() => toggle('payAtHotel')}
      />
      <Check
        label="Không hút thuốc"
        checked={!!value.nonSmoking}
        onChange={() => toggle('nonSmoking')}
      />
    </div>
  );
}

function Check({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border px-3 py-2 text-sm">
      <input type="checkbox" checked={checked} onChange={onChange} />
      {label}
    </label>
  );
}
