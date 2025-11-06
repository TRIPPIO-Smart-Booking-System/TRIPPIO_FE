'use client';

import Image from 'next/image';
import { useState } from 'react';
import BadgeTab from './HeroComponent/BadgeTab';
import FlightSearch from './HeroComponent/Search/FlightSearch';
import HotelSearch from './HeroComponent/Search/HotelSearch';
import ShowSearch from './HeroComponent/Search/ShowSearch'; // ⬅️ thêm

export default function Hero() {
  const [tab, setTab] = useState<'hotel' | 'flight' | 'show'>('hotel'); // ⬅️ thêm 'show'

  return (
    <section className="relative w-full min-h-[560px]">
      <Image src="/images/halong.jpg" alt="Hero Image" fill className="object-cover" priority />
      <div className="absolute inset-0 bg-black/55" />

      <div className="relative z-10 mx-auto flex h-[560px] max-w-7xl flex-col items-center justify-center px-4 text-white">
        <h1 className="text-center text-4xl font-bold sm:text-5xl">Explore Vietnam</h1>
        <p className="mt-3 text-center text-lg opacity-90">
          Book hotels, flight tickets & show tickets quickly with Trippio.
        </p>

        {/* Tabs */}
        <div className="mt-6 flex gap-3">
          <BadgeTab active={tab === 'hotel'} onClick={() => setTab('hotel')}>
            <span>🏨</span> Hotel
          </BadgeTab>
          <BadgeTab active={tab === 'flight'} onClick={() => setTab('flight')}>
            <span>✈️</span> Flight tickets
          </BadgeTab>
          <BadgeTab active={tab === 'show'} onClick={() => setTab('show')}>
            <span>🎭</span> Show
          </BadgeTab>
        </div>

        {/* Search box */}
        <div className="mt-4 w-full -mx-4">
          <div className="mx-auto w-full max-w-7xl rounded-2xl bg-white/95 text-slate-900 px-4 py-3 md:px-6 md:py-4 shadow-xl backdrop-blur overflow-visible">
            {tab === 'hotel' ? (
              <HotelSearch />
            ) : tab === 'flight' ? (
              <FlightSearch />
            ) : (
              <ShowSearch />
            )}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-5 flex gap-3">
          <a
            href="/tours"
            className="rounded-full bg-white px-5 py-2 text-slate-900 hover:bg-white/90"
          >
            Discover now
          </a>
          <a
            href="/contact"
            className="rounded-full border border-white px-5 py-2 hover:bg-white/20"
          >
            Contact
          </a>
        </div>
      </div>
    </section>
  );
}
