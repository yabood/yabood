import type { APIRoute } from 'astro';

const COOKIE_NAME = 'previewDrafts';
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export const POST: APIRoute = async ({ request, cookies, locals }) => {
  const user = locals.user;

  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const body = await request.json().catch(() => ({}));
  const enabled = Boolean(body?.enabled);

  cookies.set(COOKIE_NAME, enabled ? 'true' : 'false', {
    httpOnly: false,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE,
  });

  return new Response(JSON.stringify({ success: true, enabled }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
