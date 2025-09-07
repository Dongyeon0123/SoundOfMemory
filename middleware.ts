import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. /q/ 경로의 요청만 처리
  if (pathname.startsWith('/q/')) {
    const shortId = pathname.split('/q/')[1];
    
    if (!shortId) {
      return NextResponse.redirect(new URL('/error?code=INVALID_QR', request.url));
    }

    try {
      // 2. Firestore REST API로 qrMappings 컬렉션 조회
      const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${process.env.FIREBASE_PROJECT_ID}/databases/(default)/documents/qrMappings/${shortId}`;
      
      // 서버에서만 사용할 액세스 토큰 필요
      const accessToken = await getAccessToken();
      
      const response = await fetch(firestoreUrl, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      
      if (!response.ok) {
        console.error('Firestore API 호출 실패:', response.status, await response.text());
        return NextResponse.redirect(new URL('/error?code=QR_NOT_FOUND', request.url));
      }

      const data = await response.json();
      
      // REST API 응답 구조에 맞게 필드 파싱
      const ownerUserId = data.fields?.ownerUserId?.stringValue;
      const isActive = data.fields?.isActive?.booleanValue;

      if (ownerUserId && isActive) {
        // 3. /guest-profile/{ownerId}로 리다이렉트
        const destinationUrl = new URL(`/guest-profile/${ownerUserId}`, request.url);
        destinationUrl.searchParams.set('from', 'qr');
        destinationUrl.searchParams.set('source', shortId);
        
        return NextResponse.redirect(destinationUrl, { status: 307 });
      }

      return NextResponse.redirect(new URL('/error?code=INVALID_QR_DATA', request.url));
      
    } catch (error) {
      console.error('QR Redirect Middleware Error:', error);
      return NextResponse.redirect(new URL('/error?code=MIDDLEWARE_FAILED', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/q/:path*',
};

// --- Helper Functions ---
// 서비스 계정을 사용하여 동적으로 액세스 토큰을 생성하는 함수
async function getAccessToken(): Promise<string> {
  // 임시로 환경 변수에서 토큰을 가져옵니다
  // 실제 환경에서는 google-auth-library 등을 사용하여 구현해야 합니다
  const token = process.env.FIREBASE_ACCESS_TOKEN;
  
  if (!token) {
    throw new Error('FIREBASE_ACCESS_TOKEN environment variable is not set');
  }
  
  return token;
}
