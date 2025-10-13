'use client';

import React from 'react';

export default function BadgeTab({
  active,
  icon,
  children,
  onClick,
}: {
  active: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium
${active ? 'bg-white text-slate-900' : 'bg-white/20 text-white hover:bg-white/30'}`}
    >
      {icon}
      {children}
    </button>
  );
}
