'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { showError, showLoading, showSuccess } from '@/lib/toast';

interface Review {
  reviewId: number;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
  orderId: number;
}

export default function MyReviewsPage() {
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);

  useEffect(() => {
    fetchMyReviews();
  }, []);

  const fetchMyReviews = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      if (!token) {
        showError('Vui lòng đăng nhập để xem đánh giá của bạn');
        router.push('/login');
        return;
      }

      const response = await fetch('/api/review/my-reviews', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setReviews(data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      showError('Không thể tải danh sách đánh giá của bạn');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) {
      return;
    }

    try {
      setDeleteLoading(reviewId);
      const token = localStorage.getItem('token');

      const response = await fetch(`/api/review/${reviewId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Lỗi khi xóa đánh giá');
      }

      showSuccess('Xóa đánh giá thành công');
      setReviews(reviews.filter((r) => r.reviewId !== reviewId));
    } catch (error) {
      console.error('Error deleting review:', error);
      showError('Không thể xóa đánh giá. Vui lòng thử lại.');
    } finally {
      setDeleteLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Đánh giá của tôi</h1>
        <p className="text-gray-600">Quản lý tất cả các đánh giá của bạn</p>
      </div>

      {reviews.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-12 text-center">
          <p className="text-gray-500 mb-4">Bạn chưa có đánh giá nào</p>
          <button
            onClick={() => router.push('/')}
            className="text-blue-500 hover:text-blue-700 font-medium"
          >
            Quay lại trang chủ
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {reviews.map((review) => (
            <div
              key={review.reviewId}
              className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg font-semibold">{'⭐'.repeat(review.rating)}</span>
                    <span className="text-gray-500 text-sm">({review.rating}/5)</span>
                  </div>
                  <p className="text-sm text-gray-500">Đơn hàng #{review.orderId}</p>
                </div>
                <button
                  onClick={() => handleDeleteReview(review.reviewId)}
                  disabled={deleteLoading === review.reviewId}
                  className="px-3 py-1 text-red-600 hover:bg-red-50 rounded transition-colors text-sm disabled:opacity-50"
                >
                  {deleteLoading === review.reviewId ? 'Đang xóa...' : 'Xóa'}
                </button>
              </div>

              <p className="text-gray-700 mb-4">{review.comment}</p>

              <div className="flex gap-2 text-xs text-gray-500">
                <span>Ngày tạo: {new Date(review.createdAt).toLocaleDateString('vi-VN')}</span>
                {review.updatedAt !== review.createdAt && (
                  <span>Cập nhật: {new Date(review.updatedAt).toLocaleDateString('vi-VN')}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
