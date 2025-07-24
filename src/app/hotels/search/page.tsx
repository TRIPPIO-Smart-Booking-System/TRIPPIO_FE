'use client';

import { Suspense } from 'react';
import HotelSearchContent from './index';

function HotelSearchFallback() {
  return (
    <div className="loading-container">
      <div className="loading-spinner">Đang tải...</div>
    </div>
  );
}

export default function HotelSearchPage() {
  return (
    <Suspense fallback={<HotelSearchFallback />}>
      <HotelSearchContent />
    </Suspense>
  );
}
