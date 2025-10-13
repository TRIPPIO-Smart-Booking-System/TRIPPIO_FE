// src/lib/logout.ts
import { clearAuthStorage, broadcastLogout } from './auth';

export async function logoutClientOnly() {
  // Không gọi BE — chỉ dọn local
  clearAuthStorage();
  broadcastLogout();
}
