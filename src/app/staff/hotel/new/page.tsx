'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth } from '@/lib/auth';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:7142';

type HotelPayload = {
  name: string;
  address: string;
  city: string;
  country: string;
  description: string;
  stars: number;
};

function authHeaders(): HeadersInit {
  const { accessToken } = getAuth();
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
}

export default function CreateHotelPage() {
  const router = useRouter();
  const [f, setF] = useState<HotelPayload>({
    name: '',
    address: '',
    city: '',
    country: 'Vietnam',
    description: '',
    stars: 3,
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/Hotel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        credentials: 'include',
        body: JSON.stringify(f),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status} tạo Hotel thất bại`);
      const created = await res.json().catch(() => ({}) as { id?: string });
      router.push(created?.id ? `/hotel/${created.id}` : '/staff/hotel');
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Create failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-4 text-2xl font-bold">🏨 Tạo Hotel</h1>
      <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border bg-white p-5 shadow">
        <Field label="Tên khách sạn *">
          <input
            className="input"
            value={f.name}
            onChange={(e) => setF((s) => ({ ...s, name: e.target.value }))}
            required
          />
        </Field>
        <Field label="Địa chỉ *">
          <input
            className="input"
            value={f.address}
            onChange={(e) => setF((s) => ({ ...s, address: e.target.value }))}
            required
          />
        </Field>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Thành phố *">
            <input
              className="input"
              value={f.city}
              onChange={(e) => setF((s) => ({ ...s, city: e.target.value }))}
              required
            />
          </Field>
          <Field label="Quốc gia *">
            <input
              className="input"
              value={f.country}
              onChange={(e) => setF((s) => ({ ...s, country: e.target.value }))}
              required
            />
          </Field>
        </div>
        <Field label="Mô tả">
          <textarea
            className="input"
            rows={3}
            value={f.description}
            onChange={(e) => setF((s) => ({ ...s, description: e.target.value }))}
          />
        </Field>
        <Field label="Sao *">
          <input
            type="number"
            min={1}
            max={5}
            className="input"
            value={f.stars}
            onChange={(e) => setF((s) => ({ ...s, stars: Number(e.target.value) }))}
            required
          />
        </Field>

        {err && (
          <div className="rounded-md border border-red-200 bg-red-50 p-2 text-sm text-red-700">
            {err}
          </div>
        )}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white disabled:opacity-60"
          >
            {loading ? 'Đang tạo…' : 'Tạo Hotel'}
          </button>
          <button
            type="button"
            onClick={() => history.back()}
            className="rounded-lg border px-4 py-2"
          >
            Hủy
          </button>
        </div>
      </form>
      <style jsx global>{`
        .input {
          width: 100%;
          border: 1px solid #e5e7eb;
          border-radius: 0.75rem;
          padding: 0.5rem 0.75rem;
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1 text-sm text-zinc-700">{label}</div>
      {children}
    </label>
  );
}
