import { tours } from '@/data/tours';
import TourCard from '@/components/tours/TourCard';

export default function ToursPage() {
  return (
    <div className="container max-w-screen-2xl py-16">
      <div className="flex flex-col items-center justify-center text-center">
        <h1 className="text-3xl font-bold sm:text-4xl">Danh sách tours</h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          Khám phá các tour du lịch hấp dẫn của chúng tôi
        </p>
      </div>
      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {tours.map((tour) => (
          <TourCard key={tour.id} tour={tour} />
        ))}
      </div>
    </div>
  );
}
