'use client';

import Button from '@/components/ui/Button';
import SectionCard from './SectionCard';
import Field from './Field';
import { KeyRound } from 'lucide-react';

export default function SecurityTab() {
  return (
    <div className="space-y-6">
      {/* CHANGE PASSWORD */}
      <SectionCard title="Đổi mật khẩu">
        <div className="grid gap-4 sm:max-w-lg">
          <Field label="Mật khẩu hiện tại">
            <input
              className="w-full rounded-lg border px-3 py-2"
              type="password"
              placeholder="••••••••"
            />
          </Field>
          <Field label="Mật khẩu mới">
            <input
              className="w-full rounded-lg border px-3 py-2"
              type="password"
              placeholder="Ít nhất 8 ký tự"
            />
          </Field>
          <Field label="Xác nhận mật khẩu">
            <input
              className="w-full rounded-lg border px-3 py-2"
              type="password"
              placeholder="Nhập lại mật khẩu mới"
            />
          </Field>
          <div className="sm:ml-[180px]">
            <Button>
              <KeyRound className="mr-2 h-4 w-4" /> Cập nhật mật khẩu
            </Button>
          </div>
        </div>
      </SectionCard>

      {/* 2FA */}
      <SectionCard title="Đăng nhập 2 lớp (2FA)">
        <div className="flex flex-col gap-2 text-sm">
          <p className="text-muted-foreground">
            Bật xác thực hai bước để tăng cường bảo mật tài khoản của bạn.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button>Thiết lập bằng ứng dụng OTP</Button>
            <Button variant="outline">Thiết lập qua SMS</Button>
          </div>
        </div>
      </SectionCard>

      {/* SESSIONS / DEVICES */}
      <SectionCard title="Phiên đăng nhập & Thiết bị">
        <div className="text-sm text-muted-foreground">
          Quản lý các thiết bị đã đăng nhập (UI demo).
        </div>
        <div className="mt-3 grid gap-2 sm:max-w-2xl">
          {[
            { device: 'Chrome · Windows', where: 'HCM, VN', time: 'Hiện tại' },
            { device: 'Safari · iPhone', where: 'HCM, VN', time: '2 ngày trước' },
          ].map((s, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-lg border bg-muted/30 p-3"
            >
              <div className="text-sm">
                <div className="font-medium">{s.device}</div>
                <div className="text-xs text-muted-foreground">
                  {s.where} · {s.time}
                </div>
              </div>
              <Button variant="outline" size="sm">
                Đăng xuất
              </Button>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
