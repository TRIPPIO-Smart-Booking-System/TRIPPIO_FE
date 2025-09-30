'use client';

import { useState } from 'react';
import { Smartphone, Plus } from 'lucide-react';
import Button from '@/components/ui/Button';
import AddPhoneModal from '@/components/modal/AddPhoneModal';

export type Phone = { id: number; number: string };

export default function PhoneList({
  phones,
  onAdd,
  onRemove,
}: {
  phones: Phone[];
  onAdd: (number: string) => void;
  onRemove: (id: number) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="mb-3 flex justify-end">
        <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
          <Plus className="mr-1 h-4 w-4" /> Thêm số di động
        </Button>
      </div>

      {phones.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Chưa có số điện thoại. Thêm số để nhận thông báo nhanh hơn.
        </p>
      ) : (
        <ul className="divide-y">
          {phones.map((p) => (
            <li key={p.id} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-full bg-muted">
                  <Smartphone className="h-4 w-4" />
                </div>
                <div className="text-sm font-medium">{p.number}</div>
              </div>
              <Button variant="outline" size="sm" onClick={() => onRemove(p.id)}>
                Gỡ
              </Button>
            </li>
          ))}
        </ul>
      )}

      <AddPhoneModal open={open} onClose={() => setOpen(false)} onSubmit={onAdd} />
    </>
  );
}
