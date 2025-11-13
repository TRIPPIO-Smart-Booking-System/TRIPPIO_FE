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
 *
 * Flow:
 * 1. Frontend sends Google access_token (from implicit flow)
 * 2. This route forwards to C# backend for verification
 * 3. Returns user info + JWT tokens to frontend
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

    console.log('[FE API Route] Received Google token');

    // Get backend URL from env
    let backendUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
    if (!backendUrl) {
      backendUrl = 'https://trippio.azurewebsites.net';
    }

    backendUrl = backendUrl.replace(/\/$/, '');
    const googleVerifyUrl = `${backendUrl}/api/auth/google-verify`;

    console.log('[FE API Route] Backend URL:', backendUrl);
    console.log('[FE API Route] Forwarding to:', googleVerifyUrl);

    // Forward request to backend
    const backendResponse = await fetch(googleVerifyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ token: body.token }),
      signal: AbortSignal.timeout(30000), // 30s timeout
    });

    let responseData: GoogleVerifyResponse;
    try {
      responseData = (await backendResponse.json()) as GoogleVerifyResponse;
    } catch (parseError) {
      console.error('[FE API Route] Failed to parse backend JSON:', parseError);
      const responseText = await backendResponse.text();
      console.error('[FE API Route] Backend response text:', responseText);

      return NextResponse.json(
        {
          isSuccess: false,
          message: `Backend returned invalid JSON: ${backendResponse.statusText}`,
        },
        { status: 502 }
      );
    }

    // If backend failed, return error
    if (!backendResponse.ok) {
      console.error('[FE API Route] Backend error:', {
        status: backendResponse.status,
        statusText: backendResponse.statusText,
        data: responseData,
      });
      return NextResponse.json(
        {
          isSuccess: false,
          message: responseData?.message || `Backend error: ${backendResponse.statusText}`,
        },
        { status: backendResponse.status }
      );
    }

    // Success - return backend response
    console.log('[FE API Route] ✅ Backend success, user:', responseData?.user?.email);
    return NextResponse.json(responseData, { status: 200 });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Lỗi server không xác định';
    const errorStack = error instanceof Error ? error.stack : '';

    console.error('[FE API Route] ❌ Exception:', {
      message: errorMsg,
      stack: errorStack,
      error,
    });

    return NextResponse.json(
      {
        isSuccess: false,
        message: `Lỗi server: ${errorMsg}`,
      },
      { status: 500 }
    );
  }
}
