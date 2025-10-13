'use client';

import { useState } from 'react';
import { Mail, Plus } from 'lucide-react';
import Button from '@/components/ui/Button';
import AddEmailModal from './AddEmailModal';

export type Email = { id: number; address: string; primary?: boolean; verified?: boolean };

export default function EmailList({
  emails,
  onAdd,
  onMakePrimary,
  onRemove,
}: {
  emails: Email[];
  onAdd: (address: string) => void;
  onMakePrimary: (id: number) => void;
  onRemove: (id: number) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="mb-3 flex justify-end">
        <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
          <Plus className="mr-1 h-4 w-4" /> Thêm email
        </Button>
      </div>

      <ul className="divide-y">
        {emails.map((e) => (
          <li key={e.id} className="flex items-center justify-between gap-3 py-3">
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-muted">
                <Mail className="h-4 w-4" />
              </div>
              <div>
                <div className="text-sm font-medium">{e.address}</div>
                <div className="text-xs text-muted-foreground">
                  {e.primary ? 'Email chính' : 'Email phụ'} ·{' '}
                  {e.verified ? 'Đã xác thực' : 'Chưa xác thực'}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!e.primary && (
                <Button variant="outline" size="sm" onClick={() => onMakePrimary(e.id)}>
                  Đặt làm chính
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={() => onRemove(e.id)}>
                Gỡ
              </Button>
            </div>
          </li>
        ))}
      </ul>

      <AddEmailModal open={open} onClose={() => setOpen(false)} onSubmit={onAdd} />
    </>
  );
}
