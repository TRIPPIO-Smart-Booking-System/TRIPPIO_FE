import RequireRole from '@/components/auth/RequireRole';

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return <RequireRole roles={['admin', 'staff']}>{children}</RequireRole>;
}
