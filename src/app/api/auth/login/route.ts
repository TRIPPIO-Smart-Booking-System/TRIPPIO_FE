// app/api/admin/auth/login/route.ts
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const body = await req.json();
  // gọi BE thật sự (http://localhost:7142/...) để lấy token
  const r = await fetch('http://localhost:7142/api/admin/auth/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: '*/*' },
    body: JSON.stringify(body),
  });

  const data = await r.json();

  // ví dụ BE trả { accessToken, refreshToken, isSuccess, ... }
  if (data?.accessToken) {
    const jar = await cookies(); // ⚠️ Next 15+ cần await
    jar.set('trippio_session', data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 ngày
    });
  }

  return NextResponse.json(data, { status: r.ok ? 200 : 400 });
}
