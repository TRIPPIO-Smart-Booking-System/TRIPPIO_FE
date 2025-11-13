// src/lib/http.ts
const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'https://trippiowebapp.azurewebsites.net'; // phải có vì gọi từ client

function joinUrl(base: string, path: string) {
  if (!base) return path;
  if (base.endsWith('/') && path.startsWith('/')) return base + path.slice(1);
  if (!base.endsWith('/') && !path.startsWith('/')) return base + '/' + path;
  return base + path;
}

type JsonLike = Record<string, unknown> | unknown[] | string | number | boolean | null;

type ErrorShape = {
  message?: string;
  error?: string;
  [k: string]: unknown;
};

async function safeJson(res: Response): Promise<JsonLike> {
  try {
    return (await res.json()) as JsonLike;
  } catch {
    return {};
  }
}

export async function postJSON<T = unknown>(
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
    target = url;
  }

  const res = await fetch(target, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    body: JSON.stringify(body),
    ...init,
  });

  const data = (await safeJson(res)) as T | ErrorShape;

  if (!res.ok) {
    const e = data as ErrorShape;
    const msg = (e && (e.message || e.error)) || `HTTP ${res.status}`;
    throw new Error(String(msg));
  }

  return data as T;
}
