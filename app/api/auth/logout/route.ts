import { clearSessionCookie } from '@/lib/auth';

export async function POST() {
  try {
    const response = clearSessionCookie();
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
