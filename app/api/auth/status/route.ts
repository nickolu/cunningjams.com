import { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    
    return Response.json({
      authenticated: session?.authenticated || false,
      isAdmin: session?.isAdmin || false,
    });
  } catch (error) {
    console.error('Status check error:', error);
    return Response.json(
      { authenticated: false, isAdmin: false },
      { status: 500 }
    );
  }
}
