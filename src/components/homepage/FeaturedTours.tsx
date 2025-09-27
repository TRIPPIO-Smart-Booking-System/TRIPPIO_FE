export default function FeaturedTours() {
  return (
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
          {/* Thêm các tour card khác tương tự */}
        </div>
      </div>
    </section>
  );
}
