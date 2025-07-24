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
          <h2 className="section-title">Khám phá hàng đầu</h2>
          <div className="destinations-grid">
            <div className="destination-card">
              <img src="/images/halong.jpg" alt="Hạ Long" />
              <div className="destination-info">
                <h3>Hạ Long</h3>
                <p>Quảng Ninh</p>
                <span className="price">Từ 2.500.000đ</span>
              </div>
            </div>
            <div className="destination-card">
              <img src="/images/hoian.jpg" alt="Hội An" />
              <div className="destination-info">
                <h3>Hội An</h3>
                <p>Quảng Nam</p>
                <span className="price">Từ 1.800.000đ</span>
              </div>
            </div>
            <div className="destination-card">
              <img src="/images/dalat.jpg" alt="Đà Lạt" />
              <div className="destination-info">
                <h3>Đà Lạt</h3>
                <p>Lâm Đồng</p>
                <span className="price">Từ 2.200.000đ</span>
              </div>
            </div>
            <div className="destination-card">
              <img src="/images/phuquoc.jpg" alt="Phú Quốc" />
              <div className="destination-info">
                <h3>Phú Quốc</h3>
                <p>Kiên Giang</p>
                <span className="price">Từ 3.200.000đ</span>
              </div>
            </div>
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
