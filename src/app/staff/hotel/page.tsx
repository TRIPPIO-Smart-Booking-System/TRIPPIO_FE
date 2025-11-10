'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAuth } from '@/lib/auth';
import { Plus, Search, Trash2, Loader, ArrowLeft } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            href="/staff"
            className="inline-flex items-center gap-2 text-emerald-700 hover:text-emerald-800 font-medium transition-colors"
          >
            <ArrowLeft className="h-5 w-5" /> Quay lại
          </Link>
        </div>

        {/* Header */}
        <div className="flex items-start justify-between mb-8 gap-4">
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-emerald-900 mb-2">Quản lý Hotel</h1>
            <p className="text-emerald-700">Quản lý các khách sạn và phòng</p>
          </div>
          <Link
            href="/staff/hotel/new"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-lg font-semibold shadow-lg transition-colors whitespace-nowrap"
          >
            <Plus className="h-5 w-5" /> Tạo Hotel
          </Link>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-emerald-600/60" />
            <input
              type="text"
              placeholder="🔍 Tìm kiếm theo tên, thành phố, địa chỉ..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-lg border border-emerald-200 bg-white/60 text-emerald-900 placeholder-emerald-600/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Error */}
        {err && (
          <div className="mb-4 p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg">
            {err}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="flex items-center justify-center gap-3 py-16">
            <Loader className="h-6 w-6 animate-spin text-emerald-600" />
            <span className="text-emerald-700">Đang tải...</span>
          </div>
        ) : filtered.length ? (
          <div className="grid gap-4">
            {filtered.map((hotel) => (
              <div
                key={hotel.id}
                className="bg-white rounded-xl border border-emerald-200 p-6 hover:shadow-lg hover:border-emerald-300 transition-all group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-2xl font-bold text-emerald-900 group-hover:text-emerald-700 transition-colors">
                        {hotel.name}
                      </h2>
                      <span className="text-amber-500 text-lg">{'⭐'.repeat(hotel.stars)}</span>
                    </div>
                    <p className="text-emerald-700 text-sm mb-3">
                      📍 {hotel.address}, {hotel.city}, {hotel.country}
                    </p>
                    {hotel.description && (
                      <p className="text-emerald-800 text-sm mb-3 line-clamp-2">
                        {hotel.description}
                      </p>
                    )}
                    <p className="text-xs text-emerald-600/70">Tạo: {fmtDate(hotel.dateCreated)}</p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Link
                      href={`/staff/hotel/${hotel.id}/room`}
                      className="px-4 py-2 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 text-emerald-700 rounded-lg font-semibold text-sm transition-all whitespace-nowrap"
                    >
                      Quản lý Rooms
                    </Link>
                    <button
                      onClick={() => onDelete(hotel.id)}
                      className="px-4 py-2 bg-red-100 hover:bg-red-200 border border-red-300 text-red-700 rounded-lg font-semibold text-sm inline-flex items-center gap-1 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" /> Xóa
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-emerald-700 text-lg">Không có hotel nào</p>
          </div>
        )}
      </div>
    </div>
  );
}
