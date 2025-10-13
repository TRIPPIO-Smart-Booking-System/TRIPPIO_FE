'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';

export default function AddEmailModal({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (email: string) => void;
}) {
  const [email, setEmail] = useState('');
  useEffect(() => {
    if (open) setEmail('');
  }, [open]);

  const handleSubmit = () => {
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) return alert('Email không hợp lệ');
    onSubmit(email);
    onClose();
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-4 shadow-lg">
        <h3 className="mb-3 text-lg font-semibold">Thêm email</h3>
        <input
          className="h-10 w-full rounded-lg border px-3 text-sm"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
