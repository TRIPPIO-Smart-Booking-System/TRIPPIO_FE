'use client';

import Button from '@/components/ui/Button';
import { Link2 } from 'lucide-react';

export type Linked = { id: string; name: string; connected: boolean };

export default function LinkedProviders({ providers }: { providers: Linked[] }) {
  return (
    <ul className="divide-y">
      {providers.map((p) => (
        <li key={p.id} className="flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-muted">
              <Link2 className="h-4 w-4" />
            </div>
            <div className="text-sm">
              <div className="font-medium">{p.name}</div>
              <div className="text-xs text-muted-foreground">
                {p.connected ? 'Đã liên kết' : 'Chưa liên kết'}
              </div>
            </div>
          </div>
          {p.connected ? (
            <Button variant="outline" size="sm">
              Huỷ liên kết
            </Button>
          ) : (
            <Button size="sm">Liên kết</Button>
          )}
        </li>
      ))}
    </ul>
  );
}
