/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
import { getAuth, extractUserIdFromJwt } from './auth';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE ?? 'https://trippiowebapp.azurewebsites.net';

function isFormData(v: unknown): v is FormData {
  return typeof FormData !== 'undefined' && v instanceof FormData;
}

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'X-Requested-With': 'XMLHttpRequest' }, // KHÔNG set Content-Type mặc định
  withCredentials: true,
  timeout: 20000,
});

api.interceptors.request.use((config: any) => {
  const { accessToken } = getAuth();
  if (accessToken) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  if (isFormData(config.data)) {
    // để trống cho browser tự gắn boundary
    if (config.headers) delete config.headers['Content-Type'];
  } else {
    config.headers = { ...(config.headers || {}), 'Content-Type': 'application/json' };
  }
  return config;
});

export type UserResponse = {
  id: string;
  userName: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  phoneNumber: string | null;
  isActive: boolean;
  avatar: string | null;
  balance: number;
  lastLoginDate: string | null;
  dateCreated: string;
  dob: string | null;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isFirstLogin: boolean;
  fullName: string;
  roles: string[];
};

export type UpdateUserPayload = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  dob?: string;
  avatar?: string;
};

async function handle<T>(p: PromiseLike<any>): Promise<T> {
  try {
    const res: any = await p;
    return res.data as T;
  } catch (err: any) {
    const status: number | undefined = err?.response?.status;
    const data = err?.response?.data;
    try {
      console.error('API error:', status, typeof data === 'string' ? data : JSON.stringify(data));
    } catch {}
    const msg =
      (typeof data === 'object' && (data?.message || data?.error)) ||
      (typeof data === 'string' ? data : undefined);
    if (typeof status === 'number') throw new Error(msg ?? `HTTP ${status}`);
    throw err instanceof Error ? err : new Error('HTTP ERROR');
  }
}

/* ========================= Me ========================= */
export function apiGetMe() {
  return handle<UserResponse>(api.get('/api/user/me'));
}
export function apiUpdateMe(body: UpdateUserPayload) {
  return handle<UserResponse>(api.put('/api/user/me', body));
}
export function getCurrentUserId(): string | undefined {
  const { userId, accessToken } = getAuth();
  return userId || extractUserIdFromJwt(accessToken);
}

/* ========================= Avatar (FILE ONLY) ========================= */
// ✅ POST /api/user/avatar  — multipart/form-data, field: "file"
export function apiUploadAvatar(file: File) {
  const fd = new FormData();
  fd.append('file', file); // tên field đúng theo Swagger
  return handle<UserResponse>(api.post('/api/user/avatar', fd));
}
/** 🔹 Admin endpoints */
export function apiAdminAssignRoles(userId: string, roles: string[]) {
  return handle<void>(api.put(`/api/admin/user/${userId}/assign-roles`, roles));
}
export default api;
