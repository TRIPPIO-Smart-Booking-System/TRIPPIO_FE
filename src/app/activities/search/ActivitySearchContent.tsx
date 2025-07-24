'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { activities, Activity } from '@/data/activities';
import './search.css';

export default function ActivitySearchContent() {
  const searchParams = useSearchParams();
  const [filteredActivities, setFilteredActivities] = useState<Activity[]>(activities);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const location = searchParams.get('location') || '';
    const activityType = searchParams.get('activityType') || '';
    const participants = parseInt(searchParams.get('participants') || '2');

    // Lọc hoạt động dựa trên tham số tìm kiếm
    let filtered = activities;

    if (location) {
      filtered = filtered.filter(
        (activity) =>
          activity.location.toLowerCase().includes(location.toLowerCase()) ||
          activity.name.toLowerCase().includes(location.toLowerCase())
      );
    }

    if (activityType && activityType !== '') {
      filtered = filtered.filter((activity) => activity.category === activityType);
    }

    if (participants > 0) {
      filtered = filtered.filter(
        (activity) => !activity.maxGroupSize || activity.maxGroupSize >= participants
      );
    }

    setFilteredActivities(filtered);
    setLoading(false);
  }, [searchParams]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span key={index} className={`star ${index < Math.floor(rating) ? 'filled' : ''}`}>
        ★
      </span>
    ));
  };

  if (loading) {
    return (
      <div className="activity-search-page">
        <Header />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tìm kiếm hoạt động...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="activity-search-page">
      <Header />

      {/* Thêm div spacer để đẩy nội dung xuống dưới header */}
      <div style={{ height: '100px' }}></div>

      <div className="search-results-container">
        <div className="search-header">
          <h1>Kết quả tìm kiếm hoạt động</h1>
          <p className="results-count">Tìm thấy {filteredActivities.length} hoạt động phù hợp</p>
        </div>

        <div className="activities-grid">
          {filteredActivities.map((activity) => (
            <div key={activity.id} className="activity-card">
              <div className="activity-image">
                <img src={activity.image} alt={activity.name} />
                <div className="activity-category">{activity.category}</div>
              </div>

              <div className="activity-content">
                <div className="activity-header">
                  <h3 className="activity-name">{activity.name}</h3>
                  <div className="activity-rating">
                    <div className="stars">{renderStars(activity.rating)}</div>
                    <span className="rating-number">{activity.rating}</span>
                    <span className="reviews-count">({activity.reviews} đánh giá)</span>
                  </div>
                </div>

                <div className="activity-details">
                  <div className="location">
                    <span className="icon">📍</span>
                    {activity.location}
                  </div>
                  <div className="duration">
                    <span className="icon">⏱️</span>
                    {activity.duration}
                  </div>
                  {activity.minAge && (
                    <div className="age-limit">
                      <span className="icon">👥</span>
                      Từ {activity.minAge} tuổi
                    </div>
                  )}
                </div>

                <div className="activity-description">
                  <p>{activity.description}</p>
                </div>

                <div className="activity-highlights">
                  <h4>Điểm nổi bật:</h4>
                  <ul>
                    {activity.highlights.slice(0, 3).map((highlight, index) => (
                      <li key={index}>{highlight}</li>
                    ))}
                  </ul>
                </div>

                <div className="activity-footer">
                  <div className="price-section">
                    {activity.originalPrice && (
                      <span className="original-price">{formatPrice(activity.originalPrice)}</span>
                    )}
                    <span className="current-price">{formatPrice(activity.price)}</span>
                    <span className="price-note">/ người</span>
                  </div>

                  <button className="book-button">Đặt ngay</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredActivities.length === 0 && (
          <div className="no-results">
            <h3>Không tìm thấy hoạt động phù hợp</h3>
            <p>Vui lòng thử tìm kiếm với từ khóa khác hoặc mở rộng khu vực tìm kiếm.</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
