// src/lib/auth.ts

export type AuthState = {
  accessToken?: string;
  refreshToken?: string;
  userId?: string;
  email?: string;

  // tiện hiển thị
  userName?: string;
  userPhone?: string;

  // dùng cho guard/điều hướng theo quyền
  roles?: string[];
};

export type CachedUser = {
  id: string;
  userName?: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  phoneNumber?: string | null;
  avatar?: string | null;
  dob?: string | null;
  fullName?: string | null;
  roles?: string[];
  [k: string]: unknown;
};

const AUTH_KEY = 'trip_auth';
// Map cache: { [userId]: CachedUser }
const USER_MAP_KEY = 'trip_user_map';

export const AUTH_EVENT_NAME = 'auth:changed';

// Khóa riêng để checkout đọc trực tiếp khi cần
const LS_USER_NAME = 'userName';
const LS_USER_PHONE = 'userPhone';

// ----- Utils an toàn môi trường (SSR/CSR) -----
const hasWindow = typeof window !== 'undefined';
const getStorage = (): Storage | null => (hasWindow ? window.localStorage : null);

// ==================== Helpers cơ bản ====================
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
  return !!a.accessToken;
}

export function setAuth(next: AuthState): void {
  const s = getStorage();
  if (!s) return;
  const cur = getAuth();
  const merged: AuthState = { ...cur, ...next };

  // mirror buyer info để checkout điền sẵn
  try {
    if (merged.userName) s.setItem(LS_USER_NAME, String(merged.userName));
    if (merged.userPhone) s.setItem(LS_USER_PHONE, String(merged.userPhone));
  } catch {}

  s.setItem(AUTH_KEY, JSON.stringify(merged));
  if (hasWindow) window.dispatchEvent(new Event(AUTH_EVENT_NAME));
}

export function clearAuth(): void {
  const s = getStorage();
  if (!s) return;
  s.removeItem(AUTH_KEY);
  // KHÔNG xoá USER_MAP_KEY để giữ cache các user khác (tuỳ nhu cầu)
  if (hasWindow) window.dispatchEvent(new Event(AUTH_EVENT_NAME));
}

export function getAccessToken(): string | undefined {
  return getAuth().accessToken;
}

// ==================== JWT helpers ====================
function safeAtob(input: string): string {
  try {
    return atob(input);
  } catch {
    if (typeof Buffer !== 'undefined') {
      return Buffer.from(input, 'base64').toString('utf-8');
    }
    throw new Error('No base64 decoder available');
  }
}

/** Lấy userId từ JWT (hỗ trợ base64url & claim .NET phổ biến) */
export function extractUserIdFromJwt(token?: string): string | undefined {
  if (!token) return;
  try {
    const payloadB64 = token.split('.')[1] || '';
    const norm = payloadB64.replace(/-/g, '+').replace(/_/g, '/');
    const json = safeAtob(norm);
    const payload = JSON.parse(json);

    return (
      payload?.id ||
      payload?.sub ||
      payload?.userId ||
      payload?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']
    );
  } catch {
    return;
  }
}

/** Lấy userId hiện tại (ưu tiên state, fallback decode JWT) */
export function getCurrentUserId(): string | undefined {
  const a = getAuth();
  return a.userId || extractUserIdFromJwt(a.accessToken);
}

// ==================== Persist buyer info ====================
// A lightweight "user-like" shape we might receive từ nhiều BE khác nhau
type BuyerLike = Partial<Pick<CachedUser, 'fullName' | 'userName' | 'phoneNumber' | 'email'>> & {
  name?: string;
  phone?: string;
};

function persistBuyerInfo(user: BuyerLike | undefined | null) {
  if (!hasWindow) return;
  try {
    const s = getStorage();
    if (!s) return;

    const buyerName =
      user?.fullName || user?.name || user?.userName || s.getItem(LS_USER_NAME) || '';
    const buyerPhone = user?.phoneNumber || user?.phone || s.getItem(LS_USER_PHONE) || '';

    if (buyerName) s.setItem(LS_USER_NAME, String(buyerName));
    if (buyerPhone) s.setItem(LS_USER_PHONE, String(buyerPhone));
  } catch {}
}

export function getBuyerPreset(): {
  userId?: string;
  buyerName?: string;
  buyerEmail?: string;
  buyerPhone?: string;
} {
  const s = getStorage();
  const a = getAuth();
  return {
    userId: a.userId,
    buyerName: (s && s.getItem(LS_USER_NAME)) || a.userName || undefined,
    buyerEmail: a.email || undefined,
    buyerPhone: (s && s.getItem(LS_USER_PHONE)) || a.userPhone || undefined,
  };
}

export function clearBuyerCache(): void {
  const s = getStorage();
  if (!s) return;
  try {
    s.removeItem(LS_USER_NAME);
    s.removeItem(LS_USER_PHONE);
  } catch {}
}

// ==================== USER MAP (cache hồ sơ theo userId) ====================
function readUserMap(): Record<string, CachedUser> {
  try {
    const s = getStorage();
    if (!s) return {};
    const raw = s.getItem(USER_MAP_KEY);
    return raw ? (JSON.parse(raw) as Record<string, CachedUser>) : {};
  } catch {
    return {};
  }
}
function writeUserMap(map: Record<string, CachedUser>) {
  const s = getStorage();
  if (!s) return;
  s.setItem(USER_MAP_KEY, JSON.stringify(map));
}

/** Lưu full user vào cache theo userId hiện tại */
export function saveLoggedInUser(u: CachedUser | null | undefined) {
  if (!u) return;
  const uid = String(u.id || '') || getCurrentUserId();
  if (!uid) return;

  const normRoles = Array.isArray(u.roles)
    ? u.roles.map((r) =>
        String(r || '')
          .toLowerCase()
          .replace(/^role_/, '')
      )
    : [];

  const map = readUserMap();
  map[uid] = { ...u, id: uid, roles: normRoles };
  writeUserMap(map);

  // đồng bộ vài field sang AuthState
  setAuth({
    userId: uid,
    email: (u.email ?? undefined) as string | undefined,
    userName: (u.fullName || u.userName || undefined) as string | undefined,
    userPhone: (u.phoneNumber || undefined) as string | undefined,
    roles: normRoles,
  });

  if (hasWindow) window.dispatchEvent(new Event(AUTH_EVENT_NAME));
}

/** Lấy user cache theo userId hiện tại */
export function getCachedUser(): CachedUser | null {
  const uid = getCurrentUserId();
  if (!uid) return null;
  const map = readUserMap();
  return map[uid] ?? null;
}

/** Gộp (merge) partial profile vào cache hiện tại */
export function mergeCachedUser(patch: Partial<CachedUser>) {
  const uid = getCurrentUserId();
  if (!uid || !patch) return;
  const map = readUserMap();
  const cur = map[uid] ?? ({ id: uid } as CachedUser);
  map[uid] = { ...cur, ...patch, id: uid };
  writeUserMap(map);
  if (hasWindow) window.dispatchEvent(new Event(AUTH_EVENT_NAME));
}

/** Xoá cache của user hiện tại (tuỳ chọn gọi khi logout) */
export function clearCurrentUserCache() {
  const uid = getCurrentUserId();
  if (!uid) return;
  const map = readUserMap();
  delete map[uid];
  writeUserMap(map);
}

// ==================== Role helpers ====================
export function getRoles(): string[] {
  return getAuth().roles ?? getCachedUser()?.roles ?? [];
}
export function hasRole(r: string): boolean {
  return getRoles().includes(String(r).toLowerCase());
}

// ==================== Apply login payload ====================
export type LoginSuccessPayload = {
  token?: string; // alias accessToken
  accessToken?: string;
  refreshToken?: string;
  user?: CachedUser | null;
  userId?: string;
  email?: string;

  userName?: string;
  userPhone?: string;

  roles?: string[] | string;
};

function normalizeRoles(r?: string[] | string): string[] | undefined {
  if (!r) return undefined;
  const arr = Array.isArray(r) ? r : [r];
  const norm = arr
    .map((x) => String(x || '').toLowerCase())
    .map((x) => (x.startsWith('role_') ? x.slice(5) : x));
  return norm.length ? norm : undefined;
}

export function applyLoginPayload(p: LoginSuccessPayload): void {
  const accessToken = p.accessToken ?? p.token;

  // Nếu không có token → fail
  if (!accessToken) {
    persistBuyerInfo(p.user as BuyerLike | null | undefined);
    clearAuth();
    return;
  }

  // Lưu buyer preset
  persistBuyerInfo(p.user as BuyerLike | null | undefined);

  // Tính toán các trường cơ bản
  const userId =
    p.userId ?? (p.user?.id as string | undefined) ?? extractUserIdFromJwt(accessToken);

  const email = p.email ?? (p.user?.email as string | undefined);
  const userName =
    p.userName ||
    (p.user?.fullName as string | undefined) ||
    (p.user?.userName as string | undefined);

  const userPhone =
    p.userPhone ??
    (typeof p.user?.phoneNumber === 'string' ? p.user.phoneNumber : undefined) ??
    (p.user && typeof (p.user as Record<string, unknown>).phone === 'string'
      ? ((p.user as Record<string, unknown>).phone as string)
      : undefined);

  const roles = normalizeRoles(p.roles ?? p.user?.roles);

  // Lưu AuthState
  setAuth({
    accessToken,
    refreshToken: p.refreshToken,
    userId,
    email,
    userName,
    userPhone,
    roles,
  });

  // Lưu cache user đầy đủ (theo userId) nếu có
  if (p.user) {
    saveLoggedInUser({
      ...p.user,
      id: p.user.id || (userId as string),
      roles: roles ?? p.user.roles,
    });
  }
}
