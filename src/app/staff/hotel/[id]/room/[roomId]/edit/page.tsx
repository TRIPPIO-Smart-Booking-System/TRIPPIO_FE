'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getAuth } from '@/lib/auth';
import { ArrowLeft, Loader } from 'lucide-react';
import { showSuccess, showError } from '@/lib/toast';

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
};

function authHeaders(): HeadersInit {
  const { accessToken } = getAuth();
  return {
    'Content-Type': 'application/json',
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };
}

export default function EditRoomPage() {
  const params = useParams();
  const router = useRouter();
  const hotelId = params.id as string;
  const roomId = params.roomId as string;

  const [hotel, setHotel] = useState<ApiHotel | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [form, setForm] = useState({
    roomType: '',
    capacity: '',
    pricePerNight: '',
    availableRooms: '',
  });

  useEffect(() => {
    if (hotelId && roomId) {
      Promise.all([loadHotel(), loadRoom()]);
    }
  }, [hotelId, roomId]);

  async function loadHotel() {
    try {
      const res = await fetch(`${API_BASE}/api/Hotel/${hotelId}`, {
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as ApiHotel;
      setHotel(data);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Tải hotel thất bại';
      setErr(msg);
      showError(`Lỗi: ${msg}`);
    }
  }

  async function loadRoom() {
    try {
      const res = await fetch(`${API_BASE}/api/Room/${roomId}`, {
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as ApiRoom;
      setForm({
        roomType: data.roomType,
        capacity: String(data.capacity),
        pricePerNight: String(data.pricePerNight),
        availableRooms: String(data.availableRooms),
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Tải phòng thất bại';
      setErr(msg);
      showError(`Lỗi: ${msg}`);
    } finally {
      setLoading(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setErr(null);

    const body = {
      hotelId,
      roomType: form.roomType,
      capacity: parseInt(form.capacity, 10),
      pricePerNight: parseFloat(form.pricePerNight),
      availableRooms: parseInt(form.availableRooms, 10),
    };

    try {
      const res = await fetch(`${API_BASE}/api/Room/${roomId}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || `HTTP ${res.status}`);
      }

      showSuccess('Đã cập nhật phòng thành công');
      setTimeout(() => {
        router.push(`/staff/hotel/${hotelId}/room`);
      }, 500);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Sửa phòng thất bại';
      setErr(msg);
      showError(`Lỗi sửa phòng: ${msg}`);
    } finally {
      setSubmitting(false);
    }
  }

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
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link
            href={`/staff/hotel/${hotelId}/room`}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            <ArrowLeft className="h-5 w-5" /> Quay lại
          </Link>
          <h1 className="text-3xl font-bold text-slate-900">✏️ Sửa Phòng</h1>
        </div>

        {/* Hotel Info */}
        {hotel && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-slate-600">Hotel:</p>
            <p className="text-lg font-semibold text-slate-900">
              {hotel.name} ({hotel.city})
            </p>
          </div>
        )}

        {/* Error */}
        {err && <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">{err}</div>}

        {/* Form */}
        <form onSubmit={onSubmit} className="bg-white rounded-lg border border-slate-200 p-6">
          {/* Room Type */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Loại Phòng <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              placeholder="VD: Phòng đơn, Phòng đôi, Suite..."
              value={form.roomType}
              onChange={(e) => setForm({ ...form, roomType: e.target.value })}
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Capacity */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Sức Chứa (số người) <span className="text-red-600">*</span>
            </label>
            <input
              type="number"
              min="1"
              placeholder="VD: 2"
              value={form.capacity}
              onChange={(e) => setForm({ ...form, capacity: e.target.value })}
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Price Per Night */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Giá/Đêm (VND) <span className="text-red-600">*</span>
            </label>
            <input
              type="number"
              min="0"
              step="1000"
              placeholder="VD: 500000"
              value={form.pricePerNight}
              onChange={(e) => setForm({ ...form, pricePerNight: e.target.value })}
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Available Rooms */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Số Phòng Còn Trống <span className="text-red-600">*</span>
            </label>
            <input
              type="number"
              min="0"
              placeholder="VD: 10"
              value={form.availableRooms}
              onChange={(e) => setForm({ ...form, availableRooms: e.target.value })}
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium rounded-lg inline-flex items-center justify-center gap-2"
            >
              {submitting && <Loader className="h-5 w-5 animate-spin" />}
              {submitting ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-900 font-medium rounded-lg"
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
