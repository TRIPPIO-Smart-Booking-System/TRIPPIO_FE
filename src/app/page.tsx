'use client';

import { Suspense } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SearchSection from '@/components/homepage/SearchSection';
import PopularDestinations from '@/components/homepage/PopularDestinations';
import TravelDiscoverySection from '@/components/homepage/TravelDiscoverySection';
import PromotionalOffers from '@/components/homepage/PromotionalOffers';
import PopularDestinationsVietnam from '@/components/homepage/PopularDestinationsVietnam';
import FeaturedTours from '@/components/homepage/FeaturedTours';
import WhyChooseUs from '@/components/homepage/WhyChooseUs';
import './homepage.css';

// Loading component
const SectionSkeleton = () => (
  <div className="section-skeleton">
    <div className="skeleton-header"></div>
    <div className="skeleton-content"></div>
  </div>
);

export default function Home() {
  return (
    <div className="homepage">
      <Header />

      <main>
        <SearchSection />

        <Suspense fallback={<SectionSkeleton />}>
          <PopularDestinations />
        </Suspense>

        <TravelDiscoverySection />

        <Suspense fallback={<SectionSkeleton />}>
          <PromotionalOffers />
        </Suspense>

        <Suspense fallback={<SectionSkeleton />}>
          <PopularDestinationsVietnam />
        </Suspense>

        <Suspense fallback={<SectionSkeleton />}>
          <FeaturedTours />
        </Suspense>

        <WhyChooseUs />
      </main>

      <Footer />
    </div>
  );
}
