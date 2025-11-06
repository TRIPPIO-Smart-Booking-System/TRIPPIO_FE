/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
import { getAuth, extractUserIdFromJwt } from './auth';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE ?? 'https://trippio.azurewebsites.net';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
  withCredentials: true,
  timeout: 20000,
});

api.interceptors.request.use((config: any) => {
  const { accessToken } = getAuth();
  if (accessToken) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${accessToken}`;
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
  dob?: string; // ISO
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
    if (typeof status === 'number') throw new Error(`HTTP ${status}`);
    throw err instanceof Error ? err : new Error('HTTP ERROR');
  }
}

/** 🔹 Me endpoints (dùng thay cho /api/admin/user/{id}) */
export function apiGetMe() {
  return handle<UserResponse>(api.get('/api/user/me'));
}
export function apiUpdateMe(body: UpdateUserPayload) {
  return handle<UserResponse>(api.put('/api/user/me', body));
}

/** (Giữ lại nếu còn nơi khác dùng) */
export function getCurrentUserId(): string | undefined {
  const { userId, accessToken } = getAuth();
  return userId || extractUserIdFromJwt(accessToken);
}
export function apiUpdateAvatarUrl(avatar: string) {
  return handle<UserResponse>(api.put('/api/user/avatar', { avatar }));
}

export function apiUploadAvatar(file: File) {
  const fd = new FormData();
  fd.append('avatar', file); // tên field = "avatar"
  return handle<UserResponse>(
    api.put('/api/user/avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
  );
}
