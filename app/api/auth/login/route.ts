import { NextRequest } from 'next/server';
import { validatePassword, createSession, setSessionCookie } from '@/lib/auth';
import { albumExists } from '@/lib/album-config';

export async function POST(request: NextRequest) {
  try {
    // Get album slug from query parameters
    const { searchParams } = new URL(request.url);
    const albumSlug = searchParams.get('albumSlug');

    const { password } = await request.json();

    if (!password) {
      return Response.json(
        { error: 'Password is required' },
        { status: 400 }
      );
    }

    // Check if album exists (if albumSlug is provided)
    if (albumSlug && !albumExists(albumSlug)) {
      return Response.json(
        { error: 'Album not found' },
        { status: 404 }
      );
    }

    const validationResult = await validatePassword(password, albumSlug || undefined);

    if (!validationResult.authenticated) {
      return Response.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }

    // Create session and set cookie (including albumSlug if provided)
    const sessionToken = await createSession(validationResult.isAdmin, albumSlug || undefined);
    const response = setSessionCookie(sessionToken);

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
