import { useCallback } from 'react';
import { ROUTES } from '@/constants';

export const useBooking = () => {
  const handleBookNow = useCallback((itemId: string, itemType: 'hotel' | 'tour' = 'hotel') => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

    if (!isLoggedIn) {
      alert('Vui lòng đăng nhập để đặt!');
      window.location.href = ROUTES.LOGIN;
      return;
    }

    console.log(`Đặt ${itemType}:`, itemId);
    // TODO: Implement actual booking logic
  }, []);

  const handleFavorite = useCallback((itemId: string) => {
    console.log('Thêm vào yêu thích:', itemId);
    // TODO: Implement favorite logic
  }, []);

  return {
    handleBookNow,
    handleFavorite,
  };
};
