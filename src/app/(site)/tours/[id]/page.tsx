'use client';

import { useMemo, useState } from 'react';
import { notFound } from 'next/navigation';
import { tours } from '@/data/tours';
import Breadcrumb from '@/components/tour/Breadcrumb';
import Gallery from '@/components/tour/Gallery';

import TitleMeta from '@/components/tour/TitleMeta';

import Highlights from '@/components/tour/Highlights';
import Itinerary from '@/components/tour/Itinerary';
import IncludedList from '@/components/tour/IncludedList';
import SectionCard from '@/components/Card/BookCard/SectionCard';
import BookCard from '@/components/Card/BookCard/BookCard';

type Props = { params: { id: string } };

export default function TourDetailPage({ params }: Props) {
  const tour = useMemo(() => tours.find((t) => t.id === params.id), [params.id]);
  if (!tour) notFound();

  const [date, setDate] = useState<string>('');
  const [guests, setGuests] = useState<number>(2);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-20 pt-8 sm:px-6 lg:px-8">
      <Breadcrumb
        items={[
          { href: '/', label: 'Trang chủ' },
          { href: '/tours', label: 'Tours' },
          { label: tour.title },
        ]}
      />

      <div className="grid gap-4 md:grid-cols-12">
        <div className="md:col-span-8">
          <Gallery main={tour.imageUrl} thumbs={[tour.imageUrl, tour.imageUrl, tour.imageUrl]} />
        </div>

        <aside className="md:col-span-4">
          <BookCard
            rating={tour.rating}
            reviews={tour.reviews}
            duration={tour.duration}
            destination={tour.destination}
            price={tour.price}
            included={tour.included}
            date={date}
            guests={guests}
            onDateChange={setDate}
            onGuestsChange={setGuests}
          />
        </aside>
      </div>

      <TitleMeta
        title={tour.title}
        rating={tour.rating}
        reviews={tour.reviews}
        duration={tour.duration}
        destination={tour.destination}
        price={tour.price}
      />

      <SectionCard title="Mô tả tour">
        <p className="leading-7 text-muted-foreground">{tour.description}</p>
      </SectionCard>

      <SectionCard title="Điểm nổi bật">
        <Highlights items={tour.highlights} />
      </SectionCard>

      <SectionCard title="Lịch trình chi tiết">
        <Itinerary items={tour.itinerary} />
      </SectionCard>

      <SectionCard title="Dịch vụ bao gồm">
        <IncludedList items={tour.included} />
      </SectionCard>
    </div>
  );
}
