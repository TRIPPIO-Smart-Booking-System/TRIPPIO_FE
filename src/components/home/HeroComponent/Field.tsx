'use client';
import React from 'react';

export default function Field({
  label,
  children,
  className = '',
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`flex w-full min-w-0 flex-col gap-1 ${className}`}>
      <span className="text-xs text-slate-600">{label}</span>
      <div className="min-w-0">{children}</div>
    </label>
  );
}
