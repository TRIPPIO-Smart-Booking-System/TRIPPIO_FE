// src/lib/logout.ts
import { clearAuthStorage, broadcastLogout } from './auth';
import { clearCache } from './dataCache';

export async function logoutClientOnly() {
  // Không gọi BE — chỉ dọn local
  clearAuthStorage();
  clearCache(); // Clear data cache on logout
  broadcastLogout();
}
