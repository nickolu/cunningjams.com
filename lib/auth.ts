import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const JWT_SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || 'fallback-secret-key'
);

const ALBUM_PASSWORD = process.env.ALBUM_PASSWORD || 'colorado2025';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin2025';
const SESSION_COOKIE_NAME = 'album-session';
const SESSION_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

export interface SessionPayload {
  authenticated: boolean;
  isAdmin: boolean;
  expiresAt: Date;
  [key: string]: any; // Add index signature for JWT compatibility
}

/**
 * Validates the provided password against the configured album password
 * Returns an object indicating authentication status and admin rights
 */
export async function validatePassword(password: string): Promise<{ authenticated: boolean; isAdmin: boolean }> {
  try {
    // Check if password matches admin password
    if (password === ADMIN_PASSWORD) {
      return { authenticated: true, isAdmin: true };
    }
    
    // Check if password matches regular album password
    if (password === ALBUM_PASSWORD) {
      return { authenticated: true, isAdmin: false };
    }
    
    return { authenticated: false, isAdmin: false };
  } catch (error) {
    console.error('Password validation error:', error);
    return { authenticated: false, isAdmin: false };
  }
}

/**
 * Creates a JWT session token
 */
export async function createSession(isAdmin: boolean = false): Promise<string> {
  const payload: SessionPayload = {
    authenticated: true,
    isAdmin,
    expiresAt: new Date(Date.now() + SESSION_DURATION),
  };

  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(JWT_SECRET);

  return token;
}

/**
 * Verifies a JWT session token
 */
export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const sessionPayload = payload as unknown as SessionPayload;
    
    // Check if session has expired
    if (new Date() > new Date(sessionPayload.expiresAt)) {
      return null;
    }
    
    return sessionPayload;
  } catch (error) {
    console.error('Session verification error:', error);
    return null;
  }
}

/**
 * Sets the session cookie
 */
export function setSessionCookie(token: string): NextResponse {
  const response = NextResponse.json({ success: true });
  
  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION / 1000, // Convert to seconds
    path: '/',
  });

  return response;
}

/**
 * Removes the session cookie
 */
export function clearSessionCookie(): NextResponse {
  const response = NextResponse.json({ success: true });
  
  response.cookies.delete(SESSION_COOKIE_NAME);
  
  return response;
}

/**
 * Gets the current session from cookies (server-side)
 */
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
  
  if (!sessionCookie) {
    return null;
  }
  
  return verifySession(sessionCookie.value);
}

/**
 * Checks if the current request is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return session?.authenticated === true;
}

/**
 * Checks if the current request has admin privileges
 */
export async function isAdmin(): Promise<boolean> {
  const session = await getSession();
  return session?.authenticated === true && session?.isAdmin === true;
}

/**
 * Middleware helper to check authentication from request
 */
export async function checkAuthFromRequest(request: NextRequest): Promise<boolean> {
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);
  
  if (!sessionCookie) {
    return false;
  }
  
  const session = await verifySession(sessionCookie.value);
  return session?.authenticated === true;
}
