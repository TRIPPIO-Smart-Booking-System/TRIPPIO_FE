import { Hotel } from '@/types';
import { formatPrice } from '@/utils/formatters';

interface HotelCardProps {
  hotel: Hotel;
  onBook?: (hotelId: string) => void;
  onFavorite?: (hotelId: string) => void;
}

export default function HotelCard({ hotel, onBook, onFavorite }: HotelCardProps) {
  const handleBookClick = () => {
    onBook?.(hotel.id);
  };

  const handleFavoriteClick = () => {
    onFavorite?.(hotel.id);
  };

  return (
    <div className="destination-card">
      <div className="card-image-container">
        <img src={hotel.image} alt={hotel.alt} />
        <button
          className="heart-icon"
          onClick={handleFavoriteClick}
          aria-label={`Thêm ${hotel.name} vào danh sách yêu thích`}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
              stroke="#666"
              strokeWidth="2"
              fill="none"
            />
          </svg>
        </button>
        <div className="rating-badge">
          <span className="rating-star">★</span>
          <span className="rating-score">{hotel.rating}</span>
          <span className="rating-count">({hotel.reviewCount} reviews)</span>
        </div>
      </div>
      <div className="destination-info">
        <h3>{hotel.name}</h3>
        <p className="hotel-details">
          {hotel.duration} • {hotel.capacity}
        </p>
        <div className="price-section">
          <div className="price-info">
            <span className="price">{formatPrice(hotel.price, hotel.currency)}</span>
            <span className="price-unit">{hotel.priceUnit}</span>
          </div>
          <button className="book-btn" onClick={handleBookClick}>
            Đặt ngay
          </button>
        </div>
        <p className="price-note">{hotel.priceNote}</p>
      </div>
    </div>
  );
}
