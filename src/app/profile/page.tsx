'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function ProfilePage() {
  const [user, setUser] = useState({
    firstName: 'Nguyễn',
    lastName: 'Văn A',
    email: 'nguyenvana@gmail.com',
    phone: '0123456789',
    city: 'TP HCM',
    birthDate: '30/08/1990',
    gender: 'Nam',
  });

  // Kiểm tra xem người dùng đã đăng nhập chưa
  useEffect(() => {
    // Trong thực tế, bạn sẽ kiểm tra trạng thái đăng nhập từ context hoặc API
    // Đây chỉ là mô phỏng
    const checkAuth = async () => {
      // Giả lập kiểm tra xác thực
      const isLoggedIn = localStorage.getItem('isLoggedIn');
      if (!isLoggedIn) {
        window.location.href = '/login';
      } else {
        // Lấy thông tin người dùng từ localStorage nếu đã có
        const savedProfile = localStorage.getItem('userProfile');
        if (savedProfile) {
          try {
            const profileData = JSON.parse(savedProfile);
            setUser(profileData);
          } catch (error) {
            console.error('Lỗi khi phân tích dữ liệu profile:', error);
          }
        }
      }
    };

    checkAuth();
  }, []);

  // Hàm xử lý khi người dùng thay đổi thông tin
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setUser((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  // Hàm xử lý khi người dùng lưu thay đổi
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Lưu tất cả thông tin người dùng vào localStorage
    localStorage.setItem('profileName', user.firstName);
    localStorage.setItem('userProfile', JSON.stringify(user));
    // Kích hoạt sự kiện storage để Header cập nhật
    window.dispatchEvent(new Event('storage'));
    alert('Đã lưu thông tin thành công!');
  };

  return (
    <div className="container max-w-screen-2xl py-16">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold">Tài khoản của tôi</h1>

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin cá nhân</CardTitle>
                <CardDescription>Quản lý thông tin cá nhân của bạn</CardDescription>
              </CardHeader>
              <CardContent>
                <nav className="flex flex-col space-y-2">
                  <Link href="/profile" className="font-medium text-primary">
                    Thông tin cá nhân
                  </Link>
                  <Link
                    href="/profile/bookings"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Đặt chỗ của tôi
                  </Link>
                  <Link
                    href="/profile/notifications"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Thông báo giá vé
                  </Link>
                </nav>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Cài đặt hồ sơ</CardTitle>
                <CardDescription>Cập nhật thông tin cá nhân của bạn</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium">
                        Tên đầy đủ
                      </label>
                      <input
                        id="firstName"
                        type="text"
                        value={user.firstName}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor="gender" className="block text-sm font-medium">
                        Giới tính
                      </label>
                      <select
                        id="gender"
                        value={user.gender}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option>Nam</option>
                        <option>Nữ</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={user.email}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium">
                      Số điện thoại
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      value={user.phone}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="city" className="block text-sm font-medium">
                      Thành phố cư trú
                    </label>
                    <input
                      id="city"
                      type="text"
                      value={user.city}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="birthDate" className="block text-sm font-medium">
                      Ngày sinh
                    </label>
                    <input
                      id="birthDate"
                      type="text"
                      value={user.birthDate}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit">Lưu thay đổi</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
