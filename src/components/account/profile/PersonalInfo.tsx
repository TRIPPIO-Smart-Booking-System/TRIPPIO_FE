'use client';

import { MapPin } from 'lucide-react';
import Field from '../Field';

export type Gender = 'male' | 'female' | 'other';
export type DOB = { d: string; m: string; y: string };

const ctrl = 'h-10 w-full rounded-lg border px-3 text-sm bg-white';
const selectCtrl = 'h-10 w-full rounded-lg border px-3 pr-8 text-sm bg-white';

export default function PersonalInfo({
  fullName,
  onFullName,
  gender,
  onGender,
  dob,
  onDob,
  city,
  onCity,
}: {
  fullName: string;
  onFullName: (v: string) => void;
  gender: Gender;
  onGender: (v: Gender) => void;
  dob: DOB;
  onDob: (v: DOB) => void;
  city: string;
  onCity: (v: string) => void;
}) {
  const genderOptions: { key: Gender; label: string }[] = [
    { key: 'male', label: 'Nam' },
    { key: 'female', label: 'Nữ' },
    { key: 'other', label: 'Khác' },
  ];

  return (
    <div className="grid gap-4">
      <Field label="Tên đầy đủ" hint="Tên trùng giấy tờ để đặt dịch vụ thuận tiện.">
        <input className={ctrl} value={fullName} onChange={(e) => onFullName(e.target.value)} />
      </Field>

      {/* GIỚI TÍNH – riêng 1 hàng */}
      <Field label="Giới tính">
        <div className="flex items-center gap-4">
          {genderOptions.map((opt) => (
            <label key={opt.key} className="inline-flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="gender"
                className="accent-primary"
                checked={gender === opt.key}
                onChange={() => onGender(opt.key)}
              />
              {opt.label}
            </label>
          ))}
        </div>
      </Field>

      {/* NGÀY SINH – xuống dòng riêng + tiêu đề Ngày/Tháng/Năm */}
      <Field label="Ngày sinh">
        <div className="grid gap-2 sm:grid-cols-3">
          <div>
            <div className="mb-1 text-xs text-muted-foreground">Ngày</div>
            <select
              className={selectCtrl}
              value={dob.d}
              onChange={(e) => onDob({ ...dob, d: e.target.value })}
            >
              {Array.from({ length: 31 }).map((_, i) => (
                <option key={i + 1} value={String(i + 1)}>
                  {i + 1}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="mb-1 text-xs text-muted-foreground">Tháng</div>
            <select
              className={selectCtrl}
              value={dob.m}
              onChange={(e) => onDob({ ...dob, m: e.target.value })}
            >
              {Array.from({ length: 12 }).map((_, i) => (
                <option key={i + 1} value={String(i + 1)}>
                  {`Tháng ${i + 1}`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="mb-1 text-xs text-muted-foreground">Năm</div>
            <select
              className={selectCtrl}
              value={dob.y}
              onChange={(e) => onDob({ ...dob, y: e.target.value })}
            >
              {Array.from({ length: 80 }).map((_, i) => {
                const y = 2025 - i;
                return (
                  <option key={y} value={String(y)}>
                    {y}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
      </Field>

      <Field label="Thành phố cư trú">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <input
            className={ctrl}
            value={city}
            onChange={(e) => onCity(e.target.value)}
            placeholder="TP. Hồ Chí Minh"
          />
        </div>
      </Field>
    </div>
  );
}
