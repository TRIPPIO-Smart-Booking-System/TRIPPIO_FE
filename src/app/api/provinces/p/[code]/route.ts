import { NextResponse, type NextRequest } from 'next/server';
import type { RouteContext } from 'next';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const OPEN = 'https://provinces.open-api.vn/api';

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const code = context.params.code as string;
    const url = `${OPEN}/p/${code}?depth=2`;
    console.log('[PROXY] →', url);

    const r = await fetch(url, { cache: 'no-store' });

    if (!r.ok) {
      const text = await r.text().catch(() => '');
      console.error('[PROXY] Upstream non-OK:', r.status, text);
      return new NextResponse(text || `Upstream HTTP ${r.status}`, { status: 502 });
    }

    const data = await r.json().catch(() => ({}));
    return NextResponse.json(data, { status: 200 });
  } catch (e) {
    console.error('[PROXY] FAILED:', e);
    return NextResponse.json(
      { error: 'proxy_failed', detail: String(e) },
      { status: 502 }
    );
  }
}
