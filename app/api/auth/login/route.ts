import { NextRequest } from 'next/server';
import { validatePassword, createSession, setSessionCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!password) {
      return Response.json(
        { error: 'Password is required' },
        { status: 400 }
      );
    }

    const isValid = await validatePassword(password);

    if (!isValid) {
      return Response.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }

    // Create session and set cookie
    const sessionToken = await createSession();
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
