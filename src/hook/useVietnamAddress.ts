// src/hooks/useVietnamAddress.ts
'use client';

import { useEffect, useState } from 'react';

// API v2 (sau sáp nhập 07/2025)
const V2 = 'https://provinces.open-api.vn/api/v2';

export type Province = { code: number; name: string; name_en?: string };
export type District = { code: number; name: string; province_code: number };
export type Ward = { code: number; name: string; district_code: number };

export function useVietnamAddress() {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  const [loading, setLoading] = useState(true);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);

  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        // Danh sách tỉnh
        const res = await fetch(`${V2}/p/`, { cache: 'force-cache' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const list: Province[] = Array.isArray(data?.results ?? data) ? (data.results ?? data) : [];
        setProvinces(list.sort((a, b) => a.name.localeCompare(b.name, 'vi')));
      } catch (e) {
        setErr(e instanceof Error ? e.message : 'Load provinces failed');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Tải quận theo tỉnh
  async function loadDistricts(provinceCode?: number) {
    setDistricts([]);
    setWards([]);
    if (!provinceCode) return;
    setLoadingDistricts(true);
    setErr(null);
    try {
      // Lấy chi tiết tỉnh kèm districts
      const res = await fetch(`${V2}/p/${provinceCode}?depth=2`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const list: District[] = Array.isArray(data?.districts) ? data.districts : [];
      setDistricts(list.sort((a, b) => a.name.localeCompare(b.name, 'vi')));
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Load districts failed');
    } finally {
      setLoadingDistricts(false);
    }
  }

  // Tải phường theo quận
  async function loadWards(districtCode?: number) {
    setWards([]);
    if (!districtCode) return;
    setLoadingWards(true);
    setErr(null);
    try {
      const res = await fetch(`${V2}/d/${districtCode}?depth=2`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const list: Ward[] = Array.isArray(data?.wards) ? data.wards : [];
      setWards(list.sort((a, b) => a.name.localeCompare(b.name, 'vi')));
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Load wards failed');
    } finally {
      setLoadingWards(false);
    }
  }

  return {
    provinces,
    districts,
    wards,
    loading,
    loadingDistricts,
    loadingWards,
    err,
    loadDistricts,
    loadWards,
  };
}
