// app/page.tsx
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function Home() {
  const jar = await cookies(); // ✅ có await
  const token = jar.get('trippio_session')?.value;

  if (token) redirect('/homepage'); // đã đăng nhập
  redirect('/homepage'); // chưa đăng nhập
}
