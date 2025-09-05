import type { Session } from '@auth/core/types';

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
