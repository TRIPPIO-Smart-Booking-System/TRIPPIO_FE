export type User = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  tier?: 'Silver' | 'Gold' | 'Platinum';
  dob?: string; // yyyy-mm-dd
  address?: string;
};

export type Booking = {
  id: string;
  hotelName: string;
  city: string;
  checkIn: string;
  checkOut: string;
  amount: number;
  status: 'Completed' | 'Upcoming' | 'Cancelled';
  image?: string;
};

export type PaymentMethod = {
  id: string;
  brand: 'Visa' | 'Mastercard' | 'JCB' | 'Momo' | 'ZaloPay';
  last4?: string;
  holder?: string;
  isDefault?: boolean;
};

export type Voucher = {
  code: string;
  title: string;
  expiresAt: string; // yyyy-mm-dd
  used?: boolean;
};
