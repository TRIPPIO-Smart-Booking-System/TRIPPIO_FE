export default function PromotionalOffers() {
  return (
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
  );
}
