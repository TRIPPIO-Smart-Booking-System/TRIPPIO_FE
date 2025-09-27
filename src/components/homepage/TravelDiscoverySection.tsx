export default function TravelDiscoverySection() {
  return (
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
  );
}
