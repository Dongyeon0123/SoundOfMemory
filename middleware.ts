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

    // 2. 클라이언트 사이드에서 처리하도록 QR 리다이렉트 페이지로 이동
    const destinationUrl = new URL('/qr-redirect', request.url);
    destinationUrl.searchParams.set('shortId', shortId);
    
    return NextResponse.redirect(destinationUrl, { status: 307 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/q/:path*',
};
