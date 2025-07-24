'use client';

import { Suspense } from 'react';
import CarSearchContent from './index';

function CarSearchFallback() {
  return (
    <div className="loading-container">
      <div className="loading-spinner">Đang tải...</div>
    </div>
  );
}

export default function CarSearchPage() {
  return (
    <Suspense fallback={<CarSearchFallback />}>
      <CarSearchContent />
    </Suspense>
  );
}
