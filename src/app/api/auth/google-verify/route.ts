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
 * Frontend proxy route: Google JWT → Backend ASP.NET → return JWT
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as GoogleVerifyRequest;

    if (!body?.token) {
      return NextResponse.json(
        { isSuccess: false, message: 'Token không hợp lệ' },
        { status: 400 }
      );
    }

    // Get backend URL from env or use default
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://trippio.azurewebsites.net';
    const googleVerifyUrl = new URL('/api/auth/google-verify', backendUrl).toString();

    console.log('[FE API Route] Forwarding to:', googleVerifyUrl);

    // Forward request to backend
    const backendResponse = await fetch(googleVerifyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token: body.token }),
    });

    const responseData = (await backendResponse.json()) as GoogleVerifyResponse;

    // If backend failed, return error
    if (!backendResponse.ok) {
      console.error('[FE API Route] Backend error:', backendResponse.status, responseData);
      return NextResponse.json(
        {
          isSuccess: false,
          message: responseData?.message || 'Backend xác thực thất bại',
        },
        { status: backendResponse.status }
      );
    }

    // Success - return backend response
    console.log('[FE API Route] Backend success, user:', responseData?.user?.email);
    return NextResponse.json(responseData, { status: 200 });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Lỗi server';
    console.error('[FE API Route] Exception:', errorMsg, error);

    return NextResponse.json(
      { isSuccess: false, message: `Lỗi xác thực: ${errorMsg}` },
      { status: 500 }
    );
  }
}
