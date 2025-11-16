'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, Loader2, AlertCircle, CheckCircle2, Package } from 'lucide-react';
import Container from '@/components/layout/Container';
import Footer from '@/components/layout/Footer';
import { formatVietnamDateTime } from '@/lib/timezone';

type ApiOrderItem = {
  id: number;
  orderId: number;
  bookingId: string;
  bookingName: string;
  quantity: number;
  price: number;
};

type ApiOrder = {
  id: number;
  userId: string;
  orderDate: string; // ISO
  totalAmount: number;
  orderItems: ApiOrderItem[];
  status: string; // e.g. Confirmed
};

function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(iso?: string): string {
  if (!iso) return '';
  return formatVietnamDateTime(iso, 'vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getStatusColor(status?: string): string {
  if (!status) return 'bg-gray-100 text-gray-700';
  const s = status.toLowerCase();
  if (s.includes('confirmed') || s.includes('success') || s.includes('paid')) {
    return 'bg-green-100 text-green-700';
  } else if (s.includes('pending')) {
    return 'bg-yellow-100 text-yellow-700';
  } else if (s.includes('failed') || s.includes('cancelled')) {
    return 'bg-red-100 text-red-700';
  }
  return 'bg-gray-100 text-gray-700';
}

function getStatusIcon(status?: string) {
  if (!status) return null;
  const s = status.toLowerCase();
  if (s.includes('confirmed') || s.includes('success') || s.includes('paid')) {
    return <CheckCircle2 className="w-5 h-5" />;
  } else if (s.includes('pending')) {
    return <Package className="w-5 h-5" />;
  } else if (s.includes('failed') || s.includes('cancelled')) {
    return <AlertCircle className="w-5 h-5" />;
  }
  return null;
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<ApiOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) return;

    async function loadOrder() {
      try {
        setLoading(true);
        setError(null);

        const token =
          typeof window !== 'undefined'
            ? localStorage.getItem('accessToken') || localStorage.getItem('authToken')
            : null;

        const headers = new Headers({
          'Content-Type': 'application/json',
        });

        if (token) {
          headers.set('Authorization', `Bearer ${token}`);
        }

        const res = await fetch(`https://trippiowebapp.azurewebsites.net/api/Order/${orderId}`, {
          method: 'GET',
          headers,
          credentials: 'include',
        });

        if (!res.ok) {
          if (res.status === 401) {
            setError('Bạn cần đăng nhập để xem đơn hàng');
          } else if (res.status === 404) {
            setError('Không tìm thấy đơn hàng');
          } else {
            setError(`Lỗi tải dữ liệu: ${res.status}`);
          }
          return;
        }

        const data = (await res.json()) as ApiOrder;
        setOrder(data);
      } catch (err) {
        console.error('Failed to load order:', err);
        setError('Không thể tải thông tin đơn hàng');
      } finally {
        setLoading(false);
      }
    }

    loadOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <Container>
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">Đang tải thông tin đơn hàng...</p>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <Container>
          <div className="py-12">
            <Link
              href="/payment"
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
            >
              <ChevronLeft className="w-4 h-4" />
              Quay lại
            </Link>

            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Lỗi</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <Link href="/payment">
                <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition">
                  Quay lại trang đơn hàng
                </button>
              </Link>
            </div>
          </div>
        </Container>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <Container>
          <div className="py-12">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-center text-gray-600">Không tìm thấy đơn hàng</p>
          </div>
        </Container>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12">
      <Container>
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/payment"
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
          >
            <ChevronLeft className="w-4 h-4" />
            Quay lại danh sách đơn hàng
          </Link>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Đơn hàng #{order.id}</h1>
                <p className="text-gray-600 mt-2">{formatDate(order.orderDate)}</p>
              </div>

              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold ${getStatusColor(order.status)}`}
              >
                {getStatusIcon(order.status)}
                <span>{order.status || 'Unknown'}</span>
              </div>
            </div>

            {/* Order Items */}
            <div className="border-t pt-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Chi tiết đơn hàng</h2>
              <div className="space-y-3">
                {order.orderItems && order.orderItems.length > 0 ? (
                  order.orderItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-semibold text-slate-900">{item.bookingName}</p>
                        <p className="text-sm text-gray-600">
                          {item.bookingId} · Số lượng: {item.quantity}
                        </p>
                      </div>
                      <p className="font-bold text-lg text-blue-600">
                        {formatVND(item.price * item.quantity)}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600">Không có mục nào</p>
                )}
              </div>
            </div>

            {/* Total */}
            <div className="border-t mt-6 pt-6 flex justify-end">
              <div className="text-right">
                <p className="text-gray-600 mb-2">Tổng cộng</p>
                <p className="text-4xl font-bold text-blue-600">{formatVND(order.totalAmount)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 justify-center">
          <Link href="/payment">
            <button className="px-6 py-3 bg-gray-200 text-slate-900 rounded-lg font-semibold hover:bg-gray-300 transition">
              Xem đơn hàng khác
            </button>
          </Link>
          <Link href="/homepage">
            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition">
              Tiếp tục mua sắm
            </button>
          </Link>
        </div>
      </Container>

      <Footer />
    </div>
  );
}
