// src/lib/http.ts
const API_BASE = process.env.NEXT_PUBLIC_API_BASE; // phải có vì gọi từ client

function joinUrl(base: string, path: string) {
  if (!base) return path;
  if (base.endsWith('/') && path.startsWith('/')) return base + path.slice(1);
  if (!base.endsWith('/') && !path.startsWith('/')) return base + '/' + path;
  return base + path;
}

export async function postJSON<T = any>(
  url: string,
  body: unknown,
  init?: RequestInit
): Promise<T> {
  const isAbsolute = /^https?:\/\//i.test(url);

  // Nếu là đường dẫn backend (/api/...) → prepend API_BASE
  let target = url;
  if (url.startsWith('/api/')) {
    if (!API_BASE) {
      throw new Error('NEXT_PUBLIC_API_BASE is not set (client)');
    }
    target = joinUrl(API_BASE, url); // -> http://localhost:7142/api/...
  } else if (!isAbsolute) {
    // các relative khác (không bắt đầu /api/) giữ nguyên
    target = url;
  }

  // Debug:
  // console.log('[postJSON] target =', target);

  const res = await fetch(target, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    body: JSON.stringify(body),
    ...init,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (data && (data.message || data.error)) || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data as T;
}
