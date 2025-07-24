'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { flights, Flight } from '@/data/flights';

export default function FlightSearchContent() {
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

  const formatTime = (time: string) => {
    return time;
  };

  const formatDuration = (duration: string) => {
    return duration;
  };

  return (
    <div className="flight-search-page">
      <Header />

      <main className="search-content">
        <div className="container">
          {/* Search Summary */}
          <div className="search-summary">
            <h1>
              Chuyến bay từ {departure || 'Tất cả'} đến {arrival || 'Tất cả'}
            </h1>
            <div className="search-info">
              <span>Ngày đi: {departureDate || 'Chưa chọn'}</span>
              {tripType === 'roundtrip' && <span>Ngày về: {returnDate || 'Chưa chọn'}</span>}
              <span>Hành khách: {passengers}</span>
            </div>
          </div>

          {/* Filters */}
          <div className="filters">
            <div className="filter-group">
              <label>Sắp xếp theo:</label>
              <select>
                <option value="price">Giá thấp nhất</option>
                <option value="duration">Thời gian bay ngắn nhất</option>
                <option value="departure">Giờ khởi hành</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Hãng hàng không:</label>
              <select>
                <option value="all">Tất cả</option>
                <option value="vietnam-airlines">Vietnam Airlines</option>
                <option value="jetstar">Jetstar</option>
                <option value="vietjet">VietJet</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Thời gian khởi hành:</label>
              <select>
                <option value="all">Tất cả</option>
                <option value="morning">Sáng (06:00 - 12:00)</option>
                <option value="afternoon">Chiều (12:00 - 18:00)</option>
                <option value="evening">Tối (18:00 - 00:00)</option>
              </select>
            </div>
          </div>

          {/* Results */}
          <div className="search-results">
            {loading ? (
              <div className="loading">
                <div className="loading-spinner"></div>
                <p>Đang tìm kiếm chuyến bay...</p>
              </div>
            ) : (
              <>
                <div className="results-header">
                  <h2>Tìm thấy {filteredFlights.length} chuyến bay</h2>
                </div>

                <div className="flights-list">
                  {filteredFlights.map((flight) => (
                    <div key={flight.id} className="flight-card">
                      <div className="flight-main-info">
                        <div className="airline-info">
                          <span className="airline-name">{flight.airline}</span>
                          <span className="flight-number">{flight.flightNumber}</span>
                        </div>

                        <div className="flight-times">
                          <div className="departure">
                            <div className="time">{formatTime(flight.departure.time)}</div>
                            <div className="airport">{flight.departure.airport}</div>
                            <div className="city">{flight.departure.city}</div>
                          </div>

                          <div className="flight-duration">
                            <div className="duration">{formatDuration(flight.duration)}</div>
                            <div className="flight-line">
                              <div className="line"></div>
                              <div className="plane-icon">✈️</div>
                            </div>
                            <div className="stops">
                              {flight.stops === 0 ? 'Bay thẳng' : `${flight.stops} điểm dừng`}
                            </div>
                          </div>

                          <div className="arrival">
                            <div className="time">{formatTime(flight.arrival.time)}</div>
                            <div className="airport">{flight.arrival.airport}</div>
                            <div className="city">{flight.arrival.city}</div>
                          </div>
                        </div>

                        <div className="flight-price">
                          <div className="price">{formatPrice(flight.price)}</div>
                          <div className="price-note">mỗi khách</div>
                        </div>

                        <div className="flight-actions">
                          <button className="select-btn">Chọn</button>
                        </div>
                      </div>

                      <div className="flight-details">
                        <div className="baggage-info">
                          <span>🧳 Hành lý: {flight.baggage}</span>
                          <span>✈️ Loại máy bay: {flight.aircraft}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredFlights.length === 0 && (
                  <div className="no-results">
                    <h3>Không tìm thấy chuyến bay phù hợp</h3>
                    <p>Hãy thử thay đổi điều kiện tìm kiếm của bạn</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
