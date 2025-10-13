'use client';

import { useEffect, useMemo, useState } from 'react';

import Button from '@/components/ui/Button';
import PersonalInfo, { Gender, DOB } from './PersonalInfo';
import EmailList, { Email } from './EmailList';
import PhoneList, { Phone } from './PhoneList';
import LinkedProviders, { Linked } from './LinkedProviders';
import SectionCard from '../SectionCard';
import { UserResponse, apiUpdateUserById } from '@/lib/api';

function toDobParts(iso?: string | null): DOB {
  if (!iso) return { d: '', m: '', y: '' };
  const dt = new Date(iso);
  if (Number.isNaN(dt.getTime())) return { d: '', m: '', y: '' };
  return {
    d: String(dt.getUTCDate()).padStart(2, '0'),
    m: String(dt.getUTCMonth() + 1).padStart(2, '0'),
    y: String(dt.getUTCFullYear()),
  };
}

function toIso(dob: DOB): string | undefined {
  const { d, m, y } = dob;
  if (!d || !m || !y) return undefined;
  return new Date(Date.UTC(Number(y), Number(m) - 1, Number(d))).toISOString();
}

export default function ProfileTab({
  user,
  onUserChange,
}: {
  user: UserResponse | null;
  onUserChange: (u: UserResponse) => void;
}) {
  // ===== local states (init từ user thực)
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState<Gender>('male'); // (UI demo, chưa map lên API)
  const [dob, setDob] = useState<DOB>({ d: '', m: '', y: '' });
  const [city, setCity] = useState(''); // (UI demo)
  const [emailAddr, setEmailAddr] = useState<string>('');
  const [phones, setPhones] = useState<Phone[]>([]);
  const [avatar, setAvatar] = useState<string>('');

  useEffect(() => {
    if (!user) return;
    setFirstName(user.firstName ?? '');
    setLastName(user.lastName ?? '');
    setDob(toDobParts(user.dob));
    setEmailAddr(user.email ?? '');
    setPhones(user.phoneNumber ? [{ id: 1, number: user.phoneNumber }] : []);
    setAvatar(user.avatar ?? '');
  }, [user?.id]);

  const fullName = useMemo(() => `${firstName} ${lastName}`.trim(), [firstName, lastName]);

  // ===== Email list (map primary = email duy nhất)
  const emails: Email[] = useMemo(
    () =>
      emailAddr
        ? [{ id: 1, address: emailAddr, verified: user?.isEmailVerified, primary: true }]
        : [],
    [emailAddr, user?.isEmailVerified]
  );
  const addEmail = (address: string) => setEmailAddr(address);
  const makePrimary = () => {};
  const removeEmail = () => setEmailAddr('');

  // ===== Phone list (map vào phoneNumber duy nhất)
  const addPhone = (number: string) => setPhones([{ id: 1, number }]);
  const removePhone = () => setPhones([]);

  // ===== GỌI PUT UPDATE PROFILE
  const savePersonal = async () => {
    if (!user) return;
    const body = {
      firstName,
      lastName,
      email: emailAddr || undefined,
      phoneNumber: phones[0]?.number || undefined,
      dob: toIso(dob), // ISO string (UTC)
      avatar: avatar || undefined,
    };
    const updated = await apiUpdateUserById(user.id, body);
    onUserChange(updated);
  };

  const linked: Linked[] = [
    { id: 'google', name: 'Google', connected: !!user?.isEmailVerified },
    { id: 'apple', name: 'Apple', connected: false },
    { id: 'facebook', name: 'Facebook', connected: false },
  ];

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
          onFullName={(v) => {
            // tách fullName thành first/last đơn giản: từ cuối là last name
            const parts = v.trim().split(/\s+/);
            setLastName(parts.pop() ?? '');
            setFirstName(parts.join(' '));
          }}
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
