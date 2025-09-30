import HotelCard from '@/components/ui/HotelCard';
import { popularHotels } from '@/data/hotels';
import { useBooking } from '@/hooks/useBooking';

export default function PopularDestinations() {
  const { handleBookNow, handleFavorite } = useBooking();

  return (
    <section className="popular-destinations">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Khách sạn hàng đầu</h2>
        </div>
        <div className="section-subtitle-wrapper">
          <p className="section-subtitle">Chất lượng đánh giá của khách hàng!</p>
        </div>
        <div className="destinations-grid">
          {popularHotels.map((hotel) => (
            <HotelCard
              key={hotel.id}
              hotel={hotel}
              onBook={handleBookNow}
              onFavorite={handleFavorite}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
