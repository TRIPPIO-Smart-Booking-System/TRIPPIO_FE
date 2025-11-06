// src/app/api/payment/realmoney/route.ts
import { NextRequest, NextResponse } from 'next/server';

type CreatePaymentReq = {
  orderCode: number;
  amount: number;
  description?: string;
  buyerName?: string;
  buyerEmail?: string;
  buyerPhone?: string;
  userId?: string; // nếu muốn dùng cho log nội bộ
  returnUrl?: string | null;
  cancelUrl?: string | null;
};

type PayOSData = {
  id?: string;
  paymentLinkId?: string;
  orderCode?: number;
  amount?: number;
  checkoutUrl?: string;
  qrCode?: string; // URL ảnh QR
};

type PayOSResp = {
  code?: number | string;
  message?: string;
  data?: PayOSData;
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CreatePaymentReq;
    const {
      orderCode,
      amount,
      description,
      buyerName,
      buyerEmail,
      buyerPhone,
      returnUrl,
      cancelUrl,
      // userId, // ← nếu cần, bạn có thể log/ghi DB; bỏ destructure nếu chưa dùng để tránh eslint warning
    } = body;

    if (!orderCode || !amount) {
      return NextResponse.json({ message: 'orderCode và amount là bắt buộc' }, { status: 400 });
    }

    const apiBase = process.env.PAYOS_API_BASE ?? 'https://api.payos.vn/v2';

    // Gọi PayOS bằng fetch (tránh lỗi type với axios)
    const r = await fetch(`${apiBase}/payment-requests`, {
      method: 'POST',
      headers: {
        'x-client-id': process.env.PAYOS_CLIENT_ID ?? '',
        'x-api-key': process.env.PAYOS_API_KEY ?? '',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        orderCode,
        amount,
        description,
        buyerName,
        buyerEmail,
        buyerPhone,
        returnUrl,
        cancelUrl: cancelUrl ?? returnUrl,
      }),
    });

    if (!r.ok) {
      const text = await r.text();
      return NextResponse.json({ message: `PayOS HTTP ${r.status}: ${text}` }, { status: 400 });
    }

    const resp = (await r.json()) as PayOSResp;
    const d = resp?.data ?? {};

    // Chuẩn hoá response cho FE (PaymentModal)
    return NextResponse.json({
      paymentId: d.id ?? d.paymentLinkId ?? null,
      data: {
        checkoutUrl: d.checkoutUrl ?? null,
        qrCode: d.qrCode ?? null,
      },
    });
  } catch (e: unknown) {
    let message = 'Create PayOS failed';
    if (e instanceof Error) message = e.message;
    return NextResponse.json({ message }, { status: 500 });
  }
}
