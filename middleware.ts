import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Google 서비스 계정으로 액세스 토큰을 생성하는 함수
async function getAccessToken(): Promise<string> {
  try {
    // 서비스 계정 키 정보 (환경 변수에서 가져옴)
    let privateKey = process.env.FIREBASE_PRIVATE_KEY || process.env.FIREBASE_PRIVATE_KEY_BASE64;
    
    // Base64로 인코딩된 경우 디코딩
    if (privateKey && !privateKey.includes('BEGIN PRIVATE KEY')) {
      try {
        privateKey = Buffer.from(privateKey, 'base64').toString('utf8');
      } catch (e) {
        console.log('미들웨어: Base64 디코딩 실패');
      }
    }
    
    const serviceAccount = {
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      private_key: privateKey?.replace(/\\n/g, '\n'),
      project_id: process.env.FIREBASE_PROJECT_ID,
    };

    if (!serviceAccount.client_email || !serviceAccount.private_key || !serviceAccount.project_id) {
      throw new Error('Firebase 서비스 계정 정보가 누락되었습니다.');
    }

    // JWT 생성을 위한 헤더와 클레임
    const now = Math.floor(Date.now() / 1000);
    const header = {
      alg: 'RS256',
      typ: 'JWT',
    };

    const payload = {
      iss: serviceAccount.client_email,
      scope: 'https://www.googleapis.com/auth/datastore',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600,
      iat: now,
    };

    // 간단한 JWT 생성 (실제 환경에서는 jose 라이브러리 사용 권장)
    const { importPKCS8, SignJWT } = await import('jose');
    const cryptoKey = await importPKCS8(serviceAccount.private_key, 'RS256');
    
    const jwt = await new SignJWT(payload)
      .setProtectedHeader(header)
      .sign(cryptoKey);

    // Google OAuth2 토큰 엔드포인트에 JWT로 액세스 토큰 요청
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error(`토큰 요청 실패: ${tokenResponse.status}`);
    }

    const tokenData = await tokenResponse.json();
    return tokenData.access_token;
  } catch (error) {
    console.error('액세스 토큰 생성 실패:', error);
    throw error;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. /q/ 경로의 요청만 처리
  if (pathname.startsWith('/q/')) {
    const shortId = pathname.split('/q/')[1];
    
    if (!shortId) {
      return NextResponse.redirect(new URL('/error?code=INVALID_QR', request.url));
    }

    try {
      // 환경 변수 체크 (배포에서는 항상 fallback 사용)
      const hasAllEnvVars = process.env.FIREBASE_PROJECT_ID && 
                           process.env.FIREBASE_CLIENT_EMAIL && 
                           (process.env.FIREBASE_PRIVATE_KEY || process.env.FIREBASE_PRIVATE_KEY_BASE64);
      
      if (!hasAllEnvVars) {
        console.error('Firebase 환경 변수가 설정되지 않음. QR 리다이렉트 페이지로 fallback');
        const destinationUrl = new URL('/qr-redirect', request.url);
        destinationUrl.searchParams.set('shortId', shortId);
        return NextResponse.redirect(destinationUrl);
      }

      // 2. Firestore REST API로 qrRedirects 컬렉션 조회
      const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${process.env.FIREBASE_PROJECT_ID}/databases/(default)/documents/qrRedirects/${shortId}`;

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
      const ownerUserId = data.fields?.ownerUserId?.stringValue;

      if (!ownerUserId) {
        console.error('QR 매핑에서 ownerUserId를 찾을 수 없음:', data);
        return NextResponse.redirect(new URL('/error?code=INVALID_QR_DATA', request.url));
      }

      // 3. 게스트 프로필 페이지로 리다이렉트 (QR에서 온 것을 표시)
      const destinationUrl = new URL(`/guest-profile/${ownerUserId}`, request.url);
      destinationUrl.searchParams.set('from', 'qr');
      destinationUrl.searchParams.set('source', shortId);
      
      return NextResponse.redirect(destinationUrl);

    } catch (error) {
      console.error('QR 리다이렉트 미들웨어 에러:', error);
      // 에러 발생 시 QR 리다이렉트 페이지로 fallback
      const destinationUrl = new URL('/qr-redirect', request.url);
      destinationUrl.searchParams.set('shortId', shortId);
      return NextResponse.redirect(destinationUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/q/:path*',
};
