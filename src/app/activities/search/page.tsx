'use client';

import { Suspense } from 'react';
import ActivitySearchContent from './index';

function ActivitySearchFallback() {
  return (
    <div className="loading-container">
      <div className="loading-spinner">Đang tải...</div>
    </div>
  );
}

export default function ActivitySearchPage() {
  return (
    <Suspense fallback={<ActivitySearchFallback />}>
      <ActivitySearchContent />
    </Suspense>
  );
}
