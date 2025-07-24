'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { hotels, Hotel } from '@/data/hotels';
import './search.css';

export default function HotelSearchPage() {
  const searchParams = useSearchParams();
  const [filteredHotels, setFilteredHotels] = useState<Hotel[]>(hotels);
  const [loading, setLoading] = useState(true);

  // Lấy thông tin tìm kiếm từ URL params
  const destination = searchParams.get('destination') || '';
  const checkin = searchParams.get('checkin') || '';
  const checkout = searchParams.get('checkout') || '';
  const guests = searchParams.get('guests') || '2';
  const rooms = searchParams.get('rooms') || '1';

  useEffect(() => {
    // Mô phỏng việc tìm kiếm
    setTimeout(() => {
      let filtered = hotels;

      if (destination) {
        filtered = filtered.filter(
          (hotel) =>
            hotel.location.toLowerCase().includes(destination.toLowerCase()) ||
            hotel.name.toLowerCase().includes(destination.toLowerCase())
        );
      }

      setFilteredHotels(filtered);
      setLoading(false);
    }, 1000);
  }, [destination]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <span key={i} className="star full">
          ★
        </span>
      );
    }

    if (hasHalfStar) {
      stars.push(
        <span key="half" className="star half">
          ★
        </span>
      );
    }

    return stars;
  };

  return (
    <div className="hotel-search-page">
      <Header />

      <div className="search-results-container">
        <div className="search-header">
          <h1>Kết quả tìm kiếm khách sạn</h1>
          <div className="search-info">
            {destination && (
              <span>
                Địa điểm: <strong>{destination}</strong>
              </span>
            )}
            {checkin && (
              <span>
                Nhận phòng: <strong>{checkin}</strong>
              </span>
            )}
            {checkout && (
              <span>
                Trả phòng: <strong>{checkout}</strong>
              </span>
            )}
            <span>
              Khách: <strong>{guests} người</strong>
            </span>
            <span>
              Phòng: <strong>{rooms} phòng</strong>
            </span>
          </div>
        </div>

        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Đang tìm kiếm khách sạn...</p>
          </div>
        ) : (
          <div className="search-results">
            <div className="results-count">
              <p>
                Tìm thấy <strong>{filteredHotels.length}</strong> khách sạn
              </p>
            </div>

            <div className="hotels-grid">
              {filteredHotels.map((hotel) => (
                <div key={hotel.id} className="hotel-card">
                  <div className="hotel-image">
                    <img src={hotel.image} alt={hotel.name} />
                    <div className="hotel-rating">
                      <div className="stars">{renderStars(hotel.rating)}</div>
                      <span className="rating-number">{hotel.rating}</span>
                    </div>
                  </div>

                  <div className="hotel-info">
                    <h3 className="hotel-name">{hotel.name}</h3>
                    <p className="hotel-location">📍 {hotel.location}</p>
                    <p className="hotel-description">{hotel.description}</p>

                    <div className="hotel-amenities">
                      {hotel.amenities.slice(0, 3).map((amenity, index) => (
                        <span key={index} className="amenity">
                          {amenity}
                        </span>
                      ))}
                      {hotel.amenities.length > 3 && (
                        <span className="more-amenities">
                          +{hotel.amenities.length - 3} tiện ích
                        </span>
                      )}
                    </div>

                    <div className="hotel-reviews">
                      <span>
                        ⭐ {hotel.rating} ({hotel.reviews} đánh giá)
                      </span>
                    </div>
                  </div>

                  <div className="hotel-booking">
                    <div className="price-info">
                      {hotel.originalPrice && (
                        <span className="original-price">{formatPrice(hotel.originalPrice)}</span>
                      )}
                      <span className="current-price">{formatPrice(hotel.price)}</span>
                      <span className="price-note">/ đêm</span>
                    </div>

                    <button className="book-button">Đặt ngay</button>
                  </div>
                </div>
              ))}
            </div>

            {filteredHotels.length === 0 && (
              <div className="no-results">
                <h3>Không tìm thấy khách sạn phù hợp</h3>
                <p>Vui lòng thử tìm kiếm với từ khóa khác hoặc mở rộng khu vực tìm kiếm.</p>
              </div>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
