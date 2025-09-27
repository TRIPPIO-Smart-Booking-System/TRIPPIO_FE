export default function WhyChooseUs() {
  return (
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
              Thể hiện cam kết bảo mật dữ liệu người dùng thông qua mã hóa và các biện pháp bảo mật
              toàn diện
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
              Thể hiện cam kết bảo mật dữ liệu người dùng thông qua mã hóa và các biện pháp bảo mật
              toàn diện
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
              Thể hiện cam kết bảo mật dữ liệu người dùng thông qua mã hóa và các biện pháp bảo mật
              toàn diện
            </p>
            <button className="learn-more-btn">Tìm hiểu thêm →</button>
          </div>
        </div>
      </div>
    </section>
  );
}
