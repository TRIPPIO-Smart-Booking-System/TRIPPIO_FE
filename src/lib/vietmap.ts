// src/lib/vietmap.ts
const VM_BASE = 'https://maps.vietmap.vn/api/autocomplete/v3'; // theo docs ver 3.0
// Đặt khóa ở .env.local: NEXT_PUBLIC_VIETMAP_API_KEY=your_key
const API_KEY = process.env.NEXT_PUBLIC_VIETMAP_API_KEY;

export type VMPlace = {
  name: string;
  address?: string;
  // ... có thể mở rộng theo response thực tế
};

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

  // Cách “giới hạn theo địa bàn” an toàn nhất là nối ngữ cảnh vào text
  // để provider ưu tiên street thuộc khu vực này.
  const contextual = [text.trim(), districtName, provinceName].filter(Boolean).join(', ');

  const url = `${VM_BASE}?text=${encodeURIComponent(contextual)}&apikey=${encodeURIComponent(key)}&limit=${limit}`;

  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  // Chuẩn hoá tối thiểu
  const items: VMPlace[] = Array.isArray(data?.data ?? data?.features ?? data)
    ? (data.data ?? data.features ?? data).map((x: any) => ({
        name: x?.name || x?.properties?.name || x?.text || '',
        address: x?.address || x?.properties?.full_address || x?.place_name || '',
      }))
    : [];
  return items;
}
