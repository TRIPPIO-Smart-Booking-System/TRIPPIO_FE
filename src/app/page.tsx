import Hero from '@/components/home/Hero';
import FeaturedTours from '@/components/home/FeaturedTours';
import WhyChooseUs from '@/components/home/WhyChooseUs';
import Newsletter from '@/components/home/Newsletter';
import DreamDestinations from '@/components/home/DreamDestinations';
import PopularDestinations from '@/components/home/PopularDestinations';
import FeaturedTopTours from '@/components/home/FeaturedTopTours';

export default function Home() {
  return (
    <div className="flex flex-col">
      <Hero />

      <FeaturedTours />
      <DreamDestinations />
      <PopularDestinations />
      <FeaturedTopTours />
      <WhyChooseUs />
      <Newsletter />
    </div>
  );
}
