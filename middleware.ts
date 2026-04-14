import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const AUTH_REFRESH_COOKIE = 'rt';

export function middleware(request: NextRequest) {
  const authSession = request.cookies.get(AUTH_REFRESH_COOKIE);

  if (!authSession) {
    const signInUrl = new URL('/auth/sign-in', request.url);
    signInUrl.searchParams.set('returnTo', request.nextUrl.pathname + request.nextUrl.search);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/trip/:path*', '/profile'],
};
