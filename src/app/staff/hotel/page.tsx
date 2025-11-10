'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAuth } from '@/lib/auth';
import { Plus, Search, Trash2, Loader } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:7142';

type ApiHotel = {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  description: string;
  stars: number;
  dateCreated: string;
};

function authHeaders(): HeadersInit {
  const { accessToken } = getAuth();
  return {
    'Content-Type': 'application/json',
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };
}

function fmtDate(d: string) {
  const n = new Date(d);
  return Number.isNaN(n.getTime()) ? d : n.toLocaleString('vi-VN');
}

export default function HotelManagePage() {
  const [hotels, setHotels] = useState<ApiHotel[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [q, setQ] = useState('');

  async function loadHotels() {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch(`${API_BASE}/api/Hotel`, {
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as ApiHotel[];
      setHotels(data);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Tải danh sách hotel thất bại');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadHotels();
  }, []);

  async function onDelete(id: string) {
    if (!confirm('Bạn chắc chắn muốn xóa?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/Hotel/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setHotels((prev) => prev.filter((h) => h.id !== id));
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Xóa thất bại');
    }
  }

  const filtered = hotels.filter(
    (h) =>
      h.name.toLowerCase().includes(q.toLowerCase()) ||
      h.city.toLowerCase().includes(q.toLowerCase()) ||
      h.address.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Quản lý Hotel</h1>
          <Link
            href="/staff/hotel/new"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            <Plus className="h-5 w-5" /> Tạo Hotel
          </Link>
        </div>

        {/* Search */}
        <div className="mb-6 flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, thành phố, địa chỉ..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Error */}
        {err && <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">{err}</div>}

        {/* Loading */}
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16">
            <Loader className="h-6 w-6 animate-spin text-blue-600" />
            <span className="text-slate-600">Đang tải...</span>
          </div>
        ) : filtered.length ? (
          <div className="grid gap-4">
            {filtered.map((hotel) => (
              <div
                key={hotel.id}
                className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-slate-900">{hotel.name}</h2>
                      <span className="text-amber-500">{'⭐'.repeat(hotel.stars)}</span>
                    </div>
                    <p className="text-sm text-slate-600 mt-1">
                      📍 {hotel.address}, {hotel.city}, {hotel.country}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/staff/hotel/${hotel.id}/room`}
                      className="px-3 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded font-medium text-sm"
                    >
                      Quản lý Rooms
                    </Link>
                    <button
                      onClick={() => onDelete(hotel.id)}
                      className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded font-medium text-sm inline-flex items-center gap-1"
                    >
                      <Trash2 className="h-4 w-4" /> Xóa
                    </button>
                  </div>
                </div>
                {hotel.description && (
                  <p className="text-slate-600 text-sm mb-2">{hotel.description}</p>
                )}
                <p className="text-xs text-slate-500">Tạo: {fmtDate(hotel.dateCreated)}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-slate-500 text-lg">Không có hotel nào</p>
          </div>
        )}
      </div>
    </div>
  );
}
