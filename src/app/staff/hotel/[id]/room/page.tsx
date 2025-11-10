'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getAuth } from '@/lib/auth';
import { Plus, ArrowLeft, Trash2, Loader } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:7142';

type ApiHotel = {
  id: string;
  name: string;
  city: string;
};

type ApiRoom = {
  id: string;
  hotelId: string;
  roomType: string;
  capacity: number;
  pricePerNight: number;
  availableRooms: number;
  dateCreated: string;
};

function authHeaders(): HeadersInit {
  const { accessToken } = getAuth();
  return {
    'Content-Type': 'application/json',
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };
}

function fmtVND(n: number) {
  return n.toLocaleString('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  });
}

function fmtDate(d: string) {
  const n = new Date(d);
  return Number.isNaN(n.getTime()) ? d : n.toLocaleString('vi-VN');
}

export default function HotelRoomsPage() {
  const params = useParams();
  const hotelId = params.id as string;

  const [hotel, setHotel] = useState<ApiHotel | null>(null);
  const [rooms, setRooms] = useState<ApiRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [q, setQ] = useState('');

  async function loadHotel() {
    try {
      const res = await fetch(`${API_BASE}/api/Hotel/${hotelId}`, {
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as ApiHotel;
      setHotel(data);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Tải hotel thất bại');
    }
  }

  async function loadRooms() {
    if (!hotelId) return;
    try {
      const res = await fetch(`${API_BASE}/api/Room/hotel/${hotelId}`, {
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as ApiRoom[];
      setRooms(data);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Tải danh sách room thất bại');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadHotel();
    loadRooms();
  }, [hotelId]);

  async function onDelete(id: string) {
    if (!confirm('Bạn chắc chắn muốn xóa?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/Room/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setRooms((prev) => prev.filter((r) => r.id !== id));
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Xóa thất bại');
    }
  }

  const filtered = rooms.filter((r) => r.roomType.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            href="/staff/hotel"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white font-medium transition-colors"
          >
            <ArrowLeft className="h-5 w-5" /> Quay lại danh sách hotel
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-white mb-2">Quản lý Phòng</h1>
              {hotel && (
                <p className="text-blue-200">
                  <span className="font-semibold text-white">{hotel.name}</span> • {hotel.city}
                </p>
              )}
            </div>
            {hotelId && (
              <Link
                href={`/staff/hotel/${hotelId}/room/new`}
                className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-5 py-3 rounded-lg font-semibold shadow-lg transition-colors whitespace-nowrap"
              >
                <Plus className="h-5 w-5" /> Tạo Room
              </Link>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="🔍 Tìm kiếm theo loại phòng..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-blue-300/30 bg-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white/20 transition-all backdrop-blur"
          />
        </div>

        {/* Error */}
        {err && (
          <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 text-red-200 rounded-lg backdrop-blur">
            {err}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="flex items-center justify-center gap-3 py-16">
            <Loader className="h-6 w-6 animate-spin text-blue-400" />
            <span className="text-blue-200">Đang tải...</span>
          </div>
        ) : filtered.length ? (
          <div className="grid gap-4">
            {filtered.map((room) => (
              <div
                key={room.id}
                className="bg-white/10 backdrop-blur border border-white/20 rounded-xl p-6 hover:bg-white/15 hover:border-white/30 transition-all shadow-lg group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-white mb-3 group-hover:text-blue-200 transition-colors">
                      {room.roomType}
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                        <p className="text-white/60 text-sm font-medium">Sức chứa</p>
                        <p className="font-bold text-white text-lg">{room.capacity} người</p>
                      </div>
                      <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                        <p className="text-white/60 text-sm font-medium">Phòng còn</p>
                        <p className="font-bold text-white text-lg">{room.availableRooms}</p>
                      </div>
                      <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                        <p className="text-white/60 text-sm font-medium">Giá/đêm</p>
                        <p className="font-bold text-blue-300 text-lg">
                          {fmtVND(room.pricePerNight)}
                        </p>
                      </div>
                      <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                        <p className="text-white/60 text-sm font-medium">Tạo lúc</p>
                        <p className="font-semibold text-white/80 text-sm">
                          {fmtDate(room.dateCreated).split(' ')[0]}
                        </p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => onDelete(room.id)}
                    className="px-4 py-2 bg-red-500/20 hover:bg-red-500/40 border border-red-500/50 text-red-200 rounded-lg font-semibold inline-flex items-center gap-2 transition-colors whitespace-nowrap"
                  >
                    <Trash2 className="h-4 w-4" /> Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-white/60 text-lg">Không có room nào</p>
          </div>
        )}
      </div>
    </div>
  );
}
