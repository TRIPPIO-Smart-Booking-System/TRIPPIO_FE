'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { flights, Flight } from '@/data/flights';
import './search.css';

export default function FlightSearchPage() {
  const searchParams = useSearchParams();
  const [filteredFlights, setFilteredFlights] = useState<Flight[]>(flights);
  const [loading, setLoading] = useState(true);

  // Lấy thông tin tìm kiếm từ URL params
  const departure = searchParams.get('departure') || '';
  const arrival = searchParams.get('arrival') || '';
  const departureDate = searchParams.get('departureDate') || '';
  const returnDate = searchParams.get('returnDate') || '';
  const passengers = searchParams.get('passengers') || '1';
  const tripType = searchParams.get('tripType') || 'roundtrip';

  useEffect(() => {
    // Mô phỏng việc tìm kiếm
    setTimeout(() => {
      let filtered = flights;

      if (departure) {
        filtered = filtered.filter(
          (flight) =>
            flight.departure.city.toLowerCase().includes(departure.toLowerCase()) ||
            flight.departure.airport.toLowerCase().includes(departure.toLowerCase())
        );
      }

      if (arrival) {
        filtered = filtered.filter(
          (flight) =>
            flight.arrival.city.toLowerCase().includes(arrival.toLowerCase()) ||
            flight.arrival.airport.toLowerCase().includes(arrival.toLowerCase())
        );
      }

      setFilteredFlights(filtered);
      setLoading(false);
    }, 1000);
  }, [departure, arrival]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const formatDuration = (duration: string) => {
    return duration;
  };

  return (
    <div className="flight-search-page">
      <Header />

      <div className="search-results-container">
        <div className="search-header">
          <h1>Kết quả tìm kiếm vé máy bay</h1>
          <div className="search-info">
            {departure && (
              <span>
                Từ: <strong>{departure}</strong>
              </span>
            )}
            {arrival && (
              <span>
                Đến: <strong>{arrival}</strong>
              </span>
            )}
            {departureDate && (
              <span>
                Ngày đi: <strong>{departureDate}</strong>
              </span>
            )}
            {returnDate && tripType === 'roundtrip' && (
              <span>
                Ngày về: <strong>{returnDate}</strong>
              </span>
            )}
            <span>
              Hành khách: <strong>{passengers} người</strong>
            </span>
            <span>
              Loại vé: <strong>{tripType === 'roundtrip' ? 'Khứ hồi' : 'Một chiều'}</strong>
            </span>
          </div>
        </div>

        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Đang tìm kiếm chuyến bay...</p>
          </div>
        ) : (
          <div className="search-results">
            <div className="results-count">
              <p>
                Tìm thấy <strong>{filteredFlights.length}</strong> chuyến bay
              </p>
            </div>

            <div className="flights-list">
              {filteredFlights.map((flight) => (
                <div key={flight.id} className="flight-card">
                  <div className="flight-info">
                    <div className="airline-info">
                      <div className="airline-logo">
                        <span className="airline-icon">✈️</span>
                      </div>
                      <div className="airline-details">
                        <h3 className="airline-name">{flight.airline}</h3>
                        <p className="flight-number">{flight.flightNumber}</p>
                        <p className="aircraft">{flight.aircraft}</p>
                      </div>
                    </div>

                    <div className="flight-route">
                      <div className="departure">
                        <div className="time">{flight.departure.time}</div>
                        <div className="airport">{flight.departure.airport}</div>
                        <div className="city">{flight.departure.city}</div>
                      </div>

                      <div className="flight-duration">
                        <div className="duration">{flight.duration}</div>
                        <div className="route-line">
                          <div className="line"></div>
                          <div className="plane-icon">✈</div>
                        </div>
                        <div className="stops">
                          {flight.stops === 0 ? 'Bay thẳng' : `${flight.stops} điểm dừng`}
                        </div>
                      </div>

                      <div className="arrival">
                        <div className="time">{flight.arrival.time}</div>
                        <div className="airport">{flight.arrival.airport}</div>
                        <div className="city">{flight.arrival.city}</div>
                      </div>
                    </div>

                    <div className="flight-details">
                      <div className="detail-item">
                        <span className="label">Hạng ghế:</span>
                        <span className="value">{flight.class}</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Hành lý:</span>
                        <span className="value">{flight.baggage}</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Ghế trống:</span>
                        <span className="value">{flight.availableSeats} ghế</span>
                      </div>
                    </div>
                  </div>

                  <div className="flight-booking">
                    <div className="price-info">
                      {flight.originalPrice && (
                        <span className="original-price">{formatPrice(flight.originalPrice)}</span>
                      )}
                      <span className="current-price">{formatPrice(flight.price)}</span>
                      <span className="price-note">/ khách</span>
                    </div>

                    <button className="book-button">Chọn chuyến bay</button>

                    <div className="flight-policies">
                      <span className="policy">✓ Miễn phí hủy trong 24h</span>
                      <span className="policy">✓ Đổi lịch bay</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredFlights.length === 0 && (
              <div className="no-results">
                <h3>Không tìm thấy chuyến bay phù hợp</h3>
                <p>Vui lòng thử tìm kiếm với thông tin khác hoặc thay đổi ngày bay.</p>
              </div>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
