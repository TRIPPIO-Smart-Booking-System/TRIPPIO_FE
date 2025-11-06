'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getAuth } from '@/lib/auth';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:7142';

type ApiHotel = {
  id: string;
  name: string;
  city: string;
  country: string;
};

type RoomPayload = {
  hotelId: string;
  roomType: string;
  pricePerNight: number;
  capacity: number;
  availableRooms: number;
};

function authHeaders(): HeadersInit {
  const { accessToken } = getAuth();
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
}

export default function CreateRoomPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const hotelIdFromQuery = sp?.get('hotelId') || '';

  const [hotels, setHotels] = useState<ApiHotel[]>([]);
  const [loadingHotels, setLoadingHotels] = useState(true);

  const [f, setF] = useState<RoomPayload>({
    hotelId: hotelIdFromQuery,
    roomType: '',
    pricePerNight: 0,
    capacity: 2,
    availableRooms: 1,
  });

  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoadingHotels(true);
        const res = await fetch(`${API_BASE}/api/Hotel`, {
          cache: 'no-store',
          credentials: 'include',
          headers: authHeaders(),
        });
        if (!res.ok) throw new Error(`Hotel HTTP ${res.status}`);
        const data = (await res.json()) as ApiHotel[];
        setHotels(Array.isArray(data) ? data : []);
      } catch (e) {
        setHotels([]);
      } finally {
        setLoadingHotels(false);
      }
    })();
  }, []);

  const selectedHotel = useMemo(() => hotels.find((h) => h.id === f.hotelId), [hotels, f.hotelId]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!f.hotelId) return setErr('Vui lòng chọn khách sạn (hotelId).');
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/Room`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        credentials: 'include',
        body: JSON.stringify({
          hotelId: f.hotelId,
          roomType: f.roomType.trim(),
          pricePerNight: Number(f.pricePerNight),
          capacity: Number(f.capacity),
          availableRooms: Number(f.availableRooms),
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status} tạo Room thất bại`);
      const created = await res.json().catch(() => ({}) as { id?: string });
      router.push(created?.id ? `/hotel/${f.hotelId}?room=${created.id}` : `/staff/room`);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Create failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-4 text-2xl font-bold">🛏️ Tạo Room</h1>
      <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border bg-white p-5 shadow">
        <Field label="Hotel *">
          <select
            className="input"
            value={f.hotelId}
            onChange={(e) => setF((s) => ({ ...s, hotelId: e.target.value }))}
            required
            disabled={loadingHotels}
          >
            <option value="">{loadingHotels ? 'Đang tải…' : '— Chọn khách sạn —'}</option>
            {hotels.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name} — {h.city}, {h.country}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Hạng phòng (roomType) *">
          <input
            className="input"
            value={f.roomType}
            onChange={(e) => setF((s) => ({ ...s, roomType: e.target.value }))}
            required
          />
        </Field>

        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Giá/đêm (VND) *">
            <input
              type="number"
              min={0}
              className="input"
              value={f.pricePerNight}
              onChange={(e) => setF((s) => ({ ...s, pricePerNight: Number(e.target.value) }))}
              required
            />
          </Field>
          <Field label="Sức chứa *">
            <input
              type="number"
              min={1}
              className="input"
              value={f.capacity}
              onChange={(e) => setF((s) => ({ ...s, capacity: Number(e.target.value) }))}
              required
            />
          </Field>
          <Field label="Số phòng còn *">
            <input
              type="number"
              min={0}
              className="input"
              value={f.availableRooms}
              onChange={(e) => setF((s) => ({ ...s, availableRooms: Number(e.target.value) }))}
              required
            />
          </Field>
        </div>

        {selectedHotel && (
          <div className="rounded-md border border-emerald-200 bg-emerald-50 p-2 text-xs text-emerald-700">
            Sẽ gán cho: <b>{selectedHotel.name}</b> — {selectedHotel.city}, {selectedHotel.country}
          </div>
        )}

        {err && (
          <div className="rounded-md border border-red-200 bg-red-50 p-2 text-sm text-red-700">
            {err}
          </div>
        )}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white disabled:opacity-60"
          >
            {submitting ? 'Đang tạo…' : 'Tạo Room'}
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
