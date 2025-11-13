import { NextRequest, NextResponse } from 'next/server';

interface GoogleVerifyRequest {
  token?: string;
  code?: string;
}

interface GoogleTokenResponse {
  access_token: string;
  id_token: string;
  expires_in: number;
  token_type: string;
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
 * Accepts either:
 * 1. token (ID token from implicit flow)
 * 2. code (authorization code from auth-code flow)
 *
 * Flow:
 * 1. If code: exchange it for tokens with Google, extract ID token
 * 2. If token: use directly
 * 3. Forward ID token to C# backend for verification
 * 4. Returns user info + JWT tokens to frontend
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as GoogleVerifyRequest;

    if (!body?.token && !body?.code) {
      return NextResponse.json(
        { isSuccess: false, message: 'Token hoặc code không hợp lệ' },
        { status: 400 }
      );
    }

    console.log('[FE API Route] Received Google request:', {
      hasToken: !!body.token,
      hasCode: !!body.code,
    });

    let idToken = body.token;

    // If code is provided, exchange it for tokens
    if (body.code && !body.token) {
      console.log('[FE API Route] Exchanging authorization code for tokens');

      const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
      const redirectUri = process.env.NEXT_PUBLIC_BASE_URL
        ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/google-verify`
        : 'http://localhost:3000/api/auth/google-verify';

      if (!googleClientId || !googleClientSecret) {
        console.error('[FE API Route] Missing Google credentials');
        return NextResponse.json(
          { isSuccess: false, message: 'Server configuration error' },
          { status: 500 }
        );
      }

      try {
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            code: body.code,
            client_id: googleClientId,
            client_secret: googleClientSecret,
            redirect_uri: redirectUri,
            grant_type: 'authorization_code',
          }).toString(),
        });

        if (!tokenResponse.ok) {
          const errorText = await tokenResponse.text();
          console.error('[FE API Route] Failed to exchange code:', errorText.substring(0, 200));
          return NextResponse.json(
            { isSuccess: false, message: 'Failed to exchange authorization code with Google' },
            { status: 400 }
          );
        }

        const googleTokens = (await tokenResponse.json()) as GoogleTokenResponse;
        idToken = googleTokens.id_token;

        if (!idToken) {
          console.error('[FE API Route] No ID token in Google response');
          return NextResponse.json(
            { isSuccess: false, message: 'No ID token received from Google' },
            { status: 400 }
          );
        }

        console.log('[FE API Route] ✅ Successfully exchanged code for ID token');
      } catch (exchangeError) {
        console.error('[FE API Route] Error exchanging code:', exchangeError);
        return NextResponse.json(
          { isSuccess: false, message: 'Failed to exchange authorization code' },
          { status: 500 }
        );
      }
    }

    // Now forward ID token to C# backend for verification
    console.log('[FE API Route] Forwarding ID token to backend');

    // Get backend URL from env
    let backendUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
    if (!backendUrl) {
      backendUrl = 'https://trippiowebapp.azurewebsites.net';
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
      body: JSON.stringify({ token: idToken }),
      signal: AbortSignal.timeout(30000), // 30s timeout
    });

    console.log('[FE API Route] Backend response status:', backendResponse.status);

    let responseText = '';
    try {
      responseText = await backendResponse.text();
      const responseData = JSON.parse(responseText) as GoogleVerifyResponse;

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
    } catch (parseError) {
      console.error('[FE API Route] Failed to parse backend response:', {
        status: backendResponse.status,
        statusText: backendResponse.statusText,
        error: parseError,
        textPreview: responseText.substring(0, 200),
      });

      return NextResponse.json(
        {
          isSuccess: false,
          message: `Backend returned invalid response: ${backendResponse.statusText}`,
        },
        { status: 502 }
      );
    }
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : '';

    console.error('[FE API Route] ❌ Exception:', {
      message: errorMsg,
      stack: errorStack,
      error,
    });

    return NextResponse.json(
      {
        isSuccess: false,
        message: `Server error: ${errorMsg}`,
      },
      { status: 500 }
    );
  }
}
