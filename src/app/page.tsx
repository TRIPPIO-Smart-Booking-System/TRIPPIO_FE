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
      {/* Popular Destinations Section */}
      <section className="popular-destinations-vietnam">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Điểm đến phổ biến nhất Việt Nam</h2>
          </div>
          <div className="destinations-vietnam-grid">
            <div className="destination-vietnam-card">
              <img src="/images/danang.jpg" alt="Đà Nẵng" />
              <div className="destination-vietnam-info">
                <h3>Đà Nẵng</h3>
                <span className="destination-arrow">→</span>
              </div>
            </div>
            <div className="destination-vietnam-card">
              <img src="/images/phuquoc.jpg" alt="Phú Quốc" />
              <div className="destination-vietnam-info">
                <h3>Phú Quốc</h3>
                <span className="destination-arrow">→</span>
              </div>
            </div>
            <div className="destination-vietnam-card">
              <img src="/images/hanoi.jpg" alt="Hà Nội" />
              <div className="destination-vietnam-info">
                <h3>Hà Nội</h3>
                <span className="destination-arrow">→</span>
              </div>
            </div>
            <div className="destination-vietnam-card">
              <img src="/images/dalat.jpg" alt="Đà Lạt" />
              <div className="destination-vietnam-info">
                <h3>Đà Lạt</h3>
                <span className="destination-arrow">→</span>
              </div>
            </div>
            <div className="destination-vietnam-card">
              <img src="/images/phuquy.jpg" alt="Phú Quý" />
              <div className="destination-vietnam-info">
                <h3>Phú Quý</h3>
                <span className="destination-arrow">→</span>
              </div>
            </div>
            <div className="destination-vietnam-card">
              <img src="/images/nhatrang.jpg" alt="Nha Trang" />
              <div className="destination-vietnam-info">
                <h3>Nha Trang</h3>
                <span className="destination-arrow">→</span>
              </div>
            </div>
            <div className="destination-vietnam-card">
              <img src="/images/nghean.jpg" alt="Nghệ An" />
              <div className="destination-vietnam-info">
                <h3>Nghệ An</h3>
                <span className="destination-arrow">→</span>
              </div>
            </div>
            <div className="destination-vietnam-card show-all">
              <div className="show-all-content">
                <span className="show-all-text">Tất cả các điểm đến</span>
                <span className="show-all-arrow">→</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Featured Tours Section */}
      <section className="featured-tours">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Các tour du lịch nổi bật của chúng tôi</h2>
            <p className="section-subtitle">Điểm đến yêu thích dựa trên đánh giá của khách hàng</p>
          </div>
          <div className="tour-filters">
            <select className="filter-select">
              <option>Khoảng thời gian</option>
              <option>1-3 ngày</option>
              <option>4-7 ngày</option>
              <option>Trên 7 ngày</option>
            </select>
            <select className="filter-select">
              <option>Đánh giá / Xếp hạng</option>
              <option>5 sao</option>
              <option>4 sao trở lên</option>
              <option>3 sao trở lên</option>
            </select>
            <select className="filter-select">
              <option>Giá</option>
              <option>Dưới 5 triệu</option>
              <option>5-10 triệu</option>
              <option>Trên 10 triệu</option>
            </select>
          </div>
          <div className="tours-grid">
            <div className="tour-card">
              <div className="tour-badge top-rated">Top Rated</div>
              <div className="tour-image">
                <img src="/images/danang-tour.jpg" alt="Cầu vàng Đà Nẵng" />
                <button className="favorite-btn">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                      stroke="#666"
                      strokeWidth="2"
                      fill="none"
                    />
                  </svg>
                </button>
              </div>
              <div className="tour-info">
                <h3>Cầu vàng Đà Nẵng</h3>
                <div className="tour-details">
                  <span className="duration">2 ngày 3 đêm</span>
                  <span className="capacity">4-6 người</span>
                </div>
                <div className="tour-price">
                  <span className="price">VND 7.000.000</span>
                  <span className="price-unit">/ người</span>
                  <button className="book-btn">Đặt Ngay</button>
                </div>
              </div>
            </div>
            <div className="tour-card">
              <div className="tour-badge best-sale">Best Sale</div>
              <div className="tour-image">
                <img src="/images/nhatrang-tour.jpg" alt="Thành Phố Đêm Nha Trang" />
                <button className="favorite-btn">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                      stroke="#666"
                      strokeWidth="2"
                      fill="none"
                    />
                  </svg>
                </button>
              </div>
              <div className="tour-info">
                <h3>Thành Phố Đêm Nha Trang</h3>
                <div className="tour-details">
                  <span className="duration">3 ngày 3 đêm</span>
                  <span className="capacity">4-6 người</span>
                </div>
                <div className="tour-price">
                  <span className="price">VND 7.000.000</span>
                  <span className="price-unit">/ người</span>
                  <button className="book-btn">Đặt Ngay</button>
                </div>
              </div>
            </div>
            <div className="tour-card">
              <div className="tour-badge discount">25% Off</div>
              <div className="tour-image">
                <img src="/images/phuquoc-tour.jpg" alt="Phú Quốc" />
                <button className="favorite-btn">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                      stroke="#666"
                      strokeWidth="2"
                      fill="none"
                    />
                  </svg>
                </button>
              </div>
              <div className="tour-info">
                <h3>Phú Quốc</h3>
                <div className="tour-details">
                  <span className="duration">7 ngày 6 đêm</span>
                  <span className="capacity">4-6 người</span>
                </div>
                <div className="tour-price">
                  <span className="price">VND 7.000.000</span>
                  <span className="price-unit">/ người</span>
                  <button className="book-btn">Đặt Ngay</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="why-choose-us">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Tại sao nên đi du lịch cùng chúng tôi?</h2>
            <p className="section-subtitle">Nền tảng đặt phòng tốt nhất mà bạn có thể tin tướng</p>
          </div>
          <div className="benefits-grid">
            <div className="benefit-card">
              <div className="benefit-icon">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <circle cx="24" cy="24" r="20" fill="#FFF3CD" stroke="#F59E0B" strokeWidth="2" />
                  <path d="M24 16v8l6 6" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <h3>Đảm bảo an ninh</h3>
              <p>
                Thể hiện cam kết bảo mật dữ liệu người dùng thông qua mã hóa và các biện pháp bảo
                mật toàn diện
              </p>
              <button className="learn-more-btn">Tìm hiểu thêm →</button>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <circle cx="24" cy="24" r="20" fill="#FEE2E2" stroke="#EF4444" strokeWidth="2" />
                  <path
                    d="M16 24l6 6 12-12"
                    stroke="#EF4444"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3>Đảm bảo an ninh</h3>
              <p>
                Thể hiện cam kết bảo mật dữ liệu người dùng thông qua mã hóa và các biện pháp bảo
                mật toàn diện
              </p>
              <button className="learn-more-btn">Tìm hiểu thêm →</button>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <circle cx="24" cy="24" r="20" fill="#DBEAFE" stroke="#3B82F6" strokeWidth="2" />
                  <path
                    d="M20 28l4 4 8-8"
                    stroke="#3B82F6"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3>Đảm bảo an ninh</h3>
              <p>
                Thể hiện cam kết bảo mật dữ liệu người dùng thông qua mã hóa và các biện pháp bảo
                mật toàn diện
              </p>
              <button className="learn-more-btn">Tìm hiểu thêm →</button>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
