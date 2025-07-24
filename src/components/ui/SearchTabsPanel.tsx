'use client';

import { useSearchTabs } from '@/hooks/useSearchTabs';
import './SearchTabsPanel.css';

interface Tab {
  id: string;
  label: string;
  icon?: string;
}

interface SearchTabsPanelProps {
  tabs: Tab[];
  defaultActiveTab?: string;
  onSearch?: (data: any) => void;
}

export default function SearchTabsPanel({
  tabs,
  defaultActiveTab,
  onSearch,
}: SearchTabsPanelProps) {
  const { activeTab, handleTabChange, searchData, updateSearchField, handleSearch, isTabActive } =
    useSearchTabs({ tabs, defaultActiveTab, onSearch });

  const renderSearchFields = () => {
    switch (activeTab) {
      case 'hotels':
        return (
          <>
            <div className="search-field">
              <label>Điểm đến</label>
              <input
                type="text"
                value={searchData.destination}
                onChange={(e) => updateSearchField('destination', e.target.value)}
                placeholder="Nhập điểm đến"
              />
            </div>
            <div className="search-field">
              <label>Ngày nhận phòng</label>
              <input
                type="date"
                value={searchData.checkin}
                onChange={(e) => updateSearchField('checkin', e.target.value)}
              />
            </div>
            <div className="search-field">
              <label>Ngày trả phòng</label>
              <input
                type="date"
                value={searchData.checkout}
                onChange={(e) => updateSearchField('checkout', e.target.value)}
              />
            </div>
            <div className="search-field">
              <label>Số khách</label>
              <select
                value={searchData.guests}
                onChange={(e) => updateSearchField('guests', parseInt(e.target.value))}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                  <option key={num} value={num}>
                    {num} người
                  </option>
                ))}
              </select>
            </div>
          </>
        );

      case 'flights':
        return (
          <>
            <div className="search-field">
              <label>Điểm khởi hành</label>
              <input
                type="text"
                value={searchData.departure}
                onChange={(e) => updateSearchField('departure', e.target.value)}
                placeholder="Thành phố khởi hành"
              />
            </div>
            <div className="search-field">
              <label>Điểm đến</label>
              <input
                type="text"
                value={searchData.arrival}
                onChange={(e) => updateSearchField('arrival', e.target.value)}
                placeholder="Thành phố đến"
              />
            </div>
            <div className="search-field">
              <label>Ngày đi</label>
              <input
                type="date"
                value={searchData.departureDate}
                onChange={(e) => updateSearchField('departureDate', e.target.value)}
              />
            </div>
            <div className="search-field">
              <label>Số hành khách</label>
              <select
                value={searchData.passengers}
                onChange={(e) => updateSearchField('passengers', parseInt(e.target.value))}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                  <option key={num} value={num}>
                    {num} người
                  </option>
                ))}
              </select>
            </div>
          </>
        );

      case 'airport-transfer':
        return (
          <>
            <div className="search-field">
              <label>Điểm đón</label>
              <input
                type="text"
                value={searchData.pickupLocation}
                onChange={(e) => updateSearchField('pickupLocation', e.target.value)}
                placeholder="Sân bay hoặc địa chỉ"
              />
            </div>
            <div className="search-field">
              <label>Điểm đến</label>
              <input
                type="text"
                value={searchData.dropoffLocation}
                onChange={(e) => updateSearchField('dropoffLocation', e.target.value)}
                placeholder="Khách sạn hoặc địa chỉ"
              />
            </div>
            <div className="search-field">
              <label>Ngày đón</label>
              <input
                type="date"
                value={searchData.pickupDate}
                onChange={(e) => updateSearchField('pickupDate', e.target.value)}
              />
            </div>
            <div className="search-field">
              <label>Giờ đón</label>
              <input
                type="time"
                value={searchData.pickupTime}
                onChange={(e) => updateSearchField('pickupTime', e.target.value)}
              />
            </div>
          </>
        );

      case 'car-rental':
        return (
          <>
            <div className="search-field">
              <label>Địa điểm nhận xe</label>
              <input
                type="text"
                value={searchData.carPickupLocation}
                onChange={(e) => updateSearchField('carPickupLocation', e.target.value)}
                placeholder="Thành phố hoặc sân bay"
              />
            </div>
            <div className="search-field">
              <label>Ngày nhận xe</label>
              <input
                type="date"
                value={searchData.carPickupDate}
                onChange={(e) => updateSearchField('carPickupDate', e.target.value)}
              />
            </div>
            <div className="search-field">
              <label>Ngày trả xe</label>
              <input
                type="date"
                value={searchData.carDropoffDate}
                onChange={(e) => updateSearchField('carDropoffDate', e.target.value)}
              />
            </div>
            <div className="search-field">
              <label>Giờ nhận xe</label>
              <input
                type="time"
                value={searchData.carPickupTime}
                onChange={(e) => updateSearchField('carPickupTime', e.target.value)}
              />
            </div>
          </>
        );

      case 'activities':
        return (
          <>
            <div className="search-field">
              <label>Địa điểm</label>
              <input
                type="text"
                value={searchData.activityLocation}
                onChange={(e) => updateSearchField('activityLocation', e.target.value)}
                placeholder="Thành phố hoặc khu vực"
              />
            </div>
            <div className="search-field">
              <label>Ngày bắt đầu</label>
              <input
                type="date"
                value={searchData.startDate}
                onChange={(e) => updateSearchField('startDate', e.target.value)}
              />
            </div>
            <div className="search-field">
              <label>Loại hoạt động</label>
              <select
                value={searchData.activityType}
                onChange={(e) => updateSearchField('activityType', e.target.value)}
              >
                <option value="">Tất cả</option>
                <option value="tours">Tour du lịch</option>
                <option value="adventure">Phiêu lưu</option>
                <option value="culture">Văn hóa</option>
                <option value="food">Ẩm thực</option>
              </select>
            </div>
            <div className="search-field">
              <label>Số người tham gia</label>
              <select
                value={searchData.participants}
                onChange={(e) => updateSearchField('participants', parseInt(e.target.value))}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <option key={num} value={num}>
                    {num} người
                  </option>
                ))}
              </select>
            </div>
          </>
        );

      default:
        return (
          <div className="search-field">
            <label>Tìm kiếm</label>
            <input
              type="text"
              value={searchData.destination}
              onChange={(e) => updateSearchField('destination', e.target.value)}
              placeholder="Nhập từ khóa tìm kiếm"
            />
          </div>
        );
    }
  };

  return (
    <div className="search-tabs-container">
      <div className="search-tabs-panel">
        {/* Tab Navigation */}
        <div className="tab-navigation">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`tab-button ${isTabActive(tab.id) ? 'active' : ''}`}
              onClick={() => handleTabChange(tab.id)}
            >
              {tab.icon && <span className="tab-icon">{tab.icon}</span>}
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Search Form */}
        <form className="search-form" onSubmit={handleSearch}>
          <div className="search-fields">{renderSearchFields()}</div>
          <button type="submit" className="search-btn">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
            </svg>
            Tìm kiếm
          </button>
        </form>
      </div>
    </div>
  );
}
