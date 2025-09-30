export const formatPrice = (price: number, currency: string): string => {
  if (currency === 'VND') {
    return `VND ${price.toLocaleString('vi-VN')}`;
  }
  return `${currency} ${price.toLocaleString()}`;
};

export const formatRating = (rating: number): string => {
  return rating.toFixed(2);
};

export const formatReviewCount = (count: number): string => {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`;
  }
  return count.toString();
};
