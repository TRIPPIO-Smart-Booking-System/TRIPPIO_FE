// src/app/api/payment/vnpay/create/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:7142';
// Cho phép cấu hình path BE để tạo link VNPay
const PAYMENT_CREATE_PATH = process.env.PAYMENT_CREATE_PATH ?? '/api/PaymentWebhook/vnpay/create';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      amountVND,
      amountUSD,
      orderId,
      userId,
      orderInfo,
      returnUrl, // FE path như '/payment/return'
    } = body ?? {};

    if (!amountVND || amountVND <= 0) {
      return NextResponse.json({ message: 'amountVND is required' }, { status: 400 });
    }

    // Build absolute returnUrl cho VNPay
    const origin =
      (req.headers.get('x-forwarded-proto') ?? 'http') +
      '://' +
      (req.headers.get('x-forwarded-host') ?? req.headers.get('host'));
    const absoluteReturnUrl =
      returnUrl && /^https?:\/\//i.test(returnUrl)
        ? returnUrl
        : `${origin}${returnUrl ?? '/payment/return'}`;

    // Lấy access token từ cookie (theo login bạn set trippio_session)
    const jar = await cookies();
    const token = jar.get('trippio_session')?.value;

    // Forward sang BE
    const r = await fetch(`${API_BASE}${PAYMENT_CREATE_PATH}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        amount: amountVND, // đa số BE VNPay dùng VND
        currency: 'VND',
        orderId,
        userId,
        orderInfo,
        returnUrl: absoluteReturnUrl,
        meta: { amountUSD }, // tuỳ BE có lưu/trả lại không
      }),
      cache: 'no-store',
    });

    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      return NextResponse.json(
        { message: data?.message || `BE error ${r.status}` },
        { status: 500 }
      );
    }

    // Chuẩn: trả lại { paymentUrl, paymentId }
    return NextResponse.json(
      {
        paymentUrl: data.paymentUrl ?? data.url ?? data.redirectUrl,
        paymentId: data.paymentId ?? data.id,
      },
      { status: 200 }
    );
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unexpected error';
    return NextResponse.json({ message: msg }, { status: 500 });
  }
}
