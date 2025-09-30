'use client';

import Link from 'next/link';

type Crumb = { href?: string; label: string };

export default function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav
      className="mb-4 flex items-center gap-2 text-sm text-muted-foreground"
      aria-label="Breadcrumb"
      itemScope
      itemType="https://schema.org/BreadcrumbList"
    >
      {items.map((c, i) => (
        <span
          key={i}
          className="flex items-center gap-2"
          itemProp="itemListElement"
          itemScope
          itemType="https://schema.org/ListItem"
        >
          {c.href ? (
            <Link href={c.href} className="hover:text-foreground" itemProp="item">
              <span itemProp="name">{c.label}</span>
            </Link>
          ) : (
            <span className="text-foreground" itemProp="name">
              {c.label}
            </span>
          )}
          <meta itemProp="position" content={String(i + 1)} />
          {i < items.length - 1 && <span>/</span>}
        </span>
      ))}
    </nav>
  );
}
