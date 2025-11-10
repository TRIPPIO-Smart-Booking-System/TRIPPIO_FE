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
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4 mb-6">
          <Link
            href="/staff/hotel"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            <ArrowLeft className="h-5 w-5" /> Quay lại
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Quản lý Room</h1>
            {hotel && (
              <p className="text-slate-500">
                Hotel: <span className="font-semibold text-slate-900">{hotel.name}</span> (
                {hotel.city})
              </p>
            )}
          </div>
        </div>

        {/* Create Button */}
        {hotelId && (
          <div className="mb-6 flex justify-end">
            <Link
              href={`/staff/hotel/${hotelId}/room/new`}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
            >
              <Plus className="h-5 w-5" /> Tạo Room
            </Link>
          </div>
        )}

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Tìm kiếm theo loại phòng..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
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
            {filtered.map((room) => (
              <div
                key={room.id}
                className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-slate-900 mb-2">{room.roomType}</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-slate-500">Sức chứa</p>
                        <p className="font-semibold text-slate-900">{room.capacity} người</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Phòng còn</p>
                        <p className="font-semibold text-slate-900">{room.availableRooms}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Giá/đêm</p>
                        <p className="font-semibold text-emerald-600">
                          {fmtVND(room.pricePerNight)}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500">Tạo</p>
                        <p className="text-xs text-slate-600">
                          {fmtDate(room.dateCreated).split(' ')[0]}
                        </p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => onDelete(room.id)}
                    className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded font-medium text-sm inline-flex items-center gap-1"
                  >
                    <Trash2 className="h-4 w-4" /> Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-slate-500 text-lg">Không có room nào</p>
          </div>
        )}
      </div>
    </div>
  );
}
