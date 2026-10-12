import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public paths that do not require web session authentication
  const isPublic =
    pathname.startsWith('/login') ||
    pathname.startsWith('/api/login') ||
    pathname.startsWith('/api/auth/login') ||
    pathname.startsWith('/api/forms/sample-template') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/static');

  if (isPublic) {
    return NextResponse.next();
  }

  // Check web session auth token
  const token = request.cookies.get('auth_token')?.value;

  // If visiting an admin dashboard web page without a token, redirect to login
  if (!token && !pathname.startsWith('/api/')) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
