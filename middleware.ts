import { NextRequest, NextResponse } from 'next/server';
import { checkAuthFromRequest, checkAlbumAuthFromRequest } from './lib/auth';
import { albumExists } from './lib/album-config';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for API routes, static files, and non-album routes
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico') ||
    (!pathname.startsWith('/album') && !pathname.startsWith('/auth/album') && !pathname.startsWith('/albums/'))
  ) {
    return NextResponse.next();
  }

  // Extract album slug from /albums/[albumSlug] paths
  const albumsMatch = pathname.match(/^\/albums\/([^/]+)/);
  const albumSlug = albumsMatch ? albumsMatch[1] : null;

  // Check authentication based on route type
  let isAuthenticated: boolean;

  if (albumSlug) {
    // For /albums/[albumSlug] routes, check if album exists first
    if (albumExists(albumSlug)) {
      isAuthenticated = await checkAlbumAuthFromRequest(request, albumSlug);
    } else {
      // Let the page component handle non-existent albums
      return NextResponse.next();
    }
  } else {
    // For legacy /album routes, use legacy authentication
    isAuthenticated = await checkAuthFromRequest(request);
  }

  // Handle album-specific routes
  if (albumSlug) {
    const passwordPath = `/auth/albums/${albumSlug}/password`;
    const albumPath = `/albums/${albumSlug}`;

    // If not authenticated and trying to access album, redirect to password page
    if (!isAuthenticated && pathname === albumPath) {
      const url = request.nextUrl.clone();
      url.pathname = passwordPath;
      return NextResponse.redirect(url);
    }

    // If authenticated and trying to access password page, redirect to album
    if (isAuthenticated && pathname === passwordPath) {
      const url = request.nextUrl.clone();
      url.pathname = albumPath;
      return NextResponse.redirect(url);
    }
  } else {
    // Handle legacy album routes
    if (!isAuthenticated && pathname.startsWith('/album') && pathname !== '/auth/album/password') {
      const url = request.nextUrl.clone();
      url.pathname = '/auth/album/password';
      return NextResponse.redirect(url);
    }

    if (isAuthenticated && pathname === '/auth/album/password') {
      const url = request.nextUrl.clone();
      url.pathname = '/album';
      return NextResponse.redirect(url);
    }
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
