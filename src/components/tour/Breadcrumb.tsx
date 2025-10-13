'use client';

type Crumb = { href?: string; label: string };

export default function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
      {items.map((c, i) => (
        <span key={i} className="flex items-center gap-2">
          {c.href ? (
            <a href={c.href} className="hover:text-foreground">
              {c.label}
            </a>
          ) : (
            <span className="text-foreground">{c.label}</span>
          )}
          {i < items.length - 1 && <span>/</span>}
        </span>
      ))}
    </nav>
  );
}
