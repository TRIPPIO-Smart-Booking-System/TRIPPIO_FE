import { ReactNode } from 'react';

export default function SectionCard({
  title,
  children,
  actions,
  subtitle,
}: {
  title: string;
  children: ReactNode;
  actions?: ReactNode;
  subtitle?: string;
}) {
  return (
    <div className="w-full rounded-xl border bg-white p-4 sm:p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-base font-semibold">{title}</h3>
        {actions && <div className="shrink-0">{actions}</div>}
      </div>
      {subtitle && <div className="text-sm text-gray-500">{subtitle}</div>}
      {children}
    </div>
  );
}
