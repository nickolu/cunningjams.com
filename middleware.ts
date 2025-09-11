import { NextRequest, NextResponse } from 'next/server';
import { checkAuthFromRequest } from './lib/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for API routes, static files, and non-album routes
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico') ||
    (!pathname.startsWith('/album') && !pathname.startsWith('/auth/album'))
  ) {
    return NextResponse.next();
  }

  // Check if user is authenticated for album access
  const isAuthenticated = await checkAuthFromRequest(request);

  // If not authenticated and trying to access album routes, redirect to password page
  if (!isAuthenticated && pathname.startsWith('/album') && pathname !== '/auth/album/password') {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/album/password';
    return NextResponse.redirect(url);
  }

  // If authenticated and trying to access password page, redirect to album
  if (isAuthenticated && pathname === '/auth/album/password') {
    const url = request.nextUrl.clone();
    url.pathname = '/album';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
