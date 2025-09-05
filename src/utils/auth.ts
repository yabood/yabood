import type { Session } from '@auth/core/types';
import jwt from 'jsonwebtoken';

export type UserRole = 'user' | 'admin';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  provider: string;
}

interface VerifyTokenResponse {
  valid: boolean;
  user?: any;
  error?: string;
}

interface SaveProfileResponse {
  success: boolean;
  profile?: any;
  error?: string;
}

export async function verifyToken(token: string): Promise<VerifyTokenResponse> {
  const lambdaUrl = import.meta.env.LAMBDA_VERIFY_URL;

  if (!lambdaUrl) {
    return { valid: false, error: 'Lambda URL not configured' };
  }

  try {
    const response = await fetch(lambdaUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token,
        action: 'verify',
      }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    return { valid: false, error: 'Verification failed' };
  }
}

export async function saveUserProfile(token: string, profile: any): Promise<SaveProfileResponse> {
  const lambdaUrl = import.meta.env.LAMBDA_VERIFY_URL;

  if (!lambdaUrl) {
    return { success: false, error: 'Lambda URL not configured' };
  }

  try {
    const response = await fetch(lambdaUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token,
        action: 'saveProfile',
        profile,
      }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    return { success: false, error: 'Save failed' };
  }
}

export function getSessionFromCookie(request: Request): Session | null {
  const cookies = request.headers.get('cookie');
  if (!cookies) return null;

  const sessionCookie = cookies
    .split(';')
    .find((c) => c.trim().startsWith('next-auth.session-token='));

  if (!sessionCookie) return null;

  try {
    const sessionData = sessionCookie.split('=')[1];
    return JSON.parse(decodeURIComponent(sessionData));
  } catch {
    return null;
  }
}

export function getUserFromToken(token: string): AuthUser | null {
  try {
    const secret = process.env.AUTH_SECRET || import.meta.env.AUTH_SECRET;
    if (!secret) return null;

    const decoded = jwt.verify(token, secret) as any;
    return {
      id: decoded.userId,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role,
      provider: decoded.provider,
    };
  } catch {
    return null;
  }
}

export function hasRole(user: AuthUser | null, requiredRole: UserRole): boolean {
  if (!user) return false;

  // Admin has access to everything
  if (user.role === 'admin') return true;

  // Check specific role
  return user.role === requiredRole;
}

export function isAdmin(user: AuthUser | null): boolean {
  return hasRole(user, 'admin');
}

export function isUser(user: AuthUser | null): boolean {
  return user !== null && (user.role === 'user' || user.role === 'admin');
}

export function requireRole(user: AuthUser | null, requiredRole: UserRole): void {
  if (!hasRole(user, requiredRole)) {
    throw new Error(`Access denied. Required role: ${requiredRole}`);
  }
}

export function requireAdmin(user: AuthUser | null): void {
  requireRole(user, 'admin');
}
