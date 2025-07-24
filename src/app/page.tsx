'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SearchTabsPanel from '@/components/ui/SearchTabsPanel';
import { tours } from '@/data/tours';
import './homepage.css';

export default function Home() {
  const tabs = [
    { id: 'hotels', label: 'Khách sạn', icon: '🏨' },
    { id: 'flights', label: 'Vé máy bay', icon: '✈️' },
    { id: 'airport-transfer', label: 'Đưa đón sân bay', icon: '🚗' },
    { id: 'car-rental', label: 'Cho thuê xe', icon: '🚙' },
    { id: 'activities', label: 'Hoạt động', icon: '🎯' },
  ];

  const handleSearch = (searchData: any) => {
    console.log('Tìm kiếm:', searchData);
    // Xử lý tìm kiếm theo từng loại dịch vụ
    switch (searchData.type) {
      case 'hotels':
        // Chuyển hướng đến trang tìm kiếm khách sạn với query params
        const hotelParams = new URLSearchParams({
          destination: searchData.destination || '',
          checkin: searchData.checkin || '',
          checkout: searchData.checkout || '',
          guests: searchData.guests?.toString() || '2',
          rooms: searchData.rooms?.toString() || '1',
        });
        window.location.href = `/hotels/search?${hotelParams.toString()}`;
        break;
      case 'flights':
        // Chuyển hướng đến trang tìm kiếm vé máy bay với query params
        const flightParams = new URLSearchParams({
          departure: searchData.departure || '',
          arrival: searchData.arrival || '',
          departureDate: searchData.departureDate || '',
          returnDate: searchData.returnDate || '',
          passengers: searchData.passengers?.toString() || '1',
          tripType: searchData.tripType || 'roundtrip',
        });
        window.location.href = `/flights/search?${flightParams.toString()}`;
        break;
      case 'car-rental':
        // Chuyển hướng đến trang tìm kiếm xe cho thuê với query params
        const carParams = new URLSearchParams({
          pickupLocation: searchData.pickupLocation || '',
          dropoffLocation: searchData.dropoffLocation || '',
          pickupDate: searchData.pickupDate || '',
          dropoffDate: searchData.dropoffDate || '',
          pickupTime: searchData.pickupTime || '',
          dropoffTime: searchData.dropoffTime || '',
        });
        window.location.href = `/cars/search?${carParams.toString()}`;
        break;
      case 'airport-transfer':
        console.log('Tìm kiếm đưa đón sân bay:', searchData);
        // TODO: Tạo trang tìm kiếm đưa đón sân bay
        break;
      case 'activities':
        // Chuyển hướng đến trang tìm kiếm hoạt động với query params
        const activityParams = new URLSearchParams({
          location: searchData.activityLocation || '',
          startDate: searchData.startDate || '',
          activityType: searchData.activityType || '',
          participants: searchData.participants?.toString() || '2',
        });
        window.location.href = `/activities/search?${activityParams.toString()}`;
        break;
    }
  };

  const handleBookNow = (tourId: string) => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
      alert('Vui lòng đăng nhập để đặt tour!');
      window.location.href = '/login';
    } else {
      console.log('Đặt tour:', tourId);
    }
  };

  return (
    <div className="homepage">
      <Header />

      {/* Search Section - Thay thế hero */}
      <section className="search-section">
        <div className="search-content">
          <h1>Khám phá những địa điểm tuyệt đẹp trên thế giới cùng Trippio</h1>
          <p>Tìm kiếm và đặt chỗ dễ dàng với hàng ngàn lựa chọn tại Việt Nam và quốc tế</p>

          <SearchTabsPanel tabs={tabs} defaultActiveTab="hotels" onSearch={handleSearch} />
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="popular-destinations">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Khách sạn hàng đầu</h2>
          </div>
          <div className="section-subtitle-wrapper">
            <p className="section-subtitle">Chất lượng đánh giá của khách hàng!</p>
          </div>
          <div className="destinations-grid">
            <div className="destination-card">
              <div className="card-image-container">
                <img src="/images/halong.jpg" alt="Hotel Đà Nẵng" />
                <div className="heart-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                      stroke="#666"
                      strokeWidth="2"
                      fill="none"
                    />
                  </svg>
                </div>
                <div className="rating-badge">
                  <span className="rating-star">★</span>
                  <span className="rating-score">4.96</span>
                  <span className="rating-count">(672 reviews)</span>
                </div>
              </div>
              <div className="destination-info">
                <h3>Hotel Đà Nẵng</h3>
                <p className="hotel-details">2 ngày 3 đêm • 4-6 người</p>
                <div className="price-section">
                  <div className="price-info">
                    <span className="price">VND 1.000.000</span>
                    <span className="price-unit">/ người</span>
                  </div>
                  <button className="book-btn">Đặt ngay</button>
                </div>
                <p className="price-note">Chưa bao gồm thuế và phí</p>
              </div>
            </div>
            <div className="destination-card">
              <div className="card-image-container">
                <img src="/images/hoian.jpg" alt="Hotel Nha Trang" />
                <div className="heart-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                      stroke="#666"
                      strokeWidth="2"
                      fill="none"
                    />
                  </svg>
                </div>
                <div className="rating-badge">
                  <span className="rating-star">★</span>
                  <span className="rating-score">4.85</span>
                  <span className="rating-count">(543 reviews)</span>
                </div>
              </div>
              <div className="destination-info">
                <h3>Hotel Nha Trang</h3>
                <p className="hotel-details">2 ngày 3 đêm • 4-6 người</p>
                <div className="price-section">
                  <div className="price-info">
                    <span className="price">VND 6.000.000</span>
                    <span className="price-unit">/ người</span>
                  </div>
                  <button className="book-btn">Đặt ngay</button>
                </div>
                <p className="price-note">Chưa bao gồm thuế và phí</p>
              </div>
            </div>
            <div className="destination-card">
              <div className="card-image-container">
                <img src="/images/phuquoc.jpg" alt="Hotel Phú Quốc" />
                <div className="heart-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                      stroke="#666"
                      strokeWidth="2"
                      fill="none"
                    />
                  </svg>
                </div>
                <div className="rating-badge">
                  <span className="rating-star">★</span>
                  <span className="rating-score">4.92</span>
                  <span className="rating-count">(789 reviews)</span>
                </div>
              </div>
              <div className="destination-info">
                <h3>Hotel Phú Quốc</h3>
                <p className="hotel-details">2 ngày 3 đêm • 4-6 người</p>
                <div className="price-section">
                  <div className="price-info">
                    <span className="price">VND 4.000.000</span>
                    <span className="price-unit">/ người</span>
                  </div>
                  <button className="book-btn">Đặt ngay</button>
                </div>
                <p className="price-note">Chưa bao gồm thuế và phí</p>
              </div>
            </div>
            <div className="destination-card">
              <div className="card-image-container">
                <img src="/images/dalat.jpg" alt="Hotel Đà Lạt" />
                <div className="heart-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                      stroke="#666"
                      strokeWidth="2"
                      fill="none"
                    />
                  </svg>
                </div>
                <div className="rating-badge">
                  <span className="rating-star">★</span>
                  <span className="rating-score">4.78</span>
                  <span className="rating-count">(456 reviews)</span>
                </div>
              </div>
              <div className="destination-info">
                <h3>Hotel Đà Lạt</h3>
                <p className="hotel-details">2 ngày 3 đêm • 2-4 người</p>
                <div className="price-section">
                  <div className="price-info">
                    <span className="price">VND 2.500.000</span>
                    <span className="price-unit">/ người</span>
                  </div>
                  <button className="book-btn">Đặt ngay</button>
                </div>
                <p className="price-note">Chưa bao gồm thuế và phí</p>
              </div>
            </div>
            <div className="destination-card">
              <div className="card-image-container">
                <img src="/images/saigon.png" alt="Hotel Sài Gòn" />
                <div className="heart-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                      stroke="#666"
                      strokeWidth="2"
                      fill="none"
                    />
                  </svg>
                </div>
                <div className="rating-badge">
                  <span className="rating-star">★</span>
                  <span className="rating-score">4.88</span>
                  <span className="rating-count">(634 reviews)</span>
                </div>
              </div>
              <div className="destination-info">
                <h3>Hotel Sài Gòn</h3>
                <p className="hotel-details">1 ngày 2 đêm • 2-4 người</p>
                <div className="price-section">
                  <div className="price-info">
                    <span className="price">VND 3.200.000</span>
                    <span className="price-unit">/ người</span>
                  </div>
                  <button className="book-btn">Đặt ngay</button>
                </div>
                <p className="price-note">Chưa bao gồm thuế và phí</p>
              </div>
            </div>
            <div className="destination-card">
              <div className="card-image-container">
                <img src="/images/hotel-1.jpg.webp" alt="Hotel Hà Nội" />
                <div className="heart-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                      stroke="#666"
                      strokeWidth="2"
                      fill="none"
                    />
                  </svg>
                </div>
                <div className="rating-badge">
                  <span className="rating-star">★</span>
                  <span className="rating-score">4.94</span>
                  <span className="rating-count">(721 reviews)</span>
                </div>
              </div>
              <div className="destination-info">
                <h3>Hotel Hà Nội</h3>
                <p className="hotel-details">2 ngày 3 đêm • 2-6 người</p>
                <div className="price-section">
                  <div className="price-info">
                    <span className="price">VND 2.800.000</span>
                    <span className="price-unit">/ người</span>
                  </div>
                  <button className="book-btn">Đặt ngay</button>
                </div>
                <p className="price-note">Chưa bao gồm thuế và phí</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* New Travel Discovery Section */}
      <section className="travel-discovery-section">
        <div className="travel-discovery-container">
          <div className="travel-content">
            <div className="travel-text">
              <div className="payment-badge">Thanh toán dễ dàng</div>
              <h2 className="travel-title">
                Khám phá những
                <br />
                điểm đến trong mơ
                <br />
                một cách dễ dàng
              </h2>
            </div>
            <div className="travel-images">
              <div className="main-image">
                <img src="/images/travel-group.png" alt="Travel Group" />
              </div>
              <div className="image-circle couple">
                <img src="/images/couple-travel.png" alt="Couple Travel" />
              </div>
              <div className="side-images">
                <div className="image-circle solo">
                  <img src="/images/solo-travel.png" alt="Solo Travel" />
                </div>
                <div className="decorative-circles">
                  <div className="circle gray"></div>
                  <div className="circle pink"></div>
                </div>
              </div>
            </div>
          </div>
          <div className="map-background">
            <div className="location-pins">
              <div className="pin pin-1"></div>
              <div className="pin pin-2"></div>
              <div className="pin pin-3"></div>
            </div>
            <div className="airplane-icons">
              <div className="airplane airplane-1"></div>
              <div className="airplane airplane-2"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Promotional Offers Section */}
      <section className="promotional-offers">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Chương trình khuyến mãi</h2>
            <p className="section-subtitle">Những ưu đãi hấp dẫn dành riêng cho bạn</p>
          </div>
          <div className="offers-grid">
            <div className="offer-card main-offer">
              <div className="offer-badge">Khuyến mãi có hạn</div>
              <div className="offer-content">
                <h3>Mua 1, Tặng 1</h3>
                <p>Điểm tham quan</p>
                <button className="offer-btn">View More →</button>
              </div>
              <div className="offer-discount">50% OFF</div>
            </div>
            <div className="offer-card secondary-offer">
              <div className="offer-badge">Khuyến mãi có hạn</div>
              <div className="offer-content">
                <h3>Mua 1 tặng 1</h3>
                <p>Điểm tham quan</p>
                <button className="offer-btn">View More →</button>
              </div>
            </div>
            <div className="offer-card tertiary-offer">
              <div className="offer-badge">Khuyến mãi có hạn</div>
              <div className="offer-content">
                <h3>Mua 1 tặng 1</h3>
                <p>Điểm tham quan</p>
                <button className="offer-btn">View More →</button>
              </div>
            </div>
          </div>
          <div className="navigation-arrows">
            <button className="nav-arrow prev">←</button>
            <button className="nav-arrow next">→</button>
          </div>
        </div>
      </section>

      {/* Featured Tours */}
      <section className="featured-tours">
        <div className="container">
          <h2 className="section-title">Tour nổi bật</h2>
          <div className="tours-grid">
            {tours.slice(0, 6).map((tour) => (
              <div key={tour.id} className="tour-card">
                <img src={tour.image} alt={tour.title} />
                <div className="tour-info">
                  <h3>{tour.title}</h3>
                  <p className="tour-location">{tour.location}</p>
                  <p className="tour-duration">{tour.duration}</p>
                  <div className="tour-footer">
                    <span className="tour-price">{tour.price}</span>
                    <button className="book-btn" onClick={() => handleBookNow(tour.id)}>
                      Đặt ngay
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* App Promotion */}
      <section className="app-promotion">
        <div className="container">
          <div className="app-content">
            <div className="app-text">
              <h2>Tải ứng dụng Trippio</h2>
              <p>Trải nghiệm đặt tour du lịch dễ dàng hơn với ứng dụng di động của chúng tôi</p>
              <div className="app-buttons">
                <Link href="#" className="app-store-btn">
                  <img src="/images/app-store.png" alt="Download on App Store" />
                </Link>
                <Link href="#" className="google-play-btn">
                  <img src="/images/google-play.png" alt="Get it on Google Play" />
                </Link>
              </div>
            </div>
            <div className="app-image">
              <img src="/images/app-mockup.png" alt="Trippio App" />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
