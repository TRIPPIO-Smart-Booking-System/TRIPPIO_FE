export default function PopularDestinations() {
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
          {/* Các destination-card khác tương tự */}
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
          {/* Thêm các card khác tương tự */}
        </div>
      </div>
    </section>
  );
}
