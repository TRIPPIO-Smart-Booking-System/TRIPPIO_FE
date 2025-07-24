'use client';

import { useState, useCallback } from 'react';

interface Tab {
  id: string;
  label: string;
  icon?: string;
}

interface SearchData {
  // Common fields
  destination: string;
  checkin: string;
  checkout: string;
  guests: number;
  rooms: number;

  // Flight fields
  departure: string;
  arrival: string;
  departureDate: string;
  returnDate: string;
  passengers: number;
  tripType: 'oneway' | 'roundtrip';

  // Airport transfer fields
  pickupLocation: string;
  dropoffLocation: string;
  pickupDate: string;
  pickupTime: string;

  // Car rental fields
  carPickupLocation: string;
  carDropoffLocation: string;
  carPickupDate: string;
  carDropoffDate: string;
  carPickupTime: string;
  carDropoffTime: string;

  // Activities fields
  activityLocation: string;
  startDate: string;
  endDate: string;
  participants: number;
  activityType: string;
}

interface UseSearchTabsProps {
  tabs: Tab[];
  defaultActiveTab?: string;
  onSearch?: (data: SearchData & { type: string }) => void;
}

export function useSearchTabs({ tabs, defaultActiveTab, onSearch }: UseSearchTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultActiveTab || tabs[0]?.id || '');
  const [searchData, setSearchData] = useState<SearchData>({
    destination: '',
    checkin: '',
    checkout: '',
    guests: 2,
    rooms: 1,
    departure: '',
    arrival: '',
    departureDate: '',
    returnDate: '',
    passengers: 1,
    tripType: 'roundtrip',
    pickupLocation: '',
    dropoffLocation: '',
    pickupDate: '',
    pickupTime: '09:00',
    carPickupLocation: '',
    carDropoffLocation: '',
    carPickupDate: '',
    carDropoffDate: '',
    carPickupTime: '09:00',
    carDropoffTime: '09:00',
    activityLocation: '',
    startDate: '',
    endDate: '',
    participants: 2,
    activityType: '',
  });

  const handleTabChange = useCallback((tabId: string) => {
    setActiveTab(tabId);
  }, []);

  const updateSearchField = useCallback((field: keyof SearchData, value: any) => {
    setSearchData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (onSearch) {
        onSearch({ ...searchData, type: activeTab });
      }
    },
    [searchData, activeTab, onSearch]
  );

  const isTabActive = useCallback(
    (tabId: string) => {
      return activeTab === tabId;
    },
    [activeTab]
  );

  return {
    activeTab,
    handleTabChange,
    searchData,
    updateSearchField,
    handleSearch,
    isTabActive,
  };
}
