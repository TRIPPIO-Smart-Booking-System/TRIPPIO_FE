// src/lib/vietmap.ts
const VM_BASE = 'https://maps.vietmap.vn/api/autocomplete/v3'; // theo docs ver 3.0
// Đặt khóa ở .env.local: NEXT_PUBLIC_VIETMAP_API_KEY=your_key
const API_KEY = process.env.NEXT_PUBLIC_VIETMAP_API_KEY;

export type VMPlace = {
  name: string;
  address?: string;
  // ... có thể mở rộng theo response thực tế
};

// Các shape có thể gặp trong response
type VMRawItem = {
  name?: string;
  address?: string;
  text?: string;
  place_name?: string;
  properties?: {
    name?: string;
    full_address?: string;
  };
};

type VMRawResponse = { data?: VMRawItem[] } | { features?: VMRawItem[] } | VMRawItem[];

export async function vietmapAutocomplete({
  text,
  provinceName,
  districtName,
  limit = 10,
}: {
  text: string;
  provinceName?: string;
  districtName?: string;
  limit?: number;
}): Promise<VMPlace[]> {
  if (!text.trim()) return [];
  const key = API_KEY;
  if (!key) return []; // không có key thì thôi

  // Thêm ngữ cảnh địa bàn vào text để ưu tiên kết quả đúng khu vực
  const contextual = [text.trim(), districtName, provinceName].filter(Boolean).join(', ');

  const url = `${VM_BASE}?text=${encodeURIComponent(contextual)}&apikey=${encodeURIComponent(
    key
  )}&limit=${limit}`;

  const res = await fetch(url);
  if (!res.ok) return [];

  const data: VMRawResponse = await res.json();

  const list: unknown =
    (data as { data?: VMRawItem[] }).data ?? (data as { features?: VMRawItem[] }).features ?? data;

  if (!Array.isArray(list)) return [];

  // Chuẩn hoá tối thiểu
  const items: VMPlace[] = (list as VMRawItem[]).map((x) => ({
    name: x.name ?? x.properties?.name ?? x.text ?? '',
    address: x.address ?? x.properties?.full_address ?? x.place_name ?? '',
  }));

  return items;
}
