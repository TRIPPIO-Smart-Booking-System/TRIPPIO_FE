// lib/http.ts
export const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL!;

export async function postJSON<T>(path: string, body: unknown, init?: RequestInit) {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    body: JSON.stringify(body),
    credentials: 'include', // nếu backend set cookie httpOnly
    ...init,
  });

  // Parse JSON (kể cả lỗi)
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg = (data?.message || data?.error || 'Request failed') as string;
    throw new Error(msg);
  }
  return data as T;
}
