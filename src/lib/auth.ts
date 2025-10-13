// src/lib/auth.ts

export type AuthState = {
  accessToken?: string;
  refreshToken?: string;
  userId?: string;
  email?: string;
};

const AUTH_KEY = 'trip_auth';
export const AUTH_EVENT_NAME = 'auth:changed';

// ----- Utils an toàn môi trường (SSR/CSR) -----
const hasWindow = typeof window !== 'undefined';
const getStorage = (): Storage | null => (hasWindow ? window.localStorage : null);

// ----- Helpers cơ bản -----
export function getAuth(): AuthState {
  try {
    const s = getStorage();
    if (!s) return {};
    const raw = s.getItem(AUTH_KEY);
    return raw ? (JSON.parse(raw) as AuthState) : {};
  } catch {
    return {};
  }
}

export function isLoggedIn(): boolean {
  const a = getAuth();
  return !!a.accessToken; // hoặc kiểm tra thêm userId nếu cần
}

export function setAuth(next: AuthState): void {
  const s = getStorage();
  if (!s) return;
  const cur = getAuth();
  s.setItem(AUTH_KEY, JSON.stringify({ ...cur, ...next }));
  if (hasWindow) window.dispatchEvent(new Event(AUTH_EVENT_NAME));
}

export function clearAuth(): void {
  const s = getStorage();
  if (!s) return;
  s.removeItem(AUTH_KEY);
  if (hasWindow) window.dispatchEvent(new Event(AUTH_EVENT_NAME));
}

// Lấy nhanh accessToken (tiện cho interceptor)
export function getAccessToken(): string | undefined {
  return getAuth().accessToken;
}

// ----- JWT helpers -----
function safeAtob(input: string): string {
  try {
    return atob(input);
  } catch {
    // Node/SSR không có atob
    if (typeof Buffer !== 'undefined') {
      return Buffer.from(input, 'base64').toString('utf-8');
    }
    throw new Error('No base64 decoder available');
  }
}

export function extractUserIdFromJwt(token?: string): string | undefined {
  if (!token) return;
  try {
    const payloadB64 = token.split('.')[1] || '';
    const json = safeAtob(payloadB64);
    const payload = JSON.parse(json);
    return payload?.id || payload?.sub || payload?.userId;
  } catch {
    return;
  }
}

// (Tuỳ chọn) Tiện ích gộp khi nhận response login từ BE
export type LoginSuccessPayload = {
  token?: string; // accessToken
  accessToken?: string;
  refreshToken?: string;
  user?: { id?: string; email?: string } | null;
  userId?: string;
  email?: string;
};

export function applyLoginPayload(p: LoginSuccessPayload): void {
  const accessToken = p.accessToken ?? p.token;
  const userId = p.userId ?? p.user?.id ?? extractUserIdFromJwt(accessToken);
  const email = p.email ?? p.user?.email;

  setAuth({
    accessToken,
    refreshToken: p.refreshToken,
    userId,
    email,
  });
}
