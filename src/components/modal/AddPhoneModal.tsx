'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';

export default function AddPhoneModal({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (phone: string) => void;
}) {
  const [phone, setPhone] = useState('');
  useEffect(() => {
    if (open) setPhone('');
  }, [open]);

  const handleSubmit = () => {
    if (!phone || phone.length < 8) return alert('Số điện thoại không hợp lệ');
    onSubmit(phone);
    onClose();
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-4 shadow-lg">
        <h3 className="mb-3 text-lg font-semibold">Thêm số di động</h3>
        <input
          className="h-10 w-full rounded-lg border px-3 text-sm"
          placeholder="09xx xxx xxx"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button onClick={handleSubmit}>Thêm</Button>
        </div>
      </div>
    </div>
  );
}
