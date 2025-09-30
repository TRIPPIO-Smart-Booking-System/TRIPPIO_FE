import { ReactNode } from 'react';

export default function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label className="grid gap-1 sm:grid-cols-[180px_1fr] sm:items-center">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="space-y-1">
        {children}
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
    </label>
  );
}
