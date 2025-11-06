// src/app/api/provinces/p/route.ts
import { NextResponse } from 'next/server';

export const runtime = 'nodejs'; // tránh Edge runtime
export const dynamic = 'force-dynamic';

const OPEN = 'https://provinces.open-api.vn/api';

export async function GET() {
  try {
    const url = `${OPEN}/p`;
    console.log('[PROXY] →', url);

    const r = await fetch(url, { cache: 'no-store' });

    // nếu upstream trả non-OK, forward status + body để bạn thấy rõ lỗi
    if (!r.ok) {
      const text = await r.text().catch(() => '');
      console.error('[PROXY] Upstream non-OK:', r.status, text);
      return new NextResponse(text || `Upstream HTTP ${r.status}`, { status: 502 });
    }

    const data = await r.json().catch(() => ({}));
    return NextResponse.json(data, { status: 200 });
  } catch (e) {
    console.error('[PROXY] FAILED:', e);
    return NextResponse.json({ error: 'proxy_failed', detail: String(e) }, { status: 502 });
  }
}
