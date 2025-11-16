'use client';

import { useState, useEffect, type ReactNode } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getAuth } from '@/lib/auth';
import { showSuccess, showError } from '@/lib/toast';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:7142';

type HotelPayload = {
  name: string;
  address: string;
  city: string;
  country: string;
  description: string;
  stars: number;
};

type ApiHotel = HotelPayload & {
  id: string;
  dateCreated: string;
};

function authHeaders(): HeadersInit {
  const { accessToken } = getAuth();
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
}

export default function EditHotelPage() {
  const router = useRouter();
  const params = useParams();
  const hotelId = params.id as string;

  const [f, setF] = useState<HotelPayload>({
    name: '',
    address: '',
    city: '',
    country: 'Vietnam',
    description: '',
    stars: 3,
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (hotelId) {
      loadHotel();
    }
  }, [hotelId]);

  async function loadHotel() {
    try {
      const res = await fetch(`${API_BASE}/api/Hotel/${hotelId}`, {
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status} - Tải hotel thất bại`);
      const data = (await res.json()) as ApiHotel;
      setF({
        name: data.name,
        address: data.address,
        city: data.city,
        country: data.country,
        description: data.description,
        stars: data.stars,
      });
      setErr(null);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Tải hotel thất bại';
      setErr(msg);
      showError(`Lỗi: ${msg}`);
    } finally {
      setLoading(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/Hotel/${hotelId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        credentials: 'include',
        body: JSON.stringify(f),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status} - Sửa hotel thất bại`);
      showSuccess('Đã cập nhật hotel thành công');
      setTimeout(() => {
        router.push('/staff/hotel');
      }, 500);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Sửa hotel thất bại';
      setErr(msg);
      showError(`Lỗi sửa hotel: ${msg}`);
    } finally {
      setSubmitting(false);
    }
  }

  const inputCls =
    'w-full border border-zinc-200 rounded-2xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent';

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-r-transparent"></div>
          <span>Đang tải...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <div className="mb-6">
        <Link
          href="/staff/hotel"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
        >
          <ArrowLeft className="h-5 w-5" /> Quay lại danh sách
        </Link>
      </div>

      <h1 className="mb-4 text-2xl font-bold">✏️ Sửa Hotel</h1>
      <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border bg-white p-5 shadow">
        <Field label="Tên khách sạn *">
          <input
            className={inputCls}
            value={f.name}
            onChange={(e) => setF((s) => ({ ...s, name: e.target.value }))}
            required
          />
        </Field>

        <Field label="Địa chỉ *">
          <input
            className={inputCls}
            value={f.address}
            onChange={(e) => setF((s) => ({ ...s, address: e.target.value }))}
            required
          />
        </Field>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Thành phố *">
            <input
              className={inputCls}
              value={f.city}
              onChange={(e) => setF((s) => ({ ...s, city: e.target.value }))}
              required
            />
          </Field>
          <Field label="Quốc gia *">
            <input
              className={inputCls}
              value={f.country}
              onChange={(e) => setF((s) => ({ ...s, country: e.target.value }))}
              required
            />
          </Field>
        </div>

        <Field label="Mô tả">
          <textarea
            className={inputCls}
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
            className={inputCls}
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
            disabled={submitting}
            className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white disabled:opacity-60 hover:bg-blue-700 transition-colors"
          >
            {submitting ? 'Đang lưu…' : 'Lưu thay đổi'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-lg border px-4 py-2 hover:bg-slate-50 transition-colors"
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1 text-sm text-zinc-700">{label}</div>
      {children}
    </label>
  );
}
