'use client';

import { Suspense } from 'react';
import FlightSearchContent from './index';

function FlightSearchFallback() {
  return (
    <div className="loading-container">
      <div className="loading-spinner">Đang tải...</div>
    </div>
  );
}

export default function FlightSearchPage() {
  return (
    <Suspense fallback={<FlightSearchFallback />}>
      <FlightSearchContent />
    </Suspense>
  );
}
