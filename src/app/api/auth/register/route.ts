import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs'; // dùng Node runtime để gọi HTTP ổn định

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();

    const upstream = await fetch(`${process.env.BACKEND_URL}/api/admin/auth/register`, {
      method: 'POST',
      headers: {
        accept: '*/*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    // Có backend trả text/JSON không đồng nhất → đọc text rồi thử parse
    const raw = await upstream.text();
    let data: unknown;
    try {
      data = raw ? JSON.parse(raw) : null;
    } catch {
      data = raw || null;
    }

    // Forward status + body từ backend
    return NextResponse.json(data, { status: upstream.status });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Upstream register proxy failed';
    return NextResponse.json({ message }, { status: 500 });
  }
}
