import Link from 'next/link';
import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="container max-w-screen-2xl py-16">
      <div className="mx-auto max-w-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Đăng nhập</h1>
          <p className="mt-2 text-muted-foreground">
            Đăng nhập để trải nghiệm dịch vụ du lịch tốt nhất
          </p>
        </div>

        <div className="mt-8">
          <LoginForm />
        </div>

        <div className="mt-6 text-center text-sm">
          <p className="text-muted-foreground">
            Chưa có tài khoản?{' '}
            <Link href="/register" className="font-medium text-primary hover:underline">
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
