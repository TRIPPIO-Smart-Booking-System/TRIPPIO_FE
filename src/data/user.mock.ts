import type { User, Booking, PaymentMethod, Voucher } from './user.types';

export const me: User = {
  id: 'u_001',
  name: 'Nguyễn Minh',
  email: 'minh@example.com',
  phone: '0901234567',
  avatar: '/img/avatars/default.png',
  tier: 'Gold',
  dob: '1996-04-21',
  address: 'Q.1, TP.HCM',
};

export const myBookings: Booking[] = [
  {
    id: 'b_101',
    hotelName: 'Hanoi Pearl Hotel',
    city: 'Hà Nội',
    checkIn: '2025-09-12',
    checkOut: '2025-09-14',
    amount: 2450000,
    status: 'Upcoming',
    image: '/img/hotels/hanoi/pearl1.jpg',
  },
  {
    id: 'b_089',
    hotelName: 'Grand Sea Đà Nẵng',
    city: 'Đà Nẵng',
    checkIn: '2025-07-05',
    checkOut: '2025-07-07',
    amount: 1900000,
    status: 'Completed',
    image: '/img/hotels/danang/grandsea1.jpg',
  },
  {
    id: 'b_075',
    hotelName: 'Blue Pearl Phú Quốc',
    city: 'Phú Quốc',
    checkIn: '2025-05-03',
    checkOut: '2025-05-05',
    amount: 3200000,
    status: 'Cancelled',
    image: '/img/hotels/bluepearl/hero.jpg',
  },
];

export const myPayments: PaymentMethod[] = [
  { id: 'pm_01', brand: 'Visa', last4: '4242', holder: 'NGUYEN MINH', isDefault: true },
  { id: 'pm_02', brand: 'Momo' },
];

export const myVouchers: Voucher[] = [
  { code: 'SUMMER10', title: 'Giảm 10% tối đa 200k', expiresAt: '2025-09-30' },
  { code: 'FREESHIP', title: 'Miễn phí đưa đón sân bay', expiresAt: '2025-08-31', used: true },
];
