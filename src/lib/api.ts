// src/lib/api.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
import { getAuth, extractUserIdFromJwt } from './auth';

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE ??
  'http://localhost:7142';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
  withCredentials: true,
  timeout: 20000,
});

// Request interceptor — KHÔNG dùng type của axios để tránh lỗi phiên bản
api.interceptors.request.use((config: any) => {
  const { accessToken } = getAuth();
  if (accessToken) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// ===== Types =====
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

// handle() chấp nhận mọi PromiseLike (IPromise của axios cũ cũng có .then)
async function handle<T>(p: PromiseLike<any>): Promise<T> {
  const res: any = await p;
  return res.data as T;
}

export function getCurrentUserId(): string | undefined {
  const { userId, accessToken } = getAuth();
  return userId || extractUserIdFromJwt(accessToken);
}

// ===== API wrappers =====
export function apiGetUserById(id: string) {
  return handle<UserResponse>(api.get(`/api/admin/user/${id}`));
}

export function apiUpdateUserById(id: string, body: UpdateUserPayload) {
  return handle<UserResponse>(api.put(`/api/admin/user/${id}`, body));
}
