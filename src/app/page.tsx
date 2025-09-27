'use client';

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

export default function Home() {
  return (
    <div className="homepage">
      <Header />
      <SearchSection />
      <PopularDestinations />
      <TravelDiscoverySection />
      <PromotionalOffers />
      <PopularDestinationsVietnam />
      <FeaturedTours />
      <WhyChooseUs />
      <Footer />
    </div>
  );
}
