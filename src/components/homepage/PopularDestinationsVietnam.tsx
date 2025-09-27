export default function PopularDestinationsVietnam() {
  return (
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
  );
}
