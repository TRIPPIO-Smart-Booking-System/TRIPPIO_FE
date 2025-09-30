import SearchTabsPanel from '@/components/ui/SearchTabsPanel';
import { handleSearch } from '@/utils/searchHandlers';
import { SEARCH_TABS } from '@/constants';

export default function SearchSection() {
  return (
    <section className="search-section">
      <div className="search-content">
        <h1>Khám phá những địa điểm tuyệt đẹp trên thế giới cùng Trippio</h1>
        <p>Tìm kiếm và đặt chỗ dễ dàng với hàng ngàn lựa chọn tại Việt Nam và quốc tế</p>

        <SearchTabsPanel tabs={SEARCH_TABS} defaultActiveTab="hotels" onSearch={handleSearch} />
      </div>
    </section>
  );
}
