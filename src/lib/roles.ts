export type Role = 'customer' | 'staff' | 'admin';

export function hasAnyRole(userRoles?: string[] | null, required?: Role[] | null) {
  if (!required || required.length === 0) return true;
  if (!userRoles || userRoles.length === 0) return false;
  const lower = userRoles.map((r) => r.toLowerCase());
  return required.some((r) => lower.includes(r));
}

// Quy ước:
// - admin: full quyền
// - staff: vào khu staff và (tùy bạn) có thể vào một phần admin readonly
// - user: khu khách
export const PATH_ROLES: Record<string, Role[]> = {
  '/admin': ['admin'],
  '/staff': ['admin', 'staff'],
  // ví dụ bắt buộc đăng nhập cho account:
  '/(site)/account': ['customer', 'staff', 'admin'],
};
