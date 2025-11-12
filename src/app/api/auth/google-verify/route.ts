import { postJSON } from '@/lib/http';
import { NextRequest, NextResponse } from 'next/server';

interface GoogleVerifyRequest {
  token: string;
}

interface GoogleVerifyResponse {
  isSuccess?: boolean;
  message?: string;
  accessToken?: string;
  refreshToken?: string;
  user?: {
    id: string;
    email: string;
    userName?: string;
    roles?: string[];
  };
  [key: string]: unknown;
}

/**
 * POST /api/auth/google-verify
 * Nhận JWT từ FE (Google), gửi lên Backend để verify + sinh JWT riêng
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as GoogleVerifyRequest;

    if (!body.token) {
      return NextResponse.json(
        { isSuccess: false, message: 'Token không hợp lệ' },
        { status: 400 }
      );
    }

    // Gửi token lên Backend ASP.NET
    // Backend sẽ verify chữ ký Google, create/get user, return JWT riêng
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://trippio.azurewebsites.net';
    const response = await postJSON<GoogleVerifyResponse>(`${backendUrl}/api/auth/google-verify`, {
      token: body.token,
    });

    // Trả về response từ backend cho FE
    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error: unknown) {
    console.error('Google verify error:', error);

    const errorMsg = error instanceof Error ? error.message : 'Lỗi khi xác thực Google';

    return NextResponse.json({ isSuccess: false, message: errorMsg }, { status: 500 });
  }
}
