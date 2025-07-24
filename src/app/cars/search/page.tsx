'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { cars, Car } from '@/data/cars';
import './search.css';

export default function CarSearchPage() {
  const searchParams = useSearchParams();
  const [filteredCars, setFilteredCars] = useState<Car[]>(cars);
  const [loading, setLoading] = useState(true);

  // Lấy thông tin tìm kiếm từ URL params
  const pickupLocation = searchParams.get('pickupLocation') || '';
  const dropoffLocation = searchParams.get('dropoffLocation') || '';
  const pickupDate = searchParams.get('pickupDate') || '';
  const dropoffDate = searchParams.get('dropoffDate') || '';
  const pickupTime = searchParams.get('pickupTime') || '';
  const dropoffTime = searchParams.get('dropoffTime') || '';

  useEffect(() => {
    // Mô phỏng việc tìm kiếm
    setTimeout(() => {
      let filtered = cars;

      if (pickupLocation) {
        filtered = filtered.filter((car) =>
          car.location.toLowerCase().includes(pickupLocation.toLowerCase())
        );
      }

      setFilteredCars(filtered);
      setLoading(false);
    }, 1000);
  }, [pickupLocation]);

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

  const calculateDays = () => {
    if (pickupDate && dropoffDate) {
      const pickup = new Date(pickupDate);
      const dropoff = new Date(dropoffDate);
      const diffTime = Math.abs(dropoff.getTime() - pickup.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    }
    return 1;
  };

  const rentalDays = calculateDays();

  return (
    <div className="car-search-page">
      <Header />

      <div className="search-results-container">
        <div className="search-header">
          <h1>Kết quả tìm kiếm xe cho thuê</h1>
          <div className="search-info">
            {pickupLocation && (
              <span>
                Nhận xe: <strong>{pickupLocation}</strong>
              </span>
            )}
            {dropoffLocation && (
              <span>
                Trả xe: <strong>{dropoffLocation}</strong>
              </span>
            )}
            {pickupDate && (
              <span>
                Ngày nhận: <strong>{pickupDate}</strong>
              </span>
            )}
            {dropoffDate && (
              <span>
                Ngày trả: <strong>{dropoffDate}</strong>
              </span>
            )}
            {pickupTime && (
              <span>
                Giờ nhận: <strong>{pickupTime}</strong>
              </span>
            )}
            {dropoffTime && (
              <span>
                Giờ trả: <strong>{dropoffTime}</strong>
              </span>
            )}
          </div>
        </div>

        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Đang tìm kiếm xe cho thuê...</p>
          </div>
        ) : (
          <div className="search-results">
            <div className="results-count">
              <p>
                Tìm thấy <strong>{filteredCars.length}</strong> xe cho thuê
              </p>
            </div>

            <div className="cars-grid">
              {filteredCars.map((car) => (
                <div key={car.id} className="car-card">
                  <div className="car-image">
                    <img src={car.image} alt={car.name} />
                    <div className="car-type">{car.type}</div>
                  </div>

                  <div className="car-info">
                    <div className="car-header">
                      <h3 className="car-name">{car.name}</h3>
                      <div className="car-rating">
                        <div className="stars">{renderStars(car.rating)}</div>
                        <span className="rating-number">{car.rating}</span>
                        <span className="reviews">({car.reviews} đánh giá)</span>
                      </div>
                    </div>

                    <div className="car-details">
                      <div className="detail-row">
                        <div className="detail-item">
                          <span className="icon">👥</span>
                          <span>{car.seats} chỗ</span>
                        </div>
                        <div className="detail-item">
                          <span className="icon">⚙️</span>
                          <span>{car.transmission}</span>
                        </div>
                        <div className="detail-item">
                          <span className="icon">⛽</span>
                          <span>{car.fuel}</span>
                        </div>
                        <div className="detail-item">
                          <span className="icon">📍</span>
                          <span>{car.location}</span>
                        </div>
                      </div>
                    </div>

                    <div className="car-features">
                      {car.features.slice(0, 4).map((feature, index) => (
                        <span key={index} className="feature">
                          {feature}
                        </span>
                      ))}
                      {car.features.length > 4 && (
                        <span className="more-features">+{car.features.length - 4} tiện ích</span>
                      )}
                    </div>

                    <div className="car-supplier">
                      <span>
                        Nhà cung cấp: <strong>{car.supplier}</strong>
                      </span>
                    </div>

                    <div className="car-policies">
                      <div className="policy-item">
                        <span className="icon">✓</span>
                        <span>Hủy miễn phí</span>
                      </div>
                      <div className="policy-item">
                        <span className="icon">✓</span>
                        <span>{car.mileage}</span>
                      </div>
                      <div className="policy-item">
                        <span className="icon">✓</span>
                        <span>Bảo hiểm toàn diện</span>
                      </div>
                    </div>
                  </div>

                  <div className="car-booking">
                    <div className="price-info">
                      {car.originalPrice && (
                        <span className="original-price">{formatPrice(car.originalPrice)}</span>
                      )}
                      <span className="current-price">{formatPrice(car.price)}</span>
                      <span className="price-note">/ ngày</span>

                      {rentalDays > 1 && (
                        <div className="total-price">
                          <span>Tổng {rentalDays} ngày: </span>
                          <span className="total-amount">
                            {formatPrice(car.price * rentalDays)}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="deposit-info">
                      <span>Đặt cọc: {formatPrice(car.deposit)}</span>
                    </div>

                    <button className="book-button">Thuê ngay</button>

                    <div className="booking-note">
                      <span>Xác nhận ngay lập tức</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredCars.length === 0 && (
              <div className="no-results">
                <h3>Không tìm thấy xe cho thuê phù hợp</h3>
                <p>Vui lòng thử tìm kiếm với địa điểm khác hoặc thay đổi thời gian thuê xe.</p>
              </div>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
