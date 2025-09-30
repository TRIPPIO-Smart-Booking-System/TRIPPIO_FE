'use client';

import { useState } from 'react';

import Button from '@/components/ui/Button';
import PersonalInfo, { Gender, DOB } from './PersonalInfo';
import EmailList, { Email } from './EmailList';
import PhoneList, { Phone } from './PhoneList';
import LinkedProviders, { Linked } from './LinkedProviders';
import SectionCard from '../SectionCard';

export default function ProfileTab() {
  // ===== demo states – thay bằng dữ liệu thật từ API/context
  const [fullName, setFullName] = useState('Hoàng Trí');
  const [gender, setGender] = useState<Gender>('male');
  const [dob, setDob] = useState<DOB>({ d: '15', m: '10', y: '2003' });
  const [city, setCity] = useState('TP. Hồ Chí Minh');

  const [emails, setEmails] = useState<Email[]>([
    { id: 1, address: 'trihoang1510@gmail.com', primary: true, verified: true },
  ]);
  const [phones, setPhones] = useState<Phone[]>([]);

  const linked: Linked[] = [
    { id: 'facebook', name: 'Facebook', connected: false },
    { id: 'google', name: 'Google', connected: true },
    { id: 'line', name: 'LINE', connected: false },
    { id: 'apple', name: 'Apple', connected: false },
    { id: 'naver', name: 'NAVER', connected: false },
  ];

  // ===== Email actions
  const addEmail = (address: string) => {
    setEmails((list) => [
      ...list,
      { id: Math.max(0, ...list.map((e) => e.id)) + 1, address, verified: false },
    ]);
  };
  const makePrimary = (id: number) =>
    setEmails((list) =>
      list
        .map((e) => ({ ...e, primary: e.id === id }))
        .sort((a, b) => (a.primary === b.primary ? 0 : a.primary ? -1 : 1))
    );
  const removeEmail = (id: number) => setEmails((list) => list.filter((e) => e.id !== id));

  // ===== Phone actions
  const addPhone = (number: string) => {
    setPhones((list) => [...list, { id: Math.max(0, ...list.map((p) => p.id)) + 1, number }]);
  };
  const removePhone = (id: number) => setPhones((list) => list.filter((p) => p.id !== id));

  // ===== Save personal info (hook vào API ở đây)
  const savePersonal = () => {
    // call API...
    console.log({ fullName, gender, dob, city });
  };

  return (
    <div className="space-y-6">
      <SectionCard
        title="Dữ liệu cá nhân"
        actions={
          <Button size="sm" onClick={savePersonal}>
            Lưu
          </Button>
        }
      >
        <PersonalInfo
          fullName={fullName}
          onFullName={setFullName}
          gender={gender}
          onGender={setGender}
          dob={dob}
          onDob={setDob}
          city={city}
          onCity={setCity}
        />
      </SectionCard>

      <SectionCard title="Email">
        <EmailList
          emails={emails}
          onAdd={addEmail}
          onMakePrimary={makePrimary}
          onRemove={removeEmail}
        />
      </SectionCard>

      <SectionCard title="Số di động">
        <PhoneList phones={phones} onAdd={addPhone} onRemove={removePhone} />
      </SectionCard>

      <SectionCard title="Tài khoản đã liên kết">
        <LinkedProviders providers={linked} />
      </SectionCard>
    </div>
  );
}
