// src/app/staff/transport/new/page.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth } from '@/lib/auth';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:7142';

type ApiTransport = {
  id: string;
  transportType: string; // Airline | Train | Bus | ...
  name: string;
  dateCreated: string;
  modifiedDate: string | null;
};

type CreateTransportDto = {
  transportType: string;
  name: string;
};

function authHeaders(): HeadersInit {
  const { accessToken } = getAuth();
  return {
    'Content-Type': 'application/json',
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };
}
function errMsg(e: unknown): string {
  if (e instanceof Error) return e.message;
  return 'Đã xảy ra lỗi';
}

export default function TransportCreatePage() {
  const router = useRouter();

  const [tType, setTType] = useState<'Airline' | 'Train' | 'Bus'>('Airline');
  const [tName, setTName] = useState('');
  const [creating, setCreating] = useState(false);
  const [okMsg, setOkMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const canSubmit = useMemo(() => !!tName.trim() && !creating, [tName, creating]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit) return;
    setCreating(true);
    setOkMsg(null);
    setErr(null);
    try {
      const dto: CreateTransportDto = { transportType: tType, name: tName.trim() };
      const res = await fetch(`${API_BASE}/api/Transport`, {
        method: 'POST',
        headers: authHeaders(),
        credentials: 'include',
        body: JSON.stringify(dto),
      });
      if (!res.ok) throw new Error(await res.text().catch(() => `HTTP ${res.status}`));
      const created: ApiTransport = await res.json();

      setOkMsg('Tạo Transport thành công! Đang chuyển đến màn tạo Trip…');
      // chuyển sang màn tạo trip cho transport vừa tạo
      setTimeout(() => {
        router.replace(`/staff/transport/${created.id}/trip/new`);
        router.refresh();
      }, 600);
    } catch (e: unknown) {
      setErr(errMsg(e));
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="relative min-h-screen w-full overflow-x-clip">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 bg-gradient-to-b from-sky-100/60 via-teal-100/40 to-transparent"
      />
      <div className="mx-auto w-full max-w-3xl px-4 pb-16 pt-8">
        <header className="mb-5">
          <div className="rounded-3xl border border-white/60 bg-white/90 p-5 shadow-xl backdrop-blur">
            <h1 className="text-2xl font-extrabold tracking-tight text-sky-800">
              ➕ Tạo Transport
            </h1>
            <p className="mt-1 text-sky-900/80">
              Bước 1/2 – Tạo hãng/tuyến (Airline/Train/Bus). Sau khi tạo, bạn sẽ được chuyển sang
              màn tạo chuyến (Trip).
            </p>
          </div>
        </header>

        <form
          onSubmit={onSubmit}
          className="space-y-4 rounded-2xl border border-white/60 bg-white/90 p-5 shadow backdrop-blur"
        >
          <div>
            <label className="mb-1 block text-sm text-slate-700">Loại *</label>
            <select
              value={tType}
              onChange={(e) => setTType(e.target.value as 'Airline' | 'Train' | 'Bus')}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white/95 px-3 outline-none focus:ring-2 focus:ring-sky-300"
            >
              <option value="Airline">Airline</option>
              <option value="Train">Train</option>
              <option value="Bus">Bus</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm text-slate-700">Tên hãng/tuyến *</label>
            <input
              className="h-11 w-full rounded-xl border border-slate-200 bg-white/95 px-3 outline-none focus:ring-2 focus:ring-sky-300"
              placeholder="VD: Vietnam Airlines, Phuong Trang Bus…"
              value={tName}
              onChange={(e) => setTName(e.target.value)}
              required
            />
          </div>

          {err && (
            <div className="rounded-xl border border-red-200/60 bg-red-50/80 px-3 py-2 text-sm text-red-700">
              {err}
            </div>
          )}
          {okMsg && (
            <div className="rounded-xl border border-emerald-200/60 bg-emerald-50/80 px-3 py-2 text-sm text-emerald-700">
              {okMsg}
            </div>
          )}

          <div className="flex items-center gap-2 pt-1">
            <button
              type="submit"
              disabled={!canSubmit}
              className="rounded-xl bg-sky-600 px-4 py-2 font-semibold text-white hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {creating ? 'Đang tạo…' : 'Tạo Transport'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/staff/transport')}
              className="rounded-xl border border-sky-200 bg-white px-4 py-2 font-semibold text-sky-700 hover:bg-sky-50"
            >
              Về trang quản lý
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
