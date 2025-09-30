/* eslint react/prop-types: 0 */
'use client';

import { notFound } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';

// DATA (mock)
import { hotels, mockHotel, nearby } from '@/data/hotel.mock';
import { getAvailability } from '@/data/hotel.availability';

// TYPES
import type { RoomOffer } from '@/data/hotel.types';
import type { RoomFilterState } from '@/components/hotel/RoomFilters';

// COMPONENTS
import HotelHeader from '@/components/hotel/HotelHeader';
import HotelGallery from '@/components/hotel/HotelGallery';
import StickyBookCard from '@/components/hotel/StickyBookCard';
import RoomFilters from '@/components/hotel/RoomFilters';
import RoomTable from '@/components/hotel/RoomTable';
import AmenityList from '@/components/hotel/AmenityList';
import HotelDescription from '@/components/hotel/HotelDescription';
import HotelMap from '@/components/hotel/HotelMap';
import PolicySection from '@/components/hotel/PolicySection';
import NearbySuggestions from '@/components/hotel/NearbySuggestions';
import HotelBreadcrumb from '@/components/hotel/HotelBreadcrumb';

type PageProps = { params: { id: string } };

export default function HotelDetailPage({ params }: PageProps) {
  // --- Resolve hotel theo id (fallback mockHotel nếu bạn chưa có mảng hotels)
  const hotel = useMemo(() => {
    const list = Array.isArray(hotels) && hotels.length ? hotels : [mockHotel];
    return list.find((h) => h.id === params.id) ?? null;
  }, [params.id]);

  if (!hotel) notFound();

  // --- Booking state
  const [checkIn, setCheckIn] = useState<string>(new Date().toISOString().slice(0, 10));
  const [checkOut, setCheckOut] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  });
  const [adults, setAdults] = useState<number>(2);
  const [children, setChildren] = useState<number>(0);
  const [rooms, setRooms] = useState<number>(1);

  // --- Availability
  const [offers, setOffers] = useState<RoomOffer[]>([]);
  useEffect(() => {
    setOffers(getAvailability({ checkIn, checkOut, adults, children }));
  }, [checkIn, checkOut, adults, children]);

  // --- Filters
  const [filters, setFilters] = useState<RoomFilterState>({
    bed: 'Any',
    breakfast: false,
    freeCancel: false,
    payAtHotel: false,
    nonSmoking: false,
  });

  const filteredOffers = useMemo(() => {
    return offers.filter((o) => {
      const rt = hotel.room_types.find((r) => r.id === o.room_type_id);
      if (!rt) return false;
      if (filters.bed && filters.bed !== 'Any' && rt.bed !== filters.bed) return false;
      if (filters.nonSmoking && rt.smoking) return false;
      if (filters.breakfast && !o.breakfast) return false;
      if (filters.freeCancel && !o.free_cancel_until) return false;
      if (filters.payAtHotel && !o.pay_at_hotel) return false;
      return true;
    });
  }, [offers, filters, hotel.room_types]);

  // --- Selection
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const selectedOffer = filteredOffers.find((o) => o.room_type_id === selectedRoomId);
  const priceTotal = selectedOffer ? selectedOffer.total * rooms : undefined;

  // --- Ref scroll
  const roomsRef = useRef<HTMLDivElement | null>(null);
  const goToRooms = () => roomsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  // --- Nearby theo cùng city (fake)
  const nearbyByCity = useMemo(
    () => nearby.filter((n) => n.id !== hotel.id && n.name && hotel.city),
    [hotel.id, hotel.city]
  );

  return (
    <div className="mx-auto max-w-7xl px-4 pb-20 pt-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <HotelBreadcrumb city={hotel.city} hotelName={hotel.name} />

      <HotelHeader
        name={hotel.name}
        stars={hotel.stars}
        rating={hotel.rating}
        reviewCount={undefined}
        address={hotel.address}
      />

      <div className="grid gap-4 md:grid-cols-12">
        <div className="md:col-span-8">
          <HotelGallery images={hotel.images} />
        </div>

        <div className="md:col-span-4">
          <StickyBookCard
            checkIn={checkIn}
            checkOut={checkOut}
            adults={adults}
            children={children}
            rooms={rooms}
            priceTotal={priceTotal}
            onChange={(next) => {
              if (next.checkIn !== undefined) setCheckIn(next.checkIn);
              if (next.checkOut !== undefined) setCheckOut(next.checkOut);
              if (next.adults !== undefined) setAdults(next.adults);
              if (next.children !== undefined) setChildren(next.children);
              if (next.rooms !== undefined) setRooms(next.rooms);
            }}
            onCTA={() => {
              if (!selectedOffer) return goToRooms();
              alert(`Đặt phòng: ${hotel.room_types.find((r) => r.id === selectedRoomId)?.name}
Tổng: ${priceTotal?.toLocaleString('vi-VN')} ₫`);
            }}
          />
        </div>
      </div>

      <section ref={roomsRef} className="mt-8">
        <h2 className="mb-3 text-xl font-semibold">Phòng còn trống</h2>
        <RoomFilters value={filters} onChange={setFilters} />
        <RoomTable
          roomTypes={hotel.room_types}
          offers={filteredOffers}
          onSelect={(id) => setSelectedRoomId(id)}
        />
      </section>

      <section className="mt-8 grid gap-6 md:grid-cols-12">
        <div className="md:col-span-7">
          <HotelDescription
            description={hotel.description}
            checkin_time={hotel.policy.checkin_time}
            checkout_time={hotel.policy.checkout_time}
          />
        </div>
        <div className="md:col-span-5">
          <AmenityList groups={hotel.amenity_groups} />
        </div>
      </section>

      <div className="mt-8">
        <HotelMap lat={hotel.lat} lng={hotel.lng} title={hotel.name} />
      </div>

      <div className="mt-8">
        <PolicySection policy={hotel.policy} />
      </div>

      <div className="mt-8">
        <NearbySuggestions
          items={nearbyByCity.length ? nearbyByCity : nearby}
          onOpen={(id) => alert(`Đi đến khách sạn ${id}`)}
        />
      </div>
    </div>
  );
}
