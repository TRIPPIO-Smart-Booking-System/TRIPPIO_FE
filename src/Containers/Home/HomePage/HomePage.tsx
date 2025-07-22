'use client';

import AutoSwipeBanner from '@/Components/AutoSwipeBanner/AutoSwipeBanner';

import FlightSearchCard from '@/Components/FlightSearchCard/FlightSearchCard';
import Footer from '@/Components/Footer/Footer';
import HeaderWithMotion from '@/Components/Header/HeaderWithMotion';
import AdsHeroSection from '@/Components/HeroSection/adsHeroSection';
import DestinationSection from '@/Components/HeroSection/DestinationSection';
import FamousToursSection from '@/Components/HeroSection/FamousToursSection';
import PromoSection from '@/Components/HeroSection/PromoSection';
import WhyChooseUsSection from '@/Components/HeroSection/WhyChooseUsSection';

import ListTopHotel from '@/Components/ListTopHotel/ListTopHotel';

import Image from 'next/image';

export default function HomePage() {
  return (
    <main className="bg-[#f4fafa] min-h-screen">
      {/* Header */}
      <HeaderWithMotion />

      {/* Banner + Search Card */}
      <div className="relative w-full h-[500px]">
        <Image src="/Home/1.jpg" alt="Banner image" fill className="object-cover" priority />

        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full px-4 md:px-8 xl:px-16 z-10">
          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xl max-w-7xl mx-auto w-full">
            <h2 className="text-xl md:text-2xl font-bold text-center mb-6">
              Khám phá những địa điểm tuyệt đẹp trên thế giới cùng Trippio
            </h2>

            <FlightSearchCard />
          </div>
        </div>
      </div>

      {/* Auto swipe banner */}
      <AutoSwipeBanner />

      {/* Top-rated hotels */}
      <ListTopHotel />

      {/* Ads Hero Section */}
      <AdsHeroSection />

      {/* Promo Campaigns */}
      <PromoSection />
      <DestinationSection />
      <FamousToursSection />
      <WhyChooseUsSection />
      <Footer />
    </main>
  );
}
