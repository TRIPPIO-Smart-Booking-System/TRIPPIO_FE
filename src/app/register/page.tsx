import Link from 'next/link';
import RegisterForm from '@/components/auth/RegisterForm';

export default function RegisterPage() {
  return (
    <div className="container max-w-screen-2xl py-16">
      <div className="mx-auto max-w-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Đăng ký</h1>
          <p className="mt-2 text-muted-foreground">Tạo tài khoản để nhận ưu đãi đặc biệt</p>
        </div>

        <div className="mt-8">
          <RegisterForm />
        </div>

        <div className="mt-6 text-center text-sm">
          <p className="text-muted-foreground">
            Đã có tài khoản?{' '}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
